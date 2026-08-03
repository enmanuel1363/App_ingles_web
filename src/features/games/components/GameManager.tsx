"use client";

import React, { useState } from "react";
import { useGetGames } from "../hooks/useGames";
import { useCreateRoom } from "../hooks/useGameRoom";
import GameCard from "./GameCard";
import GameRoomHost from "./GameRoomHost";
import GameCreator from "./GameCreator";
import Button from "@/components/ui/Button";
import { Gamepad2, Plus, Sparkles, X, ChevronRight, HelpCircle } from "lucide-react";

interface GameManagerProps {
  currentTeacherProfileId: string; // The logged-in teacher's ID
}

export default function GameManager({ currentTeacherProfileId }: GameManagerProps) {
  const { data: games = [], isLoading, error, refetch } = useGetGames();
  const { initializeRoom, loading: startingRoom } = useCreateRoom();
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [activeSoloGameId, setActiveSoloGameId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async (gameId: string) => {
    try {
      const room = await initializeRoom(gameId, currentTeacherProfileId);
      if (room && room.room_code) {
        setActiveRoomCode(room.room_code);
      }
    } catch (err) {
      alert("Error generating multiplayer game room lobby. Please check connection.");
    }
  };

  const handlePlaySolo = (gameId: string) => {
    setActiveSoloGameId(gameId);
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

  if (isCreating) {
    return (
      <GameCreator
        teacherId={currentTeacherProfileId}
        onClose={() => {
          setIsCreating(false);
          refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6 px-4">
      {/* Header section with Premium Light Theme styling */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-black text-[#24DFE2] uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-[#FF9400] animate-bounce" />
            <span>Interactive Arenas</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Game Center & Multiplayer Lobbies
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Create, manage, and launch multiplayer competitions for your students to play on their mobile apps.
          </p>
        </div>
        <div>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreating(true)}
            className="text-slate-950 font-black shadow-sm"
          >
            Create New Game
          </Button>
        </div>
      </div>


      {/* Info Warning banner about Mobile execution */}
      <div className="bg-[#B4FF2B]/10 border border-[#B4FF2B]/35 rounded-2xl p-5 flex items-start gap-4">
        <Gamepad2 className="w-6 h-6 text-slate-800 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-black text-slate-900">Mobile First Games Restriction</h4>
          <p className="text-xs text-slate-650 leading-relaxed">
            Note: These games are designed to be played on the <strong>Student Mobile App</strong>. The web dashboard is used to build games and host live multiplayer (Kahoot-style) rooms where the question projector is displayed on screen while students select answers on their phones.
          </p>
        </div>
      </div>

      {/* Games List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl h-[200px]" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center p-8 bg-white border border-slate-100 rounded-2xl">
          <p className="text-rose-500 font-bold text-sm">Failed to retrieve games from database.</p>
        </div>
      ) : games.length === 0 ? (
        <div className="text-center p-12 bg-white border border-slate-100 rounded-2xl max-w-md mx-auto">
          <Gamepad2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h4 className="text-base font-black text-slate-800">No Games Published Yet</h4>
          <p className="text-slate-500 text-xs mt-1 mb-6">
            Click the button above to publish your first game and add challenge questions.
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
              <Gamepad2 className="w-12 h-12 text-[#FF9400] mx-auto animate-bounce" />
              <h3 className="text-lg font-black text-slate-900">Solo Play Preview</h3>
              <p className="text-slate-550 text-xs leading-relaxed">
                Solo games must be played from the Student Mobile App. Please log in with your credentials on the mobile application to start playing this challenge arena.
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
    </div>
  );
}
