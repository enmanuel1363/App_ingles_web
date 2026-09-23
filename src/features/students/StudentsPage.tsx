"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
  X,
  GraduationCap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import AlertModal from "@/components/ui/AlertModal";
import { useStudents } from "./hooks/useStudents";
import StudentsTable from "./components/StudentsTable";
import StudentsPagination from "./components/StudentsPagination";
import EditStudentGradeModal from "./components/EditStudentGradeModal";
import { StudentProfile } from "./students.types";

export default function StudentsPage() {
  const router = useRouter();
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    students,
    total,
    page,
    pageSize,
    totalPages,
    isLoading,
    isFetching,
    error,
    grades,
    addGradeToStudent,
    updateStudentGradeAssignment,
    removeStudentGradeAssignment,
    isMutatingGrade,
    setPage,
    search,
    setSearch,
    refreshStudents,
  } = useStudents(1, 10);

  const handleEditStudent = (student: StudentProfile) => {
    setEditingStudent(student);
    setIsEditModalOpen(true);
  };

  // Mantener sincronizado el estudiante con los datos en caché de React Query
  const currentEditingStudent = editingStudent
    ? students.find((s) => s.id === editingStudent.id) || editingStudent
    : null;

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 cursor-pointer shadow-xs"
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-700 border border-cyan-500/20">
                Academic Management
              </span>
              <span className="text-xs text-slate-400 font-medium">
                • {total} registered student{total === 1 ? "" : "s"}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Student List
            </h1>
          </div>
        </div>

        {/* Refresh Action */}
        <div className="flex items-center space-x-2.5">
          <Button
            variant="outlined"
            onClick={refreshStudents}
            disabled={isLoading || isFetching}
            className="py-2.5 px-4 rounded-xl text-xs font-bold border-slate-200 bg-white"
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
              />
            }
          >
            Sync
          </Button>
        </div>
      </div>

      {/* Error state alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl p-5 flex items-start space-x-3.5 shadow-sm">
          <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900">
              Error loading students
            </h4>
            <p className="text-sm text-rose-700/90 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {/* Search Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student by name or email..."
              className="w-full pl-10 pr-9 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all bg-slate-50/50 hover:bg-white focus:bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Pagination:</span>
            <span>10 students per page</span>
          </div>
        </div>

        {/* Table View */}
        <StudentsTable
          students={students}
          isLoading={isLoading}
          onEditStudent={handleEditStudent}
        />

        {/* Pagination Footer */}
        <StudentsPagination
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          isLoading={isFetching}
        />
      </div>

      {/* Modal para Editar, Agregar o Eliminar Grados del Estudiante */}
      <EditStudentGradeModal
        visible={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={currentEditingStudent}
        grades={grades}
        onAddGrade={async (studentId, gradeId) => {
          await addGradeToStudent({ studentId, gradeId });
        }}
        onUpdateGradeAssignment={async (assignmentId, newGradeId) => {
          await updateStudentGradeAssignment({ assignmentId, newGradeId });
        }}
        onRemoveGradeAssignment={async (assignmentId) => {
          await removeStudentGradeAssignment(assignmentId);
        }}
        isLoading={isMutatingGrade}
      />

      {/* Success Modal */}
      <AlertModal
        visible={Boolean(successMessage)}
        onClose={() => setSuccessMessage(null)}
        title="Grade Updated"
        message={successMessage || ""}
        type="success"
        buttonText="OK"
      />
    </div>
  );
}
