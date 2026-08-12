"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { GameRoom, GameRoomStatus } from "../games.types";
import {
  getGameRoomByCode,
  updateGameRoomStatus,
  updateGameRoomQuestionIndex,
  createGameRoom,
} from "../services/games.service";

export interface PlayerPresence {
  username: string;
  score: number;
  avatar_url?: string;
  joined_at?: string;
}

export const useGameRoom = (roomCode?: string) => {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [players, setPlayers] = useState<PlayerPresence[]>([]);

  // Fetch room initially
  const fetchRoom = useCallback(async () => {
    if (!roomCode) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getGameRoomByCode(roomCode);
      setRoom(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching game room:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  // Subscribe to changes in realtime (Postgres changes AND Presence on a single channel)
  useEffect(() => {
    if (!room?.id) return;

    // Single channel for both Presence and Postgres database changes
    const roomChannel = supabase.channel(`game_room:${room.id}`);

    const updatePlayers = () => {
      const joinedPlayersMap = new Map<string, PlayerPresence>();
      const presenceState = roomChannel.presenceState();
      
      Object.keys(presenceState).forEach((key) => {
        const presences = presenceState[key] as any[];
        presences.forEach((p) => {
          if (p.username && p.role !== "host") {
            joinedPlayersMap.set(p.username, {
              username: p.username,
              score: p.score || 0,
              avatar_url: p.avatar_url,
              joined_at: p.joined_at,
            });
          }
        });
      });

      // Sort descending by score
      const sortedPlayers = Array.from(joinedPlayersMap.values()).sort(
        (a, b) => b.score - a.score
      );

      setPlayers(sortedPlayers);
    };

    // Subscribe to database changes and presence events on the same channel
    roomChannel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_room",
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          setRoom(payload.new as GameRoom);
        }
      )
      .on("presence", { event: "sync" }, () => {
        updatePlayers();
      });

    // Subscribe and track the host (teacher) presence
    roomChannel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await roomChannel.track({ role: "host", username: "Teacher (Host)" });
      }
    });

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [room?.id]);

  // Host Action: Start the game / change status
  const changeStatus = async (status: GameRoomStatus) => {
    if (!room?.id) return;
    try {
      const updated = await updateGameRoomStatus(room.id, status);
      setRoom(updated);
    } catch (err: any) {
      console.error("Error changing room status:", err);
      throw err;
    }
  };

  // Host Action: Go to next question
  const changeQuestionIndex = async (index: number) => {
    if (!room?.id) return;
    try {
      const updated = await updateGameRoomQuestionIndex(room.id, index);
      setRoom(updated);
    } catch (err: any) {
      console.error("Error advancing question index:", err);
      throw err;
    }
  };

  return {
    room,
    loading,
    error,
    players,
    refreshRoom: fetchRoom,
    changeStatus,
    changeQuestionIndex,
  };
};

/**
 * Hook/helper to initialize a new game room.
 */
export const useCreateRoom = () => {
  const [loading, setLoading] = useState(false);

  const initializeRoom = async (gameId: string, hostId: string) => {
    setLoading(true);
    try {
      // Generate a 6-digit alphanumeric room code (e.g. AB12CD)
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const newRoom = await createGameRoom({
        room_code: roomCode,
        id_game: gameId,
        host_id: hostId,
        status: "waiting",
        current_question_index: 0,
        settings: {},
      });
      return newRoom;
    } catch (err) {
      console.error("Failed to initialize game room:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    initializeRoom,
    loading,
  };
};
