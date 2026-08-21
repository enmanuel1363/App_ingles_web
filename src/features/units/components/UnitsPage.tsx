"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateUnitButton from "./CreateUnitButton";
import CreateUnitModal from "./CreateUnitModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import UnitCard from './UnitCard';
import { useUnits, useDeleteUnit } from '../hooks/useUnits';
import { Unit } from '../unit.types';
import { ArrowLeft, Loader2, BookOpen } from "lucide-react";
import { useModal } from "@/components/ui/ModalProvider";

type Props = {
  courseId: string;
  courseTitle?: string;
  initialUnits?: Unit[];
};

export default function UnitsPage({ courseId, courseTitle, initialUnits }: Props) {
  const router = useRouter();
  const { data, isLoading } = useUnits(courseId, initialUnits);
  const { mutate: deleteUnit } = useDeleteUnit();
  const units = data || [];
  const { showAlert } = useModal();

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsEditModalVisible(true);
  };

  const handleDeleteClick = (unit: Unit) => {
    setUnitToDelete(unit);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (!unitToDelete || !unitToDelete.id) return;
    setIsDeleting(true);
    deleteUnit(unitToDelete.id, {
      onSuccess: () => {
        setIsDeleteModalVisible(false);
        setUnitToDelete(null);
        setIsDeleting(false);
        showAlert({
          title: "Unidad eliminada",
          message: "La unidad ha sido eliminada correctamente.",
          type: "success",
        });
      },
      onError: (err: any) => {
        showAlert({
          title: "Error",
          message: err.message || "No se pudo eliminar la unidad.",
          type: "error",
        });
        setIsDeleting(false);
      }
    });
  };

  const goToClasses = (item: Unit) => {
    router.push(
      `/courses/${courseId}/units/${item.id}/classes?unitName=${encodeURIComponent(
        item.name,
      )}&unitOrder=${item.order_index}`,
    );
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Header navigations */}
      <div className="flex flex-col space-y-4">
        <button 
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-550 hover:text-cyan-600 transition-colors self-start cursor-pointer group" 
          onClick={() => router.push("/courses")}
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
          <span>My Classes</span>
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {courseTitle ? `${courseTitle} — Unidades` : "Unidades"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Organiza las lecciones, desafíos y objetivos de aprendizaje de esta clase.
            </p>
          </div>
          <div className="sm:self-end">
            <CreateUnitButton courseId={courseId} />
          </div>
        </div>
      </div>

      {/* Grid of units */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-505" />
            <span className="text-sm font-semibold">Cargando unidades...</span>
          </div>
        ) : units.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-350" />
            <p className="text-sm font-semibold">No hay unidades configuradas en esta clase.</p>
          </div>
        ) : (
          units.map((item) => (
            <UnitCard
              key={item.id}
              order={item.order_index}
              name={item.name}
              difficulty={item.difficulty}
              onPress={() => goToClasses(item)}
              onEdit={() => handleEditUnit(item)}
              onDelete={() => handleDeleteClick(item)}
            />
          ))
        )}
      </div>

      {/* Edit Unit Modal */}
      <CreateUnitModal
        visible={isEditModalVisible}
        onClose={() => {
          setIsEditModalVisible(false);
          setSelectedUnit(null);
        }}
        courseId={courseId}
        unitToEdit={selectedUnit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={isDeleteModalVisible}
        onClose={() => {
          setIsDeleteModalVisible(false);
          setUnitToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar Unidad?"
        description={`¿Estás seguro de que deseas eliminar la unidad "${unitToDelete?.name}"? Esta acción borrará todas sus lecciones y ejercicios asociados de manera permanente.`}
        confirmText="Eliminar Unidad"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
