"use client";

import { BookOpen } from "lucide-react";

type Props = {
  order?: number;
  name: string;
  difficulty: string;
  onPress?: () => void;
};

const DIFFICULTY_CONFIG: Record<
  string,
  { level: number; colorClass: string; label: string }
> = {
  low: {
    level: 1,
    colorClass: "bg-lime-400 shadow-[0_0_8px_rgba(180,255,43,0.2)]",
    label: "Fácil",
  },
  medium: {
    level: 2,
    colorClass: "bg-cyan-400 shadow-[0_0_8px_rgba(36,223,226,0.2)]",
    label: "Intermedio",
  },
  hard: {
    level: 3,
    colorClass: "bg-amber-400 shadow-[0_0_8px_rgba(255,148,0,0.2)]",
    label: "Avanzado",
  },
};

export default function UnitCard({ order, name, difficulty, onPress }: Props) {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.low;

  return (
    <button
      className="w-full text-left bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-cyan-400 hover:shadow-md hover:shadow-cyan-400/5 transition-all duration-300 group flex flex-col justify-between min-h-[160px] cursor-pointer focus:outline-none"
      onClick={onPress}
    >
      <div className="flex items-start space-x-4 w-full">
        <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex justify-center items-center shrink-0 group-hover:scale-105 group-hover:bg-cyan-500/10 transition-all duration-200">
          <BookOpen className="w-5 h-5 text-cyan-600" />
        </div>

        <div className="space-y-1.5 flex-1">
          <p className="text-xs font-bold text-cyan-600 uppercase tracking-wider">
            Unidad {order}
          </p>
          <h3 className="text-base font-bold text-slate-800 group-hover:text-slate-950 transition-colors line-clamp-2 leading-snug">
            {name}
          </h3>
        </div>
      </div>

      {/* Difficulty segment bars */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 w-full">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Dificultad: {config.label}
          </p>
          <div className="flex space-x-1.5 w-16">
            {[1, 2, 3].map((segmentIndex) => {
              const isActive = config.level >= segmentIndex;
              return (
                <div
                  key={segmentIndex}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                    isActive ? config.colorClass : "bg-slate-200"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </button>
  );
}
