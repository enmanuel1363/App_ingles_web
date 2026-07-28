"use client";

import FormInput from "@/components/ui/FormInput";
import Button from "@/components/ui/Button";
import { useRef, useState } from "react";
import { useExerciseStore } from '../hooks/useExerciseStore';
import { X, Plus, Trash2, Image as ImageIcon, CheckCircle2, Circle } from "lucide-react";

type AnswerOption = { text: string; isCorrect: boolean };
type QA = { question: string; options: AnswerOption[] };
type Item = { cover_image: string | File; story: string; questions: QA[] };

const EMPTY_ITEM: Item = { cover_image: "", story: "", questions: [] };

type Props = {
  id_class: string;
  type: "audio_session";
  order_index: number;
};

export default function StoryTellingExerciseForm({ order_index }: Props) {
  const { data, updateExercise } = useExerciseStore();
  const exercise = data[order_index] || {
    name: "",
    description: "",
    content: { items: [{ ...EMPTY_ITEM }] },
  };

  const items: Item[] = exercise.content?.items || [EMPTY_ITEM];
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const [newQuestions, setNewQuestions] = useState<Record<number, string>>({});
  const [newOptionsMap, setNewOptionsMap] = useState<Record<number, AnswerOption[]>>({});

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
    const newItems = items.map((item, i) =>
      i === itemIndex ? { ...item, [field]: value } : item,
    );
    updateContent("items", newItems);
  };

  const addItem = () => updateContent("items", [...items, { ...EMPTY_ITEM }]);

  const removeItem = (itemIndex: number) => {
    if (items.length <= 1) return;
    updateContent(
      "items",
      items.filter((_, i) => i !== itemIndex),
    );
  };

  const getNewQuestion = (itemIndex: number) => newQuestions[itemIndex] || "";
  const getNewOptions = (itemIndex: number) =>
    newOptionsMap[itemIndex] || [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
    ];

  const setNewQuestion = (itemIndex: number, value: string) =>
    setNewQuestions((prev) => ({ ...prev, [itemIndex]: value }));

  const setNewOptions = (itemIndex: number, options: AnswerOption[]) =>
    setNewOptionsMap((prev) => ({ ...prev, [itemIndex]: options }));

  const resetNewQA = (itemIndex: number) => {
    setNewQuestions((prev) => ({ ...prev, [itemIndex]: "" }));
    setNewOptionsMap((prev) => ({
      ...prev,
      [itemIndex]: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
      ],
    }));
  };

  const handleCoverChange = (itemIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) updateItem(itemIndex, "cover_image", file);
  };

  const previewSrc = (cover: string | File) =>
    typeof cover === "string" ? cover : URL.createObjectURL(cover);

  const handleOptionText = (itemIndex: number, index: number, text: string) => {
    const opts = getNewOptions(itemIndex);
    setNewOptions(
      itemIndex,
      opts.map((opt, i) => (i === index ? { ...opt, text } : opt)),
    );
  };

  const handleSetCorrect = (itemIndex: number, index: number) => {
    const opts = getNewOptions(itemIndex);
    setNewOptions(
      itemIndex,
      opts.map((opt, i) => ({ ...opt, isCorrect: i === index })),
    );
  };

  const addOption = (itemIndex: number) =>
    setNewOptions(itemIndex, [...getNewOptions(itemIndex), { text: "", isCorrect: false }]);

  const removeOption = (itemIndex: number, index: number) => {
    const opts = getNewOptions(itemIndex);
    if (opts.length <= 2) return;
    const updated = opts.filter((_, i) => i !== index);
    const hasCorrect = updated.some((o) => o.isCorrect);
    setNewOptions(
      itemIndex,
      hasCorrect ? updated : updated.map((o, i) => ({ ...o, isCorrect: i === 0 })),
    );
  };

  const canAdd = (itemIndex: number) => {
    const question = getNewQuestion(itemIndex);
    if (!question.trim()) return false;
    const filled = getNewOptions(itemIndex).filter((o) => o.text.trim() !== "");
    if (filled.length < 2) return false;
    return getNewOptions(itemIndex).some((o) => o.isCorrect && o.text.trim() !== "");
  };

  const addQA = (itemIndex: number) => {
    if (!canAdd(itemIndex)) return;

    const filledOptions = getNewOptions(itemIndex)
      .filter((o) => o.text.trim() !== "")
      .map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect }));

    const currentQA = items[itemIndex]?.questions || [];
    updateItem(itemIndex, "questions", [
      ...currentQA,
      { question: getNewQuestion(itemIndex).trim(), options: filledOptions },
    ]);
    resetNewQA(itemIndex);
  };

  const removeQA = (itemIndex: number, qIndex: number) => {
    const currentQA = items[itemIndex]?.questions || [];
    updateItem(
      itemIndex,
      "questions",
      currentQA.filter((_, i) => i !== qIndex),
    );
  };

  return (
    <div className="w-full space-y-4">
      <FormInput
        label="Title"
        placeholder="e.g. The Dog and the Cat"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
      />
      <FormInput
        label="Description"
        placeholder="e.g. Read the story and answer the questions"
        value={exercise.description}
        onChangeText={(text) => updateField("description", text)}
        multiline
      />

      {items.map((item, itemIndex) => {
        const questions = item.questions || [];

        return (
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

            <div className="mt-4 mb-4">
              <label className="text-sm font-medium text-slate-650 mb-2 block">Cover Image</label>
              <p className="text-xs text-slate-500 mb-2">Shown above the story text (16:9 recommended)</p>

              {item.cover_image ? (
                <div className="relative w-full h-40 overflow-hidden rounded-xl border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewSrc(item.cover_image)}
                    alt="cover"
                    className="w-full h-full object-cover"
                  />
                  <button
                    className="absolute top-2 right-2 p-1.5 bg-slate-50/80 rounded-lg text-slate-650 hover:text-rose-600 transition-colors"
                    onClick={() => updateItem(itemIndex, "cover_image", "")}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  className="w-full h-40 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50/70 hover:border-cyan-300 transition-all"
                  onClick={() => fileInputRefs.current[itemIndex]?.click()}
                >
                  <ImageIcon size={32} className="text-slate-500" />
                  <span className="text-sm font-medium mt-2">
                    Tap to select cover image
                  </span>
                </button>
              )}
              <input
                ref={(el) => {
                  fileInputRefs.current[itemIndex] = el;
                }}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleCoverChange(itemIndex, e)}
              />
            </div>

            <FormInput
              label="Story"
              placeholder="Write the full story here..."
              value={item.story || ""}
              onChangeText={(text) => updateItem(itemIndex, "story", text)}
              multiline
            />

            <div className="mt-4">
              <label className="text-sm font-medium text-slate-650 mb-2 block">Questions & Answers</label>

              {questions.map((qa, qIndex) => (
                <div key={qIndex} className="mt-4 p-4 bg-slate-50/50 border border-slate-200/50 rounded-xl flex items-start justify-between gap-4">
                  <div style={{ flex: 1 }}>
                    <p className="font-medium text-slate-700 mb-3">Q: {qa.question}</p>
                    <div className="flex flex-col gap-2">
                      {(qa.options || []).map((opt, oIndex) => (
                        <span
                          key={oIndex}
                          className={`px-3 py-2 rounded-lg text-sm border flex items-center gap-2 ${
                            opt.isCorrect ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-600" : "bg-slate-50/70 border-slate-200 text-slate-650"
                          }`}
                        >
                          {opt.isCorrect ? <CheckCircle2 size={16} /> : <Circle size={16} />} {opt.text}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-500/5 rounded-lg transition-colors"
                    onClick={() => removeQA(itemIndex, qIndex)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-xl">
                <FormInput
                  label="Question"
                  placeholder="e.g. Where does the dog live?"
                  value={getNewQuestion(itemIndex)}
                  onChangeText={(text) => setNewQuestion(itemIndex, text)}
                />

                <label className="text-sm font-medium text-slate-650 mt-4 block">Answer Options</label>
                <p className="text-xs text-slate-500 mb-4">
                  Click the circle to mark the correct answer
                </p>

                {getNewOptions(itemIndex).map((opt, i) => (
                  <div key={i} className="flex items-center gap-3 mb-3">
                    <button
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors border-slate-500 hover:border-cyan-400 ${
                        opt.isCorrect ? "border-cyan-400" : ""
                      }`}
                      onClick={() => handleSetCorrect(itemIndex, i)}
                    >
                      {opt.isCorrect && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />}
                    </button>
                    <div className="flex-1">
                      <FormInput
                        placeholder={`Option ${i + 1}${opt.isCorrect ? " (correct)" : ""}`}
                        value={opt.text}
                        onChangeText={(text) => handleOptionText(itemIndex, i, text)}
                      />
                    </div>
                    {getNewOptions(itemIndex).length > 2 && (
                      <button
                        className="p-2 text-slate-500 hover:text-rose-600 transition-colors"
                        onClick={() => removeOption(itemIndex, i)}
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}

                <button className="text-cyan-650 hover:text-cyan-300 text-sm font-medium flex items-center gap-1 mt-2" onClick={() => addOption(itemIndex)}>
                  <Plus size={16} /> Add another option
                </button>

                <button
                  className="mt-6 w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-850 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => addQA(itemIndex)}
                  disabled={!canAdd(itemIndex)}
                >
                  <Plus size={18} /> Add Question
                </button>
              </div>
            </div>
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
