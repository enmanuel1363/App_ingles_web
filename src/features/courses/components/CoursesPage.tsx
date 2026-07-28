"use client";

import CourseCard from "./CourseCard";
import CreateCourseButton from "./CreateCourseButton";
import { useCourses } from "../hooks/useCourses";
import { Loader2, AlertCircle, BookOpen } from "lucide-react";

export default function CoursesPage() {
  const { courses, isLoading, error } = useCourses();

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Title section with create class button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Cursos
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Administra y realiza el seguimiento académico de tus aulas de
            inglés.
          </p>
        </div>
        <div className="sm:self-end">
          <CreateCourseButton />
        </div>
      </div>

      {/* Courses grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {isLoading && courses.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            <span className="text-sm font-semibold">
              Cargando tus clases...
            </span>
          </div>
        ) : error && courses.length === 0 ? (
          <div className="col-span-full py-16 px-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex flex-col items-center justify-center text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-500" />
            <p className="text-rose-600 font-semibold text-sm">
              Error al cargar clases: {error}
            </p>
          </div>
        ) : (
          courses.map((item) => (
            <CourseCard
              key={item.id}
              id={item.id}
              title={item.name}
              grade={item.grade?.abbreviation || "N/A"}
              students={item.students_count || 0}
            />
          ))
        )}

        {!isLoading && courses.length === 0 && !error && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-350" />
            <p className="text-sm font-semibold">
              Aún no tienes clases creadas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
