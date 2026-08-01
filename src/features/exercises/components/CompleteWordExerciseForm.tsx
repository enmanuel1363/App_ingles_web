"use client";

import FormInput from "@/components/ui/FormInput";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { useExerciseStore } from "../hooks/useExerciseStore";
import { X, Plus, Info } from "lucide-react";

const EMPTY_ITEM = {
  sentence: "",
  correct_answer: "",
  possible_answers: [] as string[],
};

type Props = {
  id_class: string;
  type: "complete_word";
  order_index: number;
};

export default function CompleteWordExerciseForm({ order_index }: Props) {
  const { data, updateExercise } = useExerciseStore();
  const exercise = data[order_index] || {
    name: "",
    description: "",
    content: { items: [{ ...EMPTY_ITEM }] },
  };

  const items = exercise.content?.items || [EMPTY_ITEM];
  const [inputValues, setInputValues] = useState<Record<number, string>>({});

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

  const handleAddAnswer = (text: string, itemIndex: number) => {
    if (text.includes(",")) {
      const parts = text.split(",");
      const lastPart = parts.pop() || "";
      const newAnswers = parts
        .map((p) => p.trim())
        .filter(
          (p) => p !== "" && !items[itemIndex].possible_answers?.includes(p),
        );

      if (newAnswers.length > 0) {
        updateItem(itemIndex, "possible_answers", [
          ...(items[itemIndex].possible_answers || []),
          ...newAnswers,
        ]);
      }
      setInputValues((prev) => ({ ...prev, [itemIndex]: lastPart }));
    } else {
      setInputValues((prev) => ({ ...prev, [itemIndex]: text }));
    }
  };

  const removeAnswer = (itemIndex: number, answerIdx: number) => {
    updateItem(
      itemIndex,
      "possible_answers",
      items[itemIndex].possible_answers.filter(
        (_: any, i: number) => i !== answerIdx,
      ),
    );
  };

  return (
    <div className="w-full space-y-4">
      <FormInput
        label="Exercise title"
        placeholder="e.g. Complete the sentence"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
        onCopy={() => navigator.clipboard.writeText(exercise.name)}
      />
      <FormInput
        label="Description"
        placeholder="e.g. Fill in the blank with the correct word"
        value={exercise.description}
        onChangeText={(text) => updateField("description", text)}
        onCopy={() => navigator.clipboard.writeText(exercise.description)}
      />

      <p className="flex flex-row items-center gap-2 text-sm text-gray-400">
        <Info className="w-4 h-4" />
        Tip: usa 3 guiones bajos ( _ ) para indicar donde ira la palabra
        faltante en tu frase
      </p>
      {items.map((item: any, itemIndex: number) => (
        <div
          key={itemIndex}
          className="mt-4 p-5 bg-slate-50/70 rounded-xl border border-slate-200/80 "
        >
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-cyan-650 text-sm tracking-wide uppercase">
              Item {itemIndex + 1}
            </span>
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
            label="Sentence text"
            placeholder="e.g. I ____ to the park"
            value={item.sentence}
            onChangeText={(text) => updateItem(itemIndex, "sentence", text)}
          />
          <FormInput
            label="Correct answer"
            placeholder="e.g. went"
            value={item.correct_answer}
            onChangeText={(text) =>
              updateItem(itemIndex, "correct_answer", text)
            }
          />

          <div className="mt-4">
            <label className="text-sm font-medium text-slate-650 mb-2 block">
              Posibles respuestas
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {item.possible_answers?.map((answer: string, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-200 text-sm text-slate-700"
                >
                  <span>{answer}</span>
                  <button
                    className="text-slate-500 hover:text-rose-600 transition-colors"
                    onClick={() => removeAnswer(itemIndex, idx)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <FormInput
              placeholder="Type an answer and separate by comma ( , )"
              value={inputValues[itemIndex] || ""}
              onChangeText={(text) => handleAddAnswer(text, itemIndex)}
              multiline
            />
          </div>
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
