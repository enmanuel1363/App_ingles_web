"use client";

import FormInput from "@/components/ui/FormInput";
import Button from "@/components/ui/Button";
import UploadImageModal from "@/components/ui/UploadImageModal";
import { useState } from "react";
import { useExerciseStore } from '../hooks/useExerciseStore';
import { EXERCISE_DEFAULT_DESCRIPTIONS } from "../exercise-constants";
import { X, Plus, Camera, Image as ImageIcon, AlertCircle, GripVertical } from "lucide-react";
import { previewSrc, isDraftPlaceholder } from "../utils/imagePreview";


const EMPTY_ITEM = { image_url: "" as string | File, image_title: "" };

type Props = {
  id_class: string;
  type: "say_word";
  order_index: number;
};

export default function SayWordExerciseForm({ order_index }: Props) {
  const { data, updateExercise } = useExerciseStore();
  const exercise = data[order_index] || {
    name: "",
    description: EXERCISE_DEFAULT_DESCRIPTIONS.say_word,
    content: { items: [{ ...EMPTY_ITEM }] },
  };

  const items = exercise.content?.items || [EMPTY_ITEM];
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingItemIndex, setUploadingItemIndex] = useState<number | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);
  const [draggableIndex, setDraggableIndex] = useState<number | null>(null);

  const reorderItems = (fromIndex: number, toIndex: number) => {
    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    updateContent("items", newItems);
  };

  const updateField = (field: string, value: any) => {
    updateExercise(order_index, {
      ...exercise,
      description: exercise.description || EXERCISE_DEFAULT_DESCRIPTIONS.say_word,
      [field]: value,
    });
  };

  const updateContent = (field: string, value: any) => {
    updateExercise(order_index, {
      ...exercise,
      description: exercise.description || EXERCISE_DEFAULT_DESCRIPTIONS.say_word,
      content: { ...exercise.content, [field]: value },
    });
  };

  const updateItem = (itemIndex: number, fields: Record<string, any>) => {
    const newItems = items.map((item: any, i: number) =>
      i === itemIndex ? { ...item, ...fields } : item,
    );
    updateContent("items", newItems);
  };

  const addItem = () => updateContent("items", [...items, { ...EMPTY_ITEM }]);

  const removeItem = (itemIndex: number) => {
    if (items.length <= 1) return;
    updateContent(
      "items",
      items.filter((_: any, i: number) => i !== itemIndex),
    );
  };

  const handleSaveImage = (imageData: { url: string | File; description: string }) => {
    if (uploadingItemIndex === null) return;
    updateItem(uploadingItemIndex, {
      image_url: imageData.url,
      image_title: imageData.description,
    });
  };


  return (
    <div className="w-full space-y-4">
      <FormInput
        label="Exercise title"
        placeholder="e.g. What is this?"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
        onCopy={() => navigator.clipboard.writeText(exercise.name)}
      />

      {items.map((item: any, itemIndex: number) => {
        const isItemInvalid = !item.image_url || !item.image_title || item.image_title.trim() === "";
        return (
          <div
            key={itemIndex}
            draggable={draggableIndex === itemIndex}
            onDragStart={(e) => {
              e.stopPropagation();
              setDraggedItemIndex(itemIndex);
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", itemIndex.toString());
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (dragOverItemIndex !== itemIndex) {
                setDragOverItemIndex(itemIndex);
              }
            }}
            onDragLeave={(e) => {
              e.stopPropagation();
              setDragOverItemIndex(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const fromIndex = draggedItemIndex;
              if (fromIndex !== null && fromIndex !== itemIndex) {
                reorderItems(fromIndex, itemIndex);
              }
              setDraggedItemIndex(null);
              setDragOverItemIndex(null);
              setDraggableIndex(null);
            }}
            onDragEnd={(e) => {
              e.stopPropagation();
              setDraggedItemIndex(null);
              setDragOverItemIndex(null);
              setDraggableIndex(null);
            }}
            className={`mt-4 p-5 bg-slate-50/70 rounded-xl border transition-all duration-200 ${
              isItemInvalid ? "border-amber-300 bg-amber-50/10" : "border-slate-200/80"
            } ${
              draggedItemIndex === itemIndex ? "opacity-35 scale-[0.98]" : ""
            } ${
              dragOverItemIndex === itemIndex && draggedItemIndex !== itemIndex
                ? "ring-2 ring-cyan-500 ring-offset-2 rounded-xl scale-[1.01]"
                : ""
            }`}
          >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              {items.length > 1 && (
                <div
                  className="text-slate-400 hover:text-slate-655 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-200/50 transition-colors"
                  onMouseDown={() => setDraggableIndex(itemIndex)}
                  onMouseUp={() => setDraggableIndex(null)}
                  title="Arrastrar para reordenar"
                >
                  <GripVertical size={18} />
                </div>
              )}
              <span className="font-semibold text-cyan-650 text-sm tracking-wide uppercase">Item {itemIndex + 1}</span>
            </div>
            {items.length > 1 && (
              <button
                className="text-slate-500 hover:text-rose-600 transition-colors p-1 rounded-lg hover:bg-rose-500/5"
                onClick={() => removeItem(itemIndex)}
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 mb-2">
            <span className="text-sm font-medium text-slate-650 block">Image of the exercise</span>
            <button
              className="flex items-center gap-2 text-sm text-cyan-650 hover:text-cyan-300 transition-colors font-medium"
              onClick={() => {
                setUploadingItemIndex(itemIndex);
                setShowUploadModal(true);
              }}
            >
              <Camera size={16} /> {item.image_url ? "Change" : "Add"}
            </button>
          </div>

          {item.image_url ? (
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="relative w-full h-48 flex items-center justify-center bg-slate-50 border-b border-slate-100">
                {isDraftPlaceholder(item.image_url) ? (
                  <div className="flex flex-col items-center justify-center p-3 text-center select-none">
                    <ImageIcon className="w-8 h-8 text-cyan-600 mb-1" />
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]" title={(item.image_url as any).name}>
                      {(item.image_url as any).name}
                    </span>
                    <span className="text-[9px] text-rose-500 font-bold uppercase tracking-wider mt-0.5">
                      Re-upload image
                    </span>
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewSrc(item.image_url)}
                    alt={item.image_title}
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  className="absolute top-2 right-2 p-1.5 bg-slate-50/80 rounded-lg text-slate-655 hover:text-rose-600 transition-colors"
                  onClick={() => {
                    updateItem(itemIndex, { image_url: "", image_title: "" });
                  }}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-3 border-t border-slate-200 bg-slate-50">
                <span className="text-sm font-medium text-slate-700">{item.image_title}</span>
              </div>
            </div>
          ) : (
            <button
              className="w-full flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50/70 hover:border-cyan-300 transition-all"
              onClick={() => {
                setUploadingItemIndex(itemIndex);
                setShowUploadModal(true);
              }}
            >
              <ImageIcon size={32} className="text-slate-500" />
              <span className="text-sm font-medium">No hay imagen seleccionada</span>
            </button>
          )}

          {isItemInvalid && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 font-semibold bg-amber-50/50 p-2 rounded-lg border border-amber-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Se requiere seleccionar una imagen y especificar la palabra asociada.</span>
            </div>
          )}
        </div>
      );
    })}

      <Button
        variant="outlined"
        onClick={addItem}
        leftIcon={<Plus size={18} />}
        className="w-full mt-4 border-dashed hover:border-cyan-500/30 text-cyan-650 hover:bg-cyan-500/5"
      >
        Add item
      </Button>

      <p className="mt-6 text-sm text-slate-500 italic text-center">
        Note: The name associated with the image is assessed, and the student
        is prompted to speak the word
      </p>

      <UploadImageModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSave={handleSaveImage}
        title="Imagen del Ejercicio"
        descriptionLabel="Palabra a escribir"
        descriptionPlaceholder="e.g. Apple"
      />
    </div>
  );
}
