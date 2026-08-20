"use client";

import React, { useState } from "react";
import { useGetGames, useDeleteGame } from "../hooks/useGames";
import { useCreateRoom } from "../hooks/useGameRoom";
import { Game } from "../games.types";
import GameCard from "./GameCard";
import GameRoomHost from "./GameRoomHost";
import GameCreator from "./GameCreator";
import Button from "@/components/ui/Button";
import AlertModal from "@/components/ui/AlertModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import {
  Gamepad2,
  Plus,
  Sparkles,
  X,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

interface GameManagerProps {
  currentTeacherProfileId: string; // The logged-in teacher's ID
}

export default function GameManager({
  currentTeacherProfileId,
}: GameManagerProps) {
  const { data: games = [], isLoading, error, refetch } = useGetGames();
  const { initializeRoom, loading: startingRoom } = useCreateRoom();
  const deleteGameMutation = useDeleteGame();
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [activeSoloGameId, setActiveSoloGameId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);

  // Modal states
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title?: string;
    message: string;
    type?: "success" | "error" | "info";
  }>({ visible: false, message: "" });

  const [confirmConfig, setConfirmConfig] = useState<{
    visible: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "primary" | "secondary";
    onConfirm: () => void;
  }>({
    visible: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const handleCreateRoom = async (gameId: string) => {
    try {
      const room = await initializeRoom(gameId, currentTeacherProfileId);
      if (room && room.room_code) {
        setActiveRoomCode(room.room_code);
      }
    } catch (err) {
      setAlertConfig({
        visible: true,
        title: "Lobby Error",
        message:
          "Error generating multiplayer game room lobby. Please check connection.",
        type: "error",
      });
    }
  };

  const handlePlaySolo = (gameId: string) => {
    setActiveSoloGameId(gameId);
  };

  const handleEditGame = (game: Game) => {
    if (game.id) {
      setEditingGameId(game.id);
    }
  };

  const handleDeleteGame = (gameId: string) => {
    setConfirmConfig({
      visible: true,
      title: "Delete Game",
      description:
        "Are you sure you want to permanently delete this game? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteGameMutation.mutateAsync(gameId);
          setAlertConfig({
            visible: true,
            title: "Success",
            message: "Game successfully deleted.",
            type: "success",
          });
        } catch (err) {
          setAlertConfig({
            visible: true,
            title: "Error",
            message: "Failed to delete game. Please check your connection.",
            type: "error",
          });
        }
      },
    });
  };

  if (activeRoomCode) {
    return (
      <div className="py-6 px-4 bg-[#fffcf2] min-h-screen">
        <GameRoomHost
          roomCode={activeRoomCode}
          onClose={() => {
            setActiveRoomCode(null);
            refetch();
          }}
        />
      </div>
    );
  }

  if (isCreating || editingGameId) {
    return (
      <GameCreator
        teacherId={currentTeacherProfileId}
        editingGameId={editingGameId || undefined}
        onClose={() => {
          setIsCreating(false);
          setEditingGameId(null);
          refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4">
      {/* Header section with Premium Light Theme styling */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Game Center & Multiplayer Lobbies
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Create, manage, and launch multiplayer competitions for your
            students to play on their mobile apps.
          </p>
        </div>
        <div>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreating(true)}
            className="text-slate-950 font-black shadow-sm"
          >
            Crear Juego
          </Button>
        </div>
      </div>

      {/* Games List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-2xl h-[200px]"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center p-8 bg-white border border-slate-100 rounded-2xl">
          <p className="text-rose-500 font-bold text-sm">
            Failed to retrieve games from database.
          </p>
        </div>
      ) : games.length === 0 ? (
        <div className="text-center p-12 bg-white border border-slate-100 rounded-2xl max-w-md mx-auto">
          <Gamepad2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h4 className="text-base font-black text-slate-800">
            No Games Published Yet
          </h4>
          <p className="text-slate-500 text-xs mt-1 mb-6">
            Click the button above to publish your first game and add challenge
            questions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPlay={handlePlaySolo}
              onCreateRoom={handleCreateRoom}
              onEdit={handleEditGame}
              onDelete={handleDeleteGame}
            />
          ))}
        </div>
      )}

      {/* Solo Play Preview Modal */}
      {activeSoloGameId && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl relative border border-slate-100">
            <button
              onClick={() => setActiveSoloGameId(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-4 py-4">
              <Gamepad2 className="w-12 h-12 text-tertiary mx-auto animate-bounce" />
              <h3 className="text-lg font-black text-slate-900">
                Solo Play Preview
              </h3>
              <p className="text-slate-550 text-xs leading-relaxed">
                Solo games must be played from the Student Mobile App. Please
                log in with your credentials on the mobile application to start
                playing this challenge arena.
              </p>
              <div className="pt-4">
                <Button
                  variant="primary"
                  onClick={() => setActiveSoloGameId(null)}
                  className="w-full text-slate-900 font-extrabold"
                >
                  Understood
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert & Confirmation Modals */}
      <AlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />

      <ConfirmationModal
        visible={confirmConfig.visible}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        variant={confirmConfig.variant}
        onConfirm={() => {
          setConfirmConfig((prev) => ({ ...prev, visible: false }));
          confirmConfig.onConfirm();
        }}
        onClose={() =>
          setConfirmConfig((prev) => ({ ...prev, visible: false }))
        }
      />
    </div>
  );
}
