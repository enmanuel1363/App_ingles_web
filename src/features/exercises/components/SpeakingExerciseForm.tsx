"use client";

import { useState } from "react";
import FormInput from "@/components/ui/FormInput";
import Button from "@/components/ui/Button";
import { useExerciseStore } from '../hooks/useExerciseStore';
import { X, Plus, AlertCircle, GripVertical } from "lucide-react";

const EMPTY_ITEM = { correct_answer: "" };

type Props = {
  id_class: string;
  type: "speak";
  order_index: number;
};

export default function SpeakingExerciseForm({ order_index }: Props) {
  const { data, updateExercise } = useExerciseStore();
  const exercise = data[order_index] || {
    name: "",
    description: "",
    content: { items: [{ ...EMPTY_ITEM }] },
  };

  const items = exercise.content?.items || [EMPTY_ITEM];
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
    updateExercise(order_index, { ...exercise, [field]: value });
  };

  const updateContent = (field: string, value: any) => {
    updateExercise(order_index, {
      ...exercise,
      content: { ...exercise.content, [field]: value },
    });
  };

  const updateItem = (itemIndex: number, field: string, value: any) => {
    const newItems = items.map((item: any, i: number) =>
      i === itemIndex ? { ...item, [field]: value } : item,
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

  return (
    <div className="w-full space-y-4">
      <FormInput
        label="Title of the exercise"
        placeholder="e.g. Pronunciation: Verb To Be"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
        onCopy={() => navigator.clipboard.writeText(exercise.name)}
      />
      <FormInput
        label="Description / Word to repeat"
        placeholder="e.g. Repeat the word: Apple"
        value={exercise.description}
        onChangeText={(text) => updateField("description", text)}
        multiline
        onCopy={() => navigator.clipboard.writeText(exercise.description)}
      />

      {items.map((item: any, itemIndex: number) => {
        const isItemInvalid = !item.correct_answer || item.correct_answer.trim() === "";
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

          <FormInput
            label="Correct answer (Comparison)"
            placeholder="e.g. apple"
            value={item.correct_answer}
            onChangeText={(text) => updateItem(itemIndex, "correct_answer", text)}
          />

          {isItemInvalid && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 font-semibold bg-amber-50/50 p-2 rounded-lg border border-amber-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Se requiere asignar la respuesta correcta para la comparación.</span>
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
    </div>
  );
}
