"use client";

import { useRouter } from "next/navigation";
import GradeIcon from './GradeIcon';
import { ArrowRight, Edit2, Trash2 } from "lucide-react";

type Props = {
  id: string;
  title: string;
  grade: string;
  students: number;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function CourseCard({ id, title, grade, students, onEdit, onDelete }: Props) {
  const router = useRouter();

  // Custom colors for avatars to make it look premium on light theme
  const avatarColors = [
    "bg-cyan-500/20 border-white text-cyan-700",
    "bg-lime-500/20 border-white text-lime-700",
    "bg-indigo-500/20 border-white text-indigo-750",
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-cyan-400 hover:shadow-md hover:shadow-cyan-400/5 transition-all duration-300 group flex flex-col justify-between min-h-[160px]">
      <div className="flex justify-between items-start space-x-4 w-full">
        <div className="space-y-1.5 flex-grow min-w-0">
          <h3 className="text-base font-bold text-slate-800 group-hover:text-slate-950 transition-colors line-clamp-2 leading-snug">
            {title}
          </h3>
          <p className="text-xs font-semibold text-slate-500">
            Nivel: {grade}
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="text-slate-400 hover:text-cyan-600 p-1 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                title="Editar curso"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                title="Eliminar curso"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <GradeIcon grade={grade} />
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
        {/* Avatars showing student quantity */}
        <div className="flex items-center -space-x-2">
          <div className={`w-7 h-7 rounded-full border-2 ${avatarColors[0]} flex items-center justify-center text-[10px] font-bold`}>A</div>
          <div className={`w-7 h-7 rounded-full border-2 ${avatarColors[1]} flex items-center justify-center text-[10px] font-bold`}>B</div>
          <div className="w-7 h-7 rounded-full border-2 bg-slate-100 border-white flex items-center justify-center text-[9px] font-bold text-slate-600">
            +{students}
          </div>
        </div>

        <button
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-600 hover:text-cyan-700 hover:bg-cyan-500/5 transition-all duration-200 cursor-pointer"
          onClick={() =>
            router.push(
              `/courses/${id}/units?courseTitle=${encodeURIComponent(title)}`,
            )
          }
        >
          <span>Ver clase</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
