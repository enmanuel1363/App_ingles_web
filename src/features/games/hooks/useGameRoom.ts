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

  // Subscribe to changes in realtime
  useEffect(() => {
    if (!room?.id) return;

    const channel = supabase
      .channel(`game_room:${room.id}`)
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
