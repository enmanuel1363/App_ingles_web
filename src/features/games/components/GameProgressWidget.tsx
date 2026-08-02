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
  // Generate array for the slots (e.g. [0, 1, 2, 3, 4, 5, 6, 7])
  const slots = Array.from({ length: maxExercises }, (_, i) => i);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col space-y-4 self-start">
      <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
        <div className="p-2.5 bg-[#B4FF2B]/20 rounded-xl text-slate-900 shrink-0">
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
          <span className="bg-[#24DFE2]/20 text-slate-900 px-2.5 py-1 rounded-lg text-xs">
            {exercisesCount} / {maxExercises}
          </span>
        </div>

        {/* Graphical Dots Grid in its own card space */}
        <div className="bg-[#fffcf2] border border-slate-200/50 rounded-xl p-4 flex flex-col items-center space-y-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Active Layout
          </span>
          <div className="grid grid-cols-4 gap-3">
            {slots.map((num) => {
              const isActive = num < exercisesCount;
              return (
                <div
                  key={num}
                  className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-black transition-all duration-300 ${
                    isActive
                      ? "bg-[#24DFE2] border-[#24DFE2] text-slate-900 shadow-sm shadow-[#24DFE2]/25 scale-105"
                      : "bg-white border-slate-200 text-slate-400"
                  }`}
                  title={`Exercise Slot ${num + 1}`}
                >
                  {num + 1}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-[10px] text-slate-450 leading-relaxed text-center font-medium italic">
          {exercisesCount === 0
            ? "Add your first challenge to start filling the arena slots!"
            : exercisesCount < maxExercises
            ? `You have ${maxExercises - exercisesCount} slots remaining.`
            : "Arena is fully charged! Ready to publish."}
        </p>
      </div>
    </div>
  );
}
