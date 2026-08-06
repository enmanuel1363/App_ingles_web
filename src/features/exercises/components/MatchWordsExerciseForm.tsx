"use client";

import FormInput from "@/components/ui/FormInput";
import Button from "@/components/ui/Button";
import { useExerciseStore } from "../hooks/useExerciseStore";
import { X, Plus, AlertCircle, Info } from "lucide-react";

const EMPTY_PAIR = {
  english: "",
  spanish: "",
};

type Props = {
  id_class: string;
  type: "match_words";
  order_index: number;
};

export default function MatchWordsExerciseForm({ order_index }: Props) {
  const { data, updateExercise } = useExerciseStore();
  const exercise = data[order_index] || {
    name: "",
    description: "",
    content: { items: [{ pairs: [{ ...EMPTY_PAIR }] }] },
  };

  const items = exercise.content?.items || [{ pairs: [{ ...EMPTY_PAIR }] }];
  const firstItem = items[0] || { pairs: [] };
  const pairs = firstItem.pairs || [];

  const updateField = (field: string, value: any) => {
    updateExercise(order_index, { ...exercise, [field]: value });
  };

  const updateContent = (field: string, value: any) => {
    updateExercise(order_index, {
      ...exercise,
      content: { ...exercise.content, [field]: value },
    });
  };

  const updatePair = (pairIndex: number, field: "english" | "spanish", value: string) => {
    const newPairs = pairs.map((pair: any, i: number) =>
      i === pairIndex ? { ...pair, [field]: value } : pair
    );
    const newItems = [{ ...firstItem, pairs: newPairs }];
    updateContent("items", newItems);
  };

  const addPair = () => {
    if (pairs.length >= 6) return;
    const newPairs = [...pairs, { ...EMPTY_PAIR }];
    const newItems = [{ ...firstItem, pairs: newPairs }];
    updateContent("items", newItems);
  };

  const removePair = (pairIndex: number) => {
    if (pairs.length <= 1) return;
    const newPairs = pairs.filter((_: any, i: number) => i !== pairIndex);
    const newItems = [{ ...firstItem, pairs: newPairs }];
    updateContent("items", newItems);
  };

  // Validations
  const isTooFew = pairs.length < 2;
  const hasEmptyFields = pairs.some(
    (pair: any) => !pair.english?.trim() || !pair.spanish?.trim()
  );
  const isItemInvalid = isTooFew || hasEmptyFields;

  return (
    <div className="w-full space-y-4">
      <FormInput
        label="Exercise Title"
        placeholder="e.g. Animals Matching Game"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
        onCopy={() => navigator.clipboard.writeText(exercise.name)}
      />
      <FormInput
        label="Descriptive Text / Instructions"
        placeholder="e.g. Match the English words with their correct Spanish meanings"
        value={exercise.description}
        onChangeText={(text) => updateField("description", text)}
        onCopy={() => navigator.clipboard.writeText(exercise.description)}
      />

      <div className="flex flex-row items-center gap-2 text-sm text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
        <Info className="w-4 h-4 text-cyan-600 shrink-0" />
        <span className="text-slate-650 font-medium">
          Define up to 6 word pairs (minimum 2 recommended for a matching challenge).
        </span>
      </div>

      <div className="space-y-4 mt-4">
        {pairs.map((pair: any, pairIndex: number) => {
          return (
            <div
              key={pairIndex}
              className="flex items-end gap-3.5 p-4.5 bg-slate-50/60 rounded-2xl border border-slate-200/60 hover:bg-slate-50 transition-all duration-200"
            >
              <span className="text-xs font-extrabold text-cyan-650 uppercase tracking-wider shrink-0 pb-3.5 w-6">
                #{pairIndex + 1}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <FormInput
                  label="English Word"
                  placeholder="e.g. Apple"
                  value={pair.english}
                  onChangeText={(text) => updatePair(pairIndex, "english", text)}
                />
                <FormInput
                  label="Spanish Meaning"
                  placeholder="e.g. Manzana"
                  value={pair.spanish}
                  onChangeText={(text) => updatePair(pairIndex, "spanish", text)}
                />
              </div>

              {pairs.length > 1 && (
                <button
                  type="button"
                  className="text-slate-400 hover:text-rose-600 transition-colors p-2 rounded-xl hover:bg-rose-500/5 shrink-0 mb-1"
                  onClick={() => removePair(pairIndex)}
                  title="Remove pair"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {pairs.length < 6 ? (
          <Button
            variant="outlined"
            onClick={addPair}
            leftIcon={<Plus size={18} />}
            className="w-full border-dashed hover:border-cyan-500/30 text-cyan-650 hover:bg-cyan-500/5 font-extrabold"
          >
            Add Word Pair ({pairs.length}/6)
          </Button>
        ) : (
          <div className="text-center text-xs text-slate-400 py-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl font-bold uppercase tracking-wider">
            Maximum of 6 pairs reached
          </div>
        )}

        {isItemInvalid && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 font-extrabold bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 animate-scale-up">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-amber-600" />
            <span>
              {isTooFew
                ? "Se requieren al menos 2 parejas de palabras para crear el juego."
                : "Todas las palabras en inglés y traducciones al español deben estar llenas."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
