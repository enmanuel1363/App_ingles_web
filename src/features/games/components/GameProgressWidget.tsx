"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface GameProgressWidgetProps {
  exercisesCount: number;
  maxExercises?: number;
}

export default function GameProgressWidget({
  exercisesCount,
  maxExercises = 8,
}: GameProgressWidgetProps) {
  const slots = Array.from({ length: maxExercises }, (_, i) => i);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col space-y-4 self-start">
      <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
        <div className="p-2.5 bg-secondary/20 rounded-xl text-slate-900 shrink-0">
          <Sparkles className="w-5 h-5 text-slate-900 animate-pulse" />
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Arena Progress
          </h4>
          <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
            Challenge Slots
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm font-extrabold text-slate-800">
          <span>Exercises:</span>
          <span className="bg-primary/20 text-slate-900 px-2.5 py-1 rounded-lg text-xs">
            {exercisesCount} / {maxExercises}
          </span>
        </div>
      </div>
    </div>
  );
}
