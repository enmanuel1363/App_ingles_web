"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ClassCard from "./ClassCard";
import CreateClassModal from "./CreateClassModal";
import { useClasses, useDeleteClass } from "../hooks/useClasses";
import { ClassModel } from "../class.types";
import { ArrowLeft, Plus, Loader2, BookOpen } from "lucide-react";
import Button from "@/components/ui/Button";

type Props = {
  courseId: string;
  unitId: string;
  unitName?: string;
  unitOrder?: string;
};

export default function ClassesPage({
  courseId,
  unitId,
  unitName,
  unitOrder,
}: Props) {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [classToEdit, setClassToEdit] = useState<ClassModel | null>(null);

  const { data, isLoading, error } = useClasses(unitId);
  const { mutateAsync: deleteClassMutation } = useDeleteClass();

  const lessons = data || [];

  const handleAddClass = () => {
    setClassToEdit(null);
    setIsModalVisible(true);
  };

  const handleClassClick = (id: string) => {
    router.push(`/courses/${courseId}/units/${unitId}/classes/${id}/exercises`);
  };

  const handleDeleteClass = async (id: string, className: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${className}"?`,
    );
    if (!confirmed) return;

    try {
      await deleteClassMutation({ classId: id, unitId });
    } catch {
      alert("Failed to delete the class");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Back button and title */}
      <div className="flex flex-col space-y-4">
        <button
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-cyan-600 transition-colors self-start cursor-pointer group"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Units</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 gap-4">
          <div className="flex items-center space-x-3.5">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {unitName ? `Unidad ${unitOrder}: ${unitName}` : "Clases Creadas"}
            </h1>
            <span className="bg-cyan-500/10 text-cyan-700 border border-cyan-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {lessons.length}
            </span>
          </div>
          <div className="sm:self-end">
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4 text-slate-950" />}
              onClick={handleAddClass}
            >
              añadir lección
            </Button>
          </div>
        </div>
      </div>

      {/* Class list */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          <span className="text-sm font-semibold">Loading lessons...</span>
        </div>
      ) : error ? (
        <div className="py-16 text-center text-rose-500 font-semibold text-sm">
          Error loading classes
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <ClassCard
              key={lesson.id}
              id={lesson.id}
              name={lesson.name}
              order_index={lesson.order_index}
              type={lesson.type}
              created_at={lesson.created_at || ""}
              updated_at={lesson.updated_at || ""}
              onPress={handleClassClick}
              onEdit={() => {
                setClassToEdit(lesson);
                setIsModalVisible(true);
              }}
              onDelete={() => handleDeleteClass(lesson.id!, lesson.name)}
            />
          ))}
          {lessons.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-350" />
              <p className="text-sm font-semibold">No classes created yet.</p>
            </div>
          )}
        </div>
      )}

      <CreateClassModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setClassToEdit(null);
        }}
        id_unit={unitId}
        nextOrderIndex={lessons.length + 1}
        classToEdit={classToEdit}
      />
    </div>
  );
}
