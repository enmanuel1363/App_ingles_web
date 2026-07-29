"use client";

import React, { useState } from "react";
import { Target, Trash2, Edit2, Award, Info } from "lucide-react";
import Button from "@/components/ui/Button";
import { GoalWithReward } from "../goals.types";
import { useModal } from "@/components/ui/ModalProvider";

interface GoalCardProps {
  goal: GoalWithReward;
  onEdit: (goal: GoalWithReward) => void;
  onDelete: (id: string) => void;
}

// Mapea el tipo de objetivo a un string más legible
function formatGoalType(type: string): string {
  const types: Record<string, string> = {
    points: "Puntos de Experiencia (XP)",
    lesson: "Lecciones completadas",
    time: "Tiempo récord por lección",
    classes: "Clases completadas",
    collection: "Colección de palabras",
    streak: "Días de Racha",
    approvals: "Lecciones aprobadas",
    ranking: "Puesto en la Liga",
    hearts: "Corazones conservados",
  };
  return types[type] || type;
}

// Asigna un color al badge según el tipo de objetivo
function getGoalTypeBadgeClass(type: string): string {
  const classes: Record<string, string> = {
    points: "bg-cyan-50 text-cyan-700 border-cyan-100",
    lesson: "bg-emerald-50 text-emerald-700 border-emerald-100",
    time: "bg-amber-50 text-amber-700 border-amber-100",
    classes: "bg-indigo-50 text-indigo-700 border-indigo-100",
    streak: "bg-orange-50 text-orange-700 border-orange-100",
  };
  return classes[type] || "bg-slate-50 text-slate-700 border-slate-100";
}

export default function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirm } = useModal();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Eliminar objetivo",
      description: `¿Estás seguro de que deseas eliminar el objetivo "${goal.name}"?`,
      variant: "danger",
    });
    if (confirmed) {
      setIsDeleting(true);
      try {
        await onDelete(goal.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Obtener la meta numérica del campo validation usando la clave del tipo de objetivo
  let targetValue = 0;
  if (goal.validation && typeof goal.validation === "object") {
    const val = goal.validation as any;
    targetValue = val[goal.type] !== undefined ? val[goal.type] : (val.target || 0);
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group">
      <div className="space-y-4">
        {/* Header (Icon and Type Badge) */}
        <div className="flex justify-between items-start gap-2">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${getGoalTypeBadgeClass(goal.type)}`}>
            {goal.type}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-1.5">
          <h3 className="font-bold text-slate-900 text-lg leading-tight tracking-tight line-clamp-1 group-hover:text-primary-dark transition-colors duration-200">
            {goal.name}
          </h3>
          <p className="text-xs text-slate-550 leading-relaxed font-semibold line-clamp-2 min-h-[32px]">
            {goal.description || "Sin descripción proporcionada."}
          </p>
        </div>

        {/* Validation Target detail */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-center justify-between shadow-inner">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500">
              {goal.type === "lesson" || goal.type === "classes" ? "Asociado a:" : "Meta Requerida:"}
            </span>
          </div>
          <span className="text-xs font-extrabold text-slate-800 text-right truncate max-w-[180px]" title={goal.targetLabel || ""}>
            {goal.type === "lesson" || goal.type === "classes" 
              ? (goal.targetLabel || "No especificado")
              : `${targetValue} ${goal.type === "points" ? "XP" : goal.type === "time" ? "Segs" : "veces"}`}
          </span>
        </div>

        {/* Associated Reward section */}
        <div className="pt-2">
          {goal.reward ? (
            <div className="flex items-center space-x-3 bg-gradient-to-tr from-amber-500/5 to-yellow-500/5 border border-amber-500/10 rounded-xl p-3 shadow-sm">
              {goal.reward.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={goal.reward.url}
                  alt={goal.reward.name}
                  className="w-10 h-10 object-contain rounded-lg bg-white border border-amber-500/10 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 shrink-0 border border-amber-200">
                  <Award className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-extrabold text-amber-700 uppercase tracking-widest leading-none">
                  Recompensa Entregada
                </p>
                <p className="text-xs font-bold text-slate-800 truncate mt-1">
                  {goal.reward.name}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic bg-slate-50/50 border border-slate-100 border-dashed rounded-xl p-3 text-center">
              Sin recompensa asociada
            </div>
          )}
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between gap-2 pt-4 mt-5 border-t border-slate-100">
        <Button
          variant="outlined"
          onClick={() => onEdit(goal)}
          className="flex-1 py-2 px-3 rounded-lg text-xs"
          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
        >
          Editar
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          isLoading={isDeleting}
          className="py-2 px-3 rounded-lg text-xs hover:bg-rose-600"
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
}
