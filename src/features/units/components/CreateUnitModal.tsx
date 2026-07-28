"use client";

import { useEffect, useState } from "react";
import { useCreateUnit, useUnits, useUpdateUnit } from '../hooks/useUnits';
import { X, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { Unit } from "../unit.types";

type Props = {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  unitToEdit?: Unit | null;
};

type DifficultyLevel = "low" | "medium" | "hard";

const LEVEL_LABELS: Record<DifficultyLevel, string> = {
  low: "Fácil",
  medium: "Intermedio",
  hard: "Avanzado",
};

const LEVEL_ORDER: DifficultyLevel[] = ["low", "medium", "hard"];

export default function CreateUnitModal({ visible, onClose, courseId, unitToEdit }: Props) {
  const { mutate: createUnit, isPending: isCreating } = useCreateUnit();
  const { mutate: updateUnit, isPending: isUpdating } = useUpdateUnit();
  const { data: units } = useUnits(courseId);

  const isPending = isCreating || isUpdating;

  const [level, setLevel] = useState<DifficultyLevel>("low");
  const [unitName, setUnitName] = useState("");
  const [orderIndex, setOrderIndex] = useState("1");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (visible) {
      if (unitToEdit) {
        setUnitName(unitToEdit.name);
        setLevel(unitToEdit.difficulty as DifficultyLevel);
        setOrderIndex(unitToEdit.order_index.toString());
      } else {
        setOrderIndex(units ? (units.length + 1).toString() : "1");
        setUnitName("");
        setLevel("low");
      }
      setHasError(false);
    }
  }, [visible, units, unitToEdit]);

  if (!visible) return null;

  const handleOrderIndexChange = (text: string) => {
    setOrderIndex(text);
    setHasError(text !== "" && !/^\d+$/.test(text));
  };

  const handleSave = () => {
    if (!unitName.trim() || hasError || !orderIndex) return;

    if (unitToEdit && unitToEdit.id) {
      updateUnit(
        {
          id: unitToEdit.id,
          unit: {
            name: unitName,
            order_index: parseInt(orderIndex) || unitToEdit.order_index,
            difficulty: level,
          },
        },
        { onSuccess: onClose },
      );
    } else {
      createUnit(
        {
          id_course: courseId,
          name: unitName,
          order_index: parseInt(orderIndex) || (units?.length || 0) + 1,
          difficulty: level,
        },
        { onSuccess: onClose },
      );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 relative animate-scale-up text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {unitToEdit ? "Edit Unit" : "Create New Unit"}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-55 transition-all duration-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">Unit Name</label>
            <input
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all duration-200 text-sm"
              placeholder="e.g. Past Simple & Vocabulary"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">Order of unit</label>
            <input
              className={`w-full bg-slate-50 border text-slate-900 rounded-xl p-3 placeholder-slate-400 focus:ring-1 outline-none transition-all duration-200 text-sm ${
                hasError 
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" 
                  : "border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
              }`}
              placeholder="Ej: 1"
              value={orderIndex}
              onChange={(e) => handleOrderIndexChange(e.target.value)}
              inputMode="numeric"
              disabled={isPending}
            />
            {hasError && (
              <div className="flex items-center space-x-1.5 text-rose-500 text-xs mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Solo se permiten números en este campo</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">Difficulty</label>
              <span className="text-xs font-bold text-slate-600">
                Nivel: <span className="text-cyan-600 font-extrabold">{LEVEL_LABELS[level]}</span>
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2.5">
              {LEVEL_ORDER.map((option) => {
                const isActive = level === option;
                let activeClasses = "";
                if (isActive) {
                  if (option === "low") activeClasses = "bg-lime-500/10 text-lime-700 border-lime-300 shadow-sm";
                  if (option === "medium") activeClasses = "bg-cyan-500/10 text-cyan-700 border-cyan-300 shadow-sm";
                  if (option === "hard") activeClasses = "bg-amber-500/10 text-amber-700 border-amber-300 shadow-sm";
                } else {
                  activeClasses = "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-350 hover:text-slate-700";
                }

                return (
                  <button
                    key={option}
                    type="button"
                    className={`py-3 rounded-xl border font-bold text-xs capitalize transition-all duration-200 cursor-pointer ${activeClasses}`}
                    onClick={() => setLevel(option)}
                    disabled={isPending}
                  >
                    {LEVEL_LABELS[option]}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 font-semibold">
              Select the difficulty level of the class
            </p>
          </div>
        </div>

        {/* Action row */}
        <div className="flex justify-end space-x-3.5 pt-2">
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isPending}
            disabled={isPending || hasError || !unitName.trim()}
            className="min-w-[120px]"
          >
            {unitToEdit ? "Save Changes" : "Create Unit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
