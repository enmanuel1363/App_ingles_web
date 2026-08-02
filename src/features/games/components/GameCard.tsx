"use client";

import React from "react";
import { Game } from "../games.types";
import Button from "@/components/ui/Button";
import { PenTool, Volume2, Mic, Gamepad2, Users, Play } from "lucide-react";

interface GameCardProps {
  game: Game;
  onPlay: (gameId: string) => void;
  onCreateRoom?: (gameId: string) => void;
  showAdminActions?: boolean;
}

export default function GameCard({
  game,
  onPlay,
  onCreateRoom,
  showAdminActions = false,
}: GameCardProps) {
  // Select matching icon and background color for the game type
  const getTypeConfig = (type: string) => {
    switch (type) {
      case "write":
        return {
          icon: <PenTool className="w-5 h-5 text-slate-900" />,
          colorBg: "bg-[#24DFE2]/20 text-slate-900",
          label: "Written Challenge",
        };
      case "listen":
        return {
          icon: <Volume2 className="w-5 h-5 text-slate-900" />,
          colorBg: "bg-[#B4FF2B]/25 text-slate-900",
          label: "Listening Challenge",
        };
      case "speak":
        return {
          icon: <Mic className="w-5 h-5 text-slate-900" />,
          colorBg: "bg-[#FF9400]/20 text-orange-950",
          label: "Speaking Challenge",
        };
      default:
        return {
          icon: <Gamepad2 className="w-5 h-5 text-slate-900" />,
          colorBg: "bg-slate-100 text-slate-900",
          label: "Mixed Challenge",
        };
    }
  };

  const config = getTypeConfig(game.type);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Header: Type Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center space-x-2 px-3  py-1.5 rounded-full text-xs font-bold ${config.colorBg}`}>
            {config.icon}
            <span>{config.label}</span>
          </div>
          {game.is_active ? (
            <span className="h-2 w-2 rounded-full bg-[#B4FF2B] animate-pulse" />
          ) : (
            <span className="text-xs text-slate-400 font-semibold">Inactive</span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-extrabold text-[#0f172a] mb-2 leading-tight">
          {game.name}
        </h3>
        <p className="text-sm text-slate-500 mb-6 line-clamp-3 leading-relaxed">
          {game.description || "Challenge yourself and improve your skills with this dynamic game!"}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-2 mt-auto">
        <Button
          variant="primary"
          leftIcon={<Play className="w-4 h-4 fill-slate-950" />}
          onClick={() => game.id && onPlay(game.id)}
          className="w-full text-slate-950 font-extrabold"
        >
          Solo Play
        </Button>

        {onCreateRoom && (
          <Button
            variant="outlined"
            leftIcon={<Users className="w-4 h-4" />}
            onClick={() => game.id && onCreateRoom(game.id)}
            className="w-full font-bold border-slate-200"
          >
            Create Competition Room
          </Button>
        )}
      </div>
    </div>
  );
}
