"use client";

import FormInput from "@/components/ui/FormInput";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { useExerciseStore } from '../hooks/useExerciseStore';
import { BookOpen, Trash2, Plus } from "lucide-react";

type VocabWord = { word: string; translation: string };
type Item = { words: VocabWord[] };

type Props = {
  id_class: string;
  type: "overview_session";
  order_index: number;
};

export default function OverviewExerciseForm({ order_index }: Props) {
  const { data, updateExercise } = useExerciseStore();
  const exercise = data[order_index] || {
    name: "",
    description: "",
    content: { items: [{ words: [] }] },
  };

  const items: Item[] = exercise.content?.items || [];
  const [newWord, setNewWord] = useState("");
  const [newTranslation, setNewTranslation] = useState("");

  const updateField = (field: string, value: any) => {
    updateExercise(order_index, { ...exercise, [field]: value });
  };

  const updateContent = (field: string, value: any) => {
    updateExercise(order_index, {
      ...exercise,
      content: { ...exercise.content, [field]: value },
    });
  };

  const addItem = () => updateContent("items", [...items, { words: [] }]);

  const removeItem = (index: number) =>
    updateContent(
      "items",
      items.filter((_, i) => i !== index),
    );

  const addWordToItem = (itemIndex: number) => {
    const w = newWord.trim();
    const t = newTranslation.trim();
    if (!w || !t) return;

    const updated = items.map((item, i) =>
      i === itemIndex
        ? { ...item, words: [...item.words, { word: w, translation: t }] }
        : item,
    );
    updateContent("items", updated);
    setNewWord("");
    setNewTranslation("");
  };

  const removeWordFromItem = (itemIndex: number, wordIndex: number) => {
    const updated = items.map((item, i) =>
      i === itemIndex
        ? { ...item, words: item.words.filter((_, j) => j !== wordIndex) }
        : item,
    );
    updateContent("items", updated);
  };

  return (
    <div className="w-full space-y-4">
      <FormInput
        label="Title"
        placeholder="e.g. Animals Vocabulary"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
      />
      <FormInput
        label="Description"
        placeholder="e.g. Learn the names of common animals"
        value={exercise.description}
        onChangeText={(text) => updateField("description", text)}
        multiline
      />

      <div className="mt-4">
        <label className="text-sm font-medium text-slate-650 mb-2 block">Vocabulary Sections</label>

        {items.length === 0 && (
          <div className="p-6 text-center flex flex-col items-center justify-center text-slate-500 bg-slate-100/40 border border-dashed border-slate-200 rounded-xl mb-4">
            <BookOpen size={24} className="text-slate-500 mx-auto mb-2" />
            No sections added yet
          </div>
        )}

        {items.map((item, itemIndex) => (
          <div key={itemIndex} className="mt-4 p-5 bg-slate-50/70 rounded-xl border border-slate-200/80 ">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-cyan-650" />
                <span className="font-semibold text-cyan-650 text-sm tracking-wide uppercase">Section {itemIndex + 1}</span>
              </div>
              <button
                className="text-slate-500 hover:text-rose-600 transition-colors p-1 rounded-lg hover:bg-rose-500/5"
                onClick={() => removeItem(itemIndex)}
              >
                <Trash2 size={18} />
              </button>
            </div>

            {item.words.map((word, wordIndex) => (
              <div key={wordIndex} className="flex items-center justify-between p-3 mb-2 bg-slate-50/50 border border-slate-200/50 rounded-lg">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-700">{word.word}</span>
                  <span className="text-sm text-slate-500">{word.translation}</span>
                </div>
                <button
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-500/5 rounded-lg transition-colors"
                  onClick={() => removeWordFromItem(itemIndex, wordIndex)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {item.words.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No words in this section</p>
            )}

            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <FormInput
                    label="English Word"
                    placeholder="e.g. Dog"
                    value={newWord}
                    onChangeText={setNewWord}
                  />
                </div>
                <div className="flex-1">
                  <FormInput
                    label="Translation"
                    placeholder="e.g. Perro"
                    value={newTranslation}
                    onChangeText={setNewTranslation}
                  />
                </div>
              </div>
              <Button
                variant="outlined"
                onClick={() => addWordToItem(itemIndex)}
                disabled={!newWord.trim() || !newTranslation.trim()}
                leftIcon={<Plus size={18} />}
                className="mt-4 w-full"
              >
                Add Word
              </Button>
            </div>
          </div>
        ))}

        <Button
          variant="outlined"
          onClick={addItem}
          leftIcon={<Plus size={18} />}
          className="w-full mt-4 border-dashed hover:border-cyan-500/30 text-cyan-650 hover:bg-cyan-500/5"
        >
          Add section
        </Button>
      </div>
    </div>
  );
}
