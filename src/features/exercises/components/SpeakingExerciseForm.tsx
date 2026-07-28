"use client";

import FormInput from "@/components/ui/FormInput";
import Button from "@/components/ui/Button";
import { useExerciseStore } from '../hooks/useExerciseStore';
import { X, Plus } from "lucide-react";

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
      />
      <FormInput
        label="Description / Word to repeat"
        placeholder="e.g. Repeat the word: Apple"
        value={exercise.description}
        onChangeText={(text) => updateField("description", text)}
        multiline
      />

      {items.map((item: any, itemIndex: number) => (
        <div key={itemIndex} className="mt-4 p-5 bg-slate-50/70 rounded-xl border border-slate-200/80 ">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-cyan-650 text-sm tracking-wide uppercase">Item {itemIndex + 1}</span>
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
        </div>
      ))}

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
