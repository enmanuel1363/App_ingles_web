"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getGames,
  getGameById,
  getExercisesByGameId,
  createGameWithExercises,
  createStudentGameLog,
  getStudentGameLogs,
  updateGameWithExercises,
  deleteGame,
} from "../services/games.service";
import { CreateGameDTO, CreateExerciseGameDTO, CreateGameStudentLogDTO } from "../games.types";

/**
 * Hook to retrieve all active games.
 */
export const useGetGames = () => {
  return useQuery({
    queryKey: ["games"],
    queryFn: getGames,
  });
};

/**
 * Hook to retrieve a single game by its ID.
 */
export const useGetGameById = (gameId: string) => {
  return useQuery({
    queryKey: ["games", gameId],
    queryFn: () => getGameById(gameId),
    enabled: !!gameId,
  });
};

/**
 * Hook to retrieve all exercises for a specific game.
 */
export const useGetExercisesByGame = (gameId: string) => {
  return useQuery({
    queryKey: ["exercises", "by-game", gameId],
    queryFn: () => getExercisesByGameId(gameId),
    enabled: !!gameId,
  });
};

/**
 * Hook to create a game with exercises in a batch.
 */
export const useCreateGameWithExercises = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      game,
      exercises,
    }: {
      game: CreateGameDTO;
      exercises: Omit<CreateExerciseGameDTO, "id_game">[];
    }) => createGameWithExercises(game, exercises),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
    onError: (error) => {
      console.error("Error creating game with exercises:", error);
    },
  });
};

/**
 * Hook to log a student's completion of a game.
 */
export const useCreateStudentGameLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (log: CreateGameStudentLogDTO) => createStudentGameLog(log),
    onSuccess: (_, log) => {
      queryClient.invalidateQueries({
        queryKey: ["student-game-logs", log.id_student_profile],
      });
    },
    onError: (error) => {
      console.error("Error logging student game completion:", error);
    },
  });
};

/**
 * Hook to retrieve completion logs for a student.
 */
export const useGetStudentGameLogs = (studentProfileId: string) => {
  return useQuery({
    queryKey: ["student-game-logs", studentProfileId],
    queryFn: () => getStudentGameLogs(studentProfileId),
    enabled: !!studentProfileId,
  });
};

/**
 * Hook to update an existing game with its exercises in a batch.
 */
export const useUpdateGameWithExercises = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gameId,
      game,
      exercises,
    }: {
      gameId: string;
      game: Partial<CreateGameDTO>;
      exercises: Omit<CreateExerciseGameDTO, "id_game">[];
    }) => updateGameWithExercises(gameId, game, exercises),
    onSuccess: (_, { gameId }) => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["games", gameId] });
      queryClient.invalidateQueries({ queryKey: ["exercises", "by-game", gameId] });
    },
    onError: (error) => {
      console.error("Error updating game with exercises:", error);
    },
  });
};

/**
 * Hook to delete a game by ID.
 */
export const useDeleteGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: string) => deleteGame(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
    onError: (error) => {
      console.error("Error deleting game:", error);
    },
  });
};

