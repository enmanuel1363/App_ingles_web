"use client";

import { useState } from "react";
import CourseCard from "./CourseCard";
import CreateCourseButton from "./CreateCourseButton";
import CreateCourseModal from "./CreateCourseModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useCourses } from "../hooks/useCourses";
import { Loader2, AlertCircle, BookOpen } from "lucide-react";
import { CourseWithGrade } from "../course.types";
import { useModal } from "@/components/ui/ModalProvider";

export default function CoursesPage() {
  const { courses, isLoading, error, deleteCourse } = useCourses();
  const { showAlert } = useModal();
  
  const [selectedCourse, setSelectedCourse] = useState<CourseWithGrade | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const [courseToDelete, setCourseToDelete] = useState<CourseWithGrade | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditCourse = (course: CourseWithGrade) => {
    setSelectedCourse(course);
    setIsEditModalVisible(true);
  };

  const handleDeleteClick = (course: CourseWithGrade) => {
    setCourseToDelete(course);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteCourse(courseToDelete.id);
      if (result.success) {
        setIsDeleteModalVisible(false);
        setCourseToDelete(null);
        showAlert({
          title: "Curso eliminado",
          message: "El curso ha sido eliminado exitosamente.",
          type: "success",
        });
      } else {
        showAlert({
          title: "Error",
          message: result.error || "No se pudo eliminar el curso.",
          type: "error",
        });
      }
    } catch (err: any) {
      showAlert({
        title: "Error",
        message: "Error al intentar eliminar el curso.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Title section with create class button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Cursos
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Administra y realiza el seguimiento académico de tus aulas de inglés.
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
              onEdit={() => handleEditCourse(item)}
              onDelete={() => handleDeleteClick(item)}
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

      {/* Edit Course Modal */}
      <CreateCourseModal
        visible={isEditModalVisible}
        onClose={() => {
          setIsEditModalVisible(false);
          setSelectedCourse(null);
        }}
        courseToEdit={selectedCourse}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={isDeleteModalVisible}
        onClose={() => {
          setIsDeleteModalVisible(false);
          setCourseToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar Curso?"
        description={`¿Estás seguro de que deseas eliminar la clase "${courseToDelete?.name}"? Esta acción borrará todas sus unidades y lecciones asociadas de manera permanente.`}
        confirmText="Eliminar Clase"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
