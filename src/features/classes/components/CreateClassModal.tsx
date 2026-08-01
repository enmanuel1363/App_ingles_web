"use client";

import { useEffect, useState } from "react";
import { class_type } from "@/types/global.types";
import { useCreateClass, useUpdateClass } from '../hooks/useClasses';
import { ClassModel, CreateClassDTO } from '../class.types';
import { X, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";

type Props = {
  visible: boolean;
  onClose: () => void;
  id_unit: string;
  nextOrderIndex: number;
  classToEdit?: ClassModel | null;
};

const CLASS_TYPE_OPTIONS: { label: string; value: class_type; icon: string }[] = [
  { label: "Mix", value: "mix", icon: "♾️" },
  { label: "Reading", value: "read", icon: "📖" },
  { label: "Writing", value: "write", icon: "✏️" },
  { label: "Speaking", value: "speak", icon: "🎙️" },
];

export default function CreateClassModal({
  visible,
  onClose,
  id_unit,
  nextOrderIndex,
  classToEdit,
}: Props) {
  const { mutateAsync: createClassMutation, isPending: isCreating } = useCreateClass();
  const { mutateAsync: updateClassMutation, isPending: isUpdating } = useUpdateClass();
  const isPending = isCreating || isUpdating;

  const [name, setName] = useState("");
  const [type, setType] = useState<class_type>("mix");
  const [orderIndex, setOrderIndex] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const totalClasses = classToEdit ? nextOrderIndex - 1 : nextOrderIndex;
  const orderOptions = Array.from({ length: totalClasses }, (_, i) => i + 1);

  useEffect(() => {
    if (visible) {
      if (classToEdit) {
        setName(classToEdit.name);
        setType(classToEdit.type);
        setOrderIndex(classToEdit.order_index);
      } else {
        setName("");
        setType("mix");
        setOrderIndex(nextOrderIndex);
      }
      setError(null);
    }
  }, [visible, classToEdit, nextOrderIndex]);

  if (!visible) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter a name for the class.");
      return;
    }

    try {
      if (classToEdit) {
        await updateClassMutation({
          ...classToEdit,
          name: name.trim(),
          type,
          order_index: orderIndex,
        });
      } else {
        const newClass: CreateClassDTO = {
          id_unit,
          name: name.trim(),
          type,
          order_index: nextOrderIndex,
        };
        await createClassMutation(newClass);
      }
      onClose();
    } catch {
      setError(
        classToEdit ? "Failed to update the class" : "Failed to create the class",
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
            {classToEdit ? "Edit Lesson" : "Create New Lesson"}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-655 p-1.5 rounded-lg hover:bg-slate-50 transition-all duration-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">Lesson Name</label>
            <input
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all duration-200 text-sm"
              placeholder="E.g., Introduction to the Verb To Be"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">Class Type</label>
            <select
              className="w-full bg-slate-50 border border-slate-200 text-slate-750 rounded-xl p-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all duration-200 disabled:opacity-50 text-sm cursor-pointer"
              value={type}
              onChange={(e) => setType(e.target.value as class_type)}
              disabled={isPending}
            >
              {CLASS_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="text-slate-700">
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
          </div>

          {classToEdit && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
                Lesson Position
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 text-slate-750 rounded-xl p-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all duration-200 disabled:opacity-50 text-sm cursor-pointer"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                disabled={isPending}
              >
                {orderOptions.map((num) => (
                  <option key={num} value={num} className="text-slate-700">
                    Position {num}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
        )}

        {/* Actions */}
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
            disabled={isPending || !name.trim()}
            className="min-w-[120px]"
          >
            {classToEdit ? "Save Changes" : "Create Class"}
          </Button>
        </div>
      </div>
    </div>
  );
}
