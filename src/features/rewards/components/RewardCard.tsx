"use client";

import React, { useState } from "react";
import { Gift, Trash2, Edit2, Award, ExternalLink } from "lucide-react";
import Button from "@/components/ui/Button";
import { RewardWithGoal } from "../rewards.types";
import { useModal } from "@/components/ui/ModalProvider";

interface RewardCardProps {
  reward: RewardWithGoal;
  onEdit: (reward: RewardWithGoal) => void;
  onDelete: (id: string) => void;
}

export default function RewardCard({ reward, onEdit, onDelete }: RewardCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirm } = useModal();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Eliminar recompensa",
      description: `¿Estás seguro de que deseas eliminar la recompensa "${reward.name}"?`,
      variant: "danger",
    });
    if (confirmed) {
      setIsDeleting(true);
      try {
        await onDelete(reward.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group h-full">
      {/* Image Preview Container */}
      <div className="relative aspect-square w-full bg-slate-50 flex items-center justify-center p-6 border-b border-slate-100 group-hover:bg-slate-100/50 transition-colors duration-300">
        {reward.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={reward.url}
            alt={reward.name}
            className="max-w-full max-h-full object-contain drop-shadow-md rounded-lg group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300">
            <Gift className="w-16 h-16 stroke-[1.5]" />
            <span className="text-xs font-semibold mt-2">Sin imagen</span>
          </div>
        )}
        
        {/* Type Badge */}
        <span className={`absolute top-4 left-4 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm ${
          reward.type === "gif" 
            ? "bg-purple-100 text-purple-700 border border-purple-200" 
            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
        }`}>
          {reward.type}
        </span>
      </div>

      {/* Content Container */}
      <div className="p-5 flex flex-col flex-grow space-y-4">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-lg leading-tight tracking-tight line-clamp-1 group-hover:text-primary-dark transition-colors duration-200">
            {reward.name}
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Creado el {new Date(reward.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Goal Association */}
        <div className="flex-grow">
          {reward.goal ? (
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
              <Award className="w-4.5 h-4.5 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                  Objetivo Asociado
                </p>
                <p className="text-xs font-bold text-slate-700 truncate mt-0.5">
                  {reward.goal.name}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic flex items-center space-x-1.5 py-1">
              <span>No vinculada a ningún objetivo</span>
            </div>
          )}
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <Button
            variant="outlined"
            onClick={() => onEdit(reward)}
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
    </div>
  );
}
