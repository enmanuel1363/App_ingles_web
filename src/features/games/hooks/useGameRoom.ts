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

export const useGameRoom = (roomCode?: string) => {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [players, setPlayers] = useState<string[]>([]);

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

  // Subscribe to changes in realtime (Postgres changes AND Presence on dual channels)
  useEffect(() => {
    if (!room?.id) return;

    // We subscribe to both channels to support mobile apps using either format:
    // 1. game_room_presence:${room.id}
    // 2. game_room:${room.id}
    const dbChannel = supabase.channel(`game_room:${room.id}`);
    const presenceChannel = supabase.channel(`game_room_presence:${room.id}`);

    const updateCombinedPlayers = () => {
      const joinedPlayers = new Set<string>();

      // Extract from dbChannel presence state
      const dbState = dbChannel.presenceState();
      Object.keys(dbState).forEach((key) => {
        const presences = dbState[key] as any[];
        presences.forEach((p) => {
          if (p.username && p.role !== "host") {
            joinedPlayers.add(p.username);
          }
        });
      });

      // Extract from presenceChannel presence state
      const presenceState = presenceChannel.presenceState();
      Object.keys(presenceState).forEach((key) => {
        const presences = presenceState[key] as any[];
        presences.forEach((p) => {
          if (p.username && p.role !== "host") {
            joinedPlayers.add(p.username);
          }
        });
      });

      setPlayers(Array.from(joinedPlayers));
    };

    // Sub to postgres changes and presence on dbChannel
    dbChannel
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
        updateCombinedPlayers();
      });

    // Sub to presence on presenceChannel
    presenceChannel.on("presence", { event: "sync" }, () => {
      updateCombinedPlayers();
    });

    // Subscribe to both
    dbChannel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await dbChannel.track({ role: "host", username: "Teacher (Host)" });
      }
    });

    presenceChannel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await presenceChannel.track({ role: "host", username: "Teacher (Host)" });
      }
    });

    return () => {
      supabase.removeChannel(dbChannel);
      supabase.removeChannel(presenceChannel);
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
