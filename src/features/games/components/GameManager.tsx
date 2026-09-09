import React from "react";
import Link from "next/link";
import { Game } from "../games.types";
import GameCard from "./GameCard";
import { Gamepad2, Plus } from "lucide-react";

interface GameManagerProps {
  games: Game[];
  currentTeacherProfileId: string;
}

export default function GameManager({
  games,
  currentTeacherProfileId,
}: GameManagerProps) {
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
          <Link
            href="/games/create"
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-black text-sm bg-primary hover:bg-primary-dark text-slate-950 shadow-sm transition-all duration-200 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Juego</span>
          </Link>
        </div>
      </div>

      {/* Games List Grid */}
      {games.length === 0 ? (
        <div className="text-center p-12 bg-white border border-slate-100 rounded-2xl max-w-md mx-auto">
          <Gamepad2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h4 className="text-base font-black text-slate-800">
            No Games Published Yet
          </h4>
          <p className="text-slate-500 text-xs mt-1 mb-6">
            Click the button below to publish your first game and add challenge
            questions.
          </p>
          <Link
            href="/games/create"
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-primary hover:bg-primary-dark text-slate-950 shadow-sm transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Primer Juego</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              teacherId={currentTeacherProfileId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
