"use client";

import { useEffect, useState } from "react";
import { useCourses } from "../hooks/useCourses";
import { X, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function CreateCourseModal({ visible, onClose }: Props) {
  const { grades, createCourse, isLoading } = useCourses();
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sortedGrades = [...grades].sort((a, b) => {
    const numA = parseInt(a.abbreviation) || 0;
    const numB = parseInt(b.abbreviation) || 0;
    return numA - numB;
  });

  useEffect(() => {
    if (visible) {
      setAcademicLevel("");
      setClassName("");
      setDescription("");
      setError(null);
    }
  }, [visible]);

  if (!visible) return null;

  const handleCreate = async () => {
    if (!className.trim() || !academicLevel) {
      setError("Completa el nombre de la clase y selecciona un nivel.");
      return;
    }

    const result = await createCourse(className, academicLevel, description);
    if (result.success) {
      onClose();
    } else {
      setError(result.error || "No se pudo crear el curso");
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
            New Class
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-605 p-1.5 rounded-lg hover:bg-slate-50 transition-all duration-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
              Class Name
            </label>
            <input
              className="w-full bg-slate-55 border border-slate-200 text-slate-900 rounded-xl p-3 placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all duration-200 disabled:opacity-50 text-sm"
              placeholder="e.g. History of Arts or English Basic 1"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
              Academic Level
            </label>
            <select
              className="w-full bg-slate-55 border border-slate-200 text-slate-705 rounded-xl p-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all duration-200 disabled:opacity-50 text-sm cursor-pointer"
              value={academicLevel}
              onChange={(e) => setAcademicLevel(e.target.value)}
              disabled={isLoading}
            >
              <option value="" className="text-slate-400">
                Select a level
              </option>
              {sortedGrades.map((grade) => (
                <option
                  key={grade.id}
                  value={grade.id}
                  className="text-slate-700"
                >
                  {grade.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
              Description
            </label>
            <textarea
              className="w-full bg-slate-55 border border-slate-200 text-slate-900 rounded-xl p-3 placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all duration-200 disabled:opacity-50 text-sm min-h-[100px] resize-y"
              placeholder="Brief class summary or requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-rose-55 border border-rose-100 text-rose-600">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3.5 pt-2">
          <Button variant="outlined" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            isLoading={isLoading}
            disabled={!className.trim() || !academicLevel}
            className="min-w-[120px]"
          >
            Create Course
          </Button>
        </div>
      </div>
    </div>
  );
}
