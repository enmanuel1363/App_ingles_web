"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  GraduationCap,
  Plus,
  Trash2,
  RefreshCw,
  Check,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { StudentProfile, Grade, StudentGradeAssignment } from "../students.types";

interface EditStudentGradeModalProps {
  visible: boolean;
  onClose: () => void;
  student: StudentProfile | null;
  grades: Grade[];
  onAddGrade: (studentId: string, gradeId: string) => Promise<void>;
  onUpdateGradeAssignment: (assignmentId: string, newGradeId: string) => Promise<void>;
  onRemoveGradeAssignment: (assignmentId: string) => Promise<void>;
  isLoading?: boolean;
}

export default function EditStudentGradeModal({
  visible,
  onClose,
  student,
  grades,
  onAddGrade,
  onUpdateGradeAssignment,
  onRemoveGradeAssignment,
  isLoading = false,
}: EditStudentGradeModalProps) {
  // Estado para cambiar un grado específico
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [selectedChangeGradeId, setSelectedChangeGradeId] = useState<string>("");

  // Estado para agregar un nuevo grado
  const [isAdding, setIsAdding] = useState(false);
  const [newGradeId, setNewGradeId] = useState<string>("");

  // ID del grado que se está eliminando
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setEditingAssignmentId(null);
      setSelectedChangeGradeId("");
      setIsAdding(false);
      setNewGradeId("");
      setDeletingId(null);
      setError(null);
    }
  }, [visible, student]);

  if (!visible || !student) return null;

  // Grados que el estudiante ya tiene asignados
  const assignedGradeIds = new Set(student.grades.map((g) => g.gradeId));

  // Grados disponibles para agregar (excluyendo los que ya tiene)
  const availableToAddGrades = grades.filter((g) => !assignedGradeIds.has(g.id));

  // Manejar el cambio de un grado asignado
  const handleStartChange = (assignment: StudentGradeAssignment) => {
    setEditingAssignmentId(assignment.id);
    setSelectedChangeGradeId(assignment.gradeId);
    setIsAdding(false);
    setError(null);
  };

  const handleConfirmChange = async (assignmentId: string) => {
    if (!selectedChangeGradeId) {
      setError("Please select a grade.");
      return;
    }

    try {
      setError(null);
      await onUpdateGradeAssignment(assignmentId, selectedChangeGradeId);
      setEditingAssignmentId(null);
      setSelectedChangeGradeId("");
    } catch (err: any) {
      setError(err?.message || "Error updating grade.");
    }
  };

  // Handle grade removal
  const handleRemove = async (assignmentId: string) => {
    try {
      setError(null);
      setDeletingId(assignmentId);
      await onRemoveGradeAssignment(assignmentId);
    } catch (err: any) {
      setError(err?.message || "Error removing grade.");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle adding a new grade
  const handleAddGrade = async () => {
    if (!newGradeId) {
      setError("Please select the new grade to enroll.");
      return;
    }

    try {
      setError(null);
      await onAddGrade(student.id, newGradeId);
      setIsAdding(false);
      setNewGradeId("");
    } catch (err: any) {
      setError(err?.message || "Error assigning new grade.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 relative animate-scale-up text-slate-800 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-all duration-200 cursor-pointer disabled:opacity-40"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-cyan-50 text-cyan-600 border border-cyan-100 rounded-2xl shrink-0">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Student Grade Management
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Student: <span className="font-bold text-slate-800">{student.fullName}</span>
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-3.5 flex items-start space-x-2.5 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Assigned Grades List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Assigned Grades ({student.grades.length})
            </label>
            {!isAdding && availableToAddGrades.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsAdding(true);
                  setEditingAssignmentId(null);
                  setError(null);
                }}
                disabled={isLoading}
                className="inline-flex items-center space-x-1 text-xs font-bold text-cyan-600 hover:text-cyan-700 bg-cyan-50 hover:bg-cyan-100/70 border border-cyan-200/80 px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Assign another grade</span>
              </button>
            )}
          </div>

          {student.grades.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
              This student currently has no grades assigned.
            </div>
          ) : (
            <div className="space-y-2.5">
              {student.grades.map((assignment, idx) => {
                const isEditingThis = editingAssignmentId === assignment.id;
                const isDeletingThis = deletingId === assignment.id;

                return (
                  <div
                    key={assignment.id}
                    className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white transition-all duration-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-700 border border-cyan-500/20 text-xs font-extrabold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {assignment.gradeName}
                            {assignment.gradeAbbreviation && (
                              <span className="ml-1.5 text-xs text-slate-400 font-semibold">
                                ({assignment.gradeAbbreviation})
                              </span>
                            )}
                          </p>
                          {assignment.enrollmentDate && (
                            <p className="text-[11px] text-slate-400">
                              Enrolled: {new Date(assignment.enrollmentDate).toLocaleDateString("en-US")}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons for this assignment */}
                      {!isEditingThis && (
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartChange(assignment)}
                            disabled={isLoading}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(assignment.id)}
                            disabled={isLoading || isDeletingThis}
                            title="Remove this grade"
                            className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Inline subform to change this grade */}
                    {isEditingThis && (
                      <div className="pt-3 border-t border-slate-200 space-y-3 animate-fade-in">
                        <p className="text-xs font-bold text-slate-700">
                          Select the grade to replace this record with:
                        </p>
                        <select
                          value={selectedChangeGradeId}
                          onChange={(e) => setSelectedChangeGradeId(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                        >
                          <option value="">-- Select a grade --</option>
                          {grades.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name} {g.abbreviation ? `(${g.abbreviation})` : ""}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outlined"
                            onClick={() => setEditingAssignmentId(null)}
                            disabled={isLoading}
                            className="py-1 px-3 text-xs rounded-lg"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            onClick={() => handleConfirmChange(assignment.id)}
                            isLoading={isLoading}
                            disabled={isLoading || !selectedChangeGradeId}
                            className="py-1 px-3 text-xs rounded-lg"
                          >
                            Confirm Change
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section to Add a New Grade */}
        {isAdding && (
          <div className="p-4 rounded-xl border-2 border-cyan-500/30 bg-cyan-50/30 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-cyan-900 flex items-center space-x-1.5">
                <Plus className="w-4 h-4 text-cyan-600" />
                <span>Add new grade to student</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <select
              value={newGradeId}
              onChange={(e) => setNewGradeId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-cyan-200 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            >
              <option value="">-- Select the new grade to enroll --</option>
              {availableToAddGrades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} {g.abbreviation ? `(${g.abbreviation})` : ""}
                </option>
              ))}
            </select>
            <div className="flex items-center justify-end space-x-2 pt-1">
              <Button
                variant="outlined"
                onClick={() => setIsAdding(false)}
                disabled={isLoading}
                className="py-1 px-3 text-xs rounded-lg"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddGrade}
                isLoading={isLoading}
                disabled={isLoading || !newGradeId}
                className="py-1 px-3 text-xs rounded-lg"
              >
                Assign Grade
              </Button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
