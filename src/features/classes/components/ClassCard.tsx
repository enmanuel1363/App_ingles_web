"use client";

import { class_type } from "@/types/global.types";
import { Edit2, Trash2, Book, PenTool, Mic, Infinity } from "lucide-react";

type Props = {
  id?: string;
  name: string;
  type: class_type;
  order_index: number;
  created_at?: string;
  updated_at?: string;
  onPress: (id: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

const ICONS: Record<class_type, React.ReactNode> = {
  mix: <Infinity className="w-5 h-5" />,
  read: <Book className="w-5 h-5" />,
  write: <PenTool className="w-5 h-5" />,
  speak: <Mic className="w-5 h-5" />,
};

const TYPE_COLORS: Record<class_type, string> = {
  mix: "text-indigo-750 bg-indigo-50 border-indigo-200/50 shadow-sm",
  read: "text-cyan-750 bg-cyan-50 border-cyan-200/50 shadow-sm",
  write: "text-amber-750 bg-amber-50 border-amber-200/50 shadow-sm",
  speak: "text-emerald-750 bg-emerald-50 border-emerald-200/50 shadow-sm",
};

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ClassCard({
  id,
  name,
  order_index,
  type,
  created_at,
  onPress,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-cyan-400 hover:shadow-md hover:shadow-cyan-400/5 transition-all duration-300 group flex items-center justify-between min-h-[120px]">
      <button 
        className="flex items-start space-x-4 flex-1 text-left cursor-pointer focus:outline-none min-w-0" 
        onClick={() => onPress(id || "")}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 group-hover:scale-105 transition-all duration-200 ${TYPE_COLORS[type]}`}>
          {ICONS[type]}
        </div>
        
        <div className="space-y-1.5 flex-1 min-w-0 pr-4">
          <h3 className="text-base font-bold text-slate-800 group-hover:text-slate-950 transition-colors line-clamp-2 leading-snug break-words">
            {`${order_index}. ${name}`}
          </h3>
          <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-slate-500">
            <span>Creada:</span>
            <span className="text-slate-650">{formatDate(created_at || "")}</span>
          </div>
        </div>
      </button>

      {/* Action buttons */}
      <div className="flex items-center space-x-2 shrink-0">
        <button
          className="p-2 rounded-xl border border-slate-200 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-600 hover:bg-cyan-500/5 transition-all duration-200 cursor-pointer bg-white shadow-sm"
          onClick={onEdit}
          title="Editar clase"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          className="p-2 rounded-xl border border-slate-200 hover:border-rose-500/30 text-slate-400 hover:text-rose-600 hover:bg-rose-500/5 transition-all duration-200 cursor-pointer bg-white shadow-sm"
          onClick={onDelete}
          title="Eliminar clase"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
