"use client";

import React from "react";
import {
  User,
  GraduationCap,
  BookCheck,
  Sparkles,
  Pencil,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { StudentProfile } from "../students.types";
import Button from "@/components/ui/Button";

interface StudentsTableProps {
  students: StudentProfile[];
  isLoading: boolean;
  onEditStudent: (student: StudentProfile) => void;
}

export default function StudentsTable({
  students,
  isLoading,
  onEditStudent,
}: StudentsTableProps) {
  // Loading skeleton state
  if (isLoading && students.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-4 px-6">Student</th>
              <th className="py-4 px-6">Age</th>
              <th className="py-4 px-6">Grade</th>
              <th className="py-4 px-6">Completed Lessons</th>
              <th className="py-4 px-6">Subscription</th>
              <th className="py-4 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-slate-200 rounded" />
                      <div className="w-24 h-3 bg-slate-100 rounded" />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="w-12 h-4 bg-slate-200 rounded" />
                </td>
                <td className="py-4 px-6">
                  <div className="w-20 h-6 bg-slate-200 rounded-full" />
                </td>
                <td className="py-4 px-6">
                  <div className="w-24 h-6 bg-slate-200 rounded-full" />
                </td>
                <td className="py-4 px-6">
                  <div className="w-16 h-6 bg-slate-200 rounded-full" />
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="w-16 h-8 bg-slate-200 rounded-lg ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state when no students
  if (!isLoading && students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-500 mb-4">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">
          No students found
        </h3>
        <p className="text-slate-500 text-sm max-w-sm mt-1">
          No student records match the current criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <th className="py-4 px-6">Student</th>
            <th className="py-4 px-6">Age</th>
            <th className="py-4 px-6">Grade</th>
            <th className="py-4 px-6">Completed Lessons</th>
            <th className="py-4 px-6">Subscription</th>
            <th className="py-4 px-6 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {students.map((student) => {
            const initials = student.fullName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join("");

            return (
              <tr
                key={student.id}
                className="hover:bg-slate-50/70 transition-colors duration-150 group"
              >
                {/* 1. Columna Estudiante (Avatar + Nombre + Email) */}
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3.5">
                    {student.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={student.avatarUrl}
                        alt={student.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-700 border border-cyan-500/20 font-extrabold flex items-center justify-center shrink-0 text-xs">
                        {initials || <User className="w-4 h-4" />}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {student.fullName}
                      </p>
                      {student.email && (
                        <p className="text-xs text-slate-400 truncate">
                          {student.email}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* 2. Age Column */}
                <td className="py-4 px-6 font-semibold text-slate-700">
                  {student.edad !== null && student.edad !== undefined ? (
                    <span>{student.edad} years old</span>
                  ) : (
                    <span className="text-slate-400 font-normal">—</span>
                  )}
                </td>

                {/* 3. Grade Column */}
                <td className="py-4 px-6">
                  {student.grades && student.grades.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {student.grades.map((g) => (
                        <span
                          key={g.id}
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/80 shadow-2xs"
                        >
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{g.gradeName}</span>
                          {g.gradeAbbreviation && (
                            <span className="opacity-75 text-[10px]">
                              ({g.gradeAbbreviation})
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                      No grade assigned
                    </span>
                  )}
                </td>

                {/* 4. Completed Lessons Column */}
                <td className="py-4 px-6">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <BookCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{student.completedLessonsCount} completed</span>
                  </span>
                </td>

                {/* 5. Subscription Status Column */}
                <td className="py-4 px-6">
                  {student.isPremium ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs shadow-amber-500/10">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                      <span>Premium</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Free</span>
                    </span>
                  )}
                </td>

                {/* 6. Action Column (Edit) */}
                <td className="py-4 px-6 text-right">
                  <Button
                    variant="outlined"
                    onClick={() => onEditStudent(student)}
                    className="py-1.5 px-3 text-xs rounded-xl font-bold border-slate-200 hover:border-cyan-300 hover:text-cyan-700 hover:bg-cyan-50/50"
                    leftIcon={<Pencil className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
