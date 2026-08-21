"use client";

import FormInput from "@/components/ui/FormInput";
import Button from "@/components/ui/Button";
import { useRef, useState } from "react";
import { useExerciseStore } from "../hooks/useExerciseStore";
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Circle,
  AlertCircle,
  Edit3,
  ArrowUp,
  ArrowDown,
  HelpCircle,
} from "lucide-react";
import { previewSrc, isDraftPlaceholder } from "../utils/imagePreview";

type AnswerOption = { text: string; isCorrect: boolean };
type QA = { fragment_index: number; question: string; options: AnswerOption[] };
type StoryFragment = { cover_image: string | File; story: string };
type Item = { fragments: StoryFragment[]; questions: QA[] };

const EMPTY_ITEM: Item = {
  fragments: [{ cover_image: "", story: "" }],
  questions: [],
};

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
    content: { items: [] },
  };

  // Safe migration of existing items to the new fragments + questions structure
  const items: Item[] = (exercise.content?.items || []).map((item: any) => {
    const fragments = item.fragments || [
      {
        cover_image: item.cover_image || "",
        story: item.story || "",
      },
    ];
    const questions = (item.questions || []).map((q: any) => ({
      ...q,
      fragment_index: q.fragment_index ?? 0,
    }));
    return { fragments, questions };
  });

  // Fallback in case items array is completely empty
  if (items.length === 0) {
    items.push({
      fragments: [{ cover_image: "", story: "" }],
      questions: [],
    });
  }

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Question editing / creation state
  const [newQuestions, setNewQuestions] = useState<Record<number, string>>({});
  const [newOptionsMap, setNewOptionsMap] = useState<Record<number, AnswerOption[]>>({});
  const [newFragmentIndexMap, setNewFragmentIndexMap] = useState<Record<number, number>>({});

  const [editingQA, setEditingQA] = useState<{
    itemIndex: number;
    qIndex: number;
    fragment_index: number;
    question: string;
    options: AnswerOption[];
  } | null>(null);

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

  // --- Fragment Actions ---
  const addFragment = (itemIndex: number) => {
    const currentFragments = items[itemIndex].fragments;
    updateItem(itemIndex, "fragments", [
      ...currentFragments,
      { cover_image: "", story: "" },
    ]);
  };

  const removeFragment = (itemIndex: number, fragIndex: number) => {
    const currentFragments = items[itemIndex].fragments;
    if (currentFragments.length <= 1) return;

    const newFragments = currentFragments.filter((_, i) => i !== fragIndex);

    // Re-index associated questions. If association is broken or out of bounds, default to 0.
    const currentQuestions = items[itemIndex].questions;
    const newQuestions = currentQuestions.map((q) => {
      if (q.fragment_index === fragIndex) {
        return { ...q, fragment_index: 0 };
      }
      if (q.fragment_index > fragIndex) {
        return { ...q, fragment_index: q.fragment_index - 1 };
      }
      return q;
    });

    const newItems = items.map((item, i) =>
      i === itemIndex
        ? { ...item, fragments: newFragments, questions: newQuestions }
        : item,
    );
    updateContent("items", newItems);
  };

  const updateFragmentField = (
    itemIndex: number,
    fragIndex: number,
    field: keyof StoryFragment,
    value: any,
  ) => {
    const currentFragments = items[itemIndex].fragments;
    const newFragments = currentFragments.map((frag, i) =>
      i === fragIndex ? { ...frag, [field]: value } : frag,
    );
    updateItem(itemIndex, "fragments", newFragments);
  };

  const moveFragment = (itemIndex: number, fragIndex: number, direction: "up" | "down") => {
    const currentFragments = [...items[itemIndex].fragments];
    const targetIndex = direction === "up" ? fragIndex - 1 : fragIndex + 1;

    if (targetIndex < 0 || targetIndex >= currentFragments.length) return;

    // Swap fragments
    [currentFragments[fragIndex], currentFragments[targetIndex]] = [
      currentFragments[targetIndex],
      currentFragments[fragIndex],
    ];

    // Swap the associations in questions as well
    const currentQuestions = items[itemIndex].questions;
    const newQuestions = currentQuestions.map((q) => {
      if (q.fragment_index === fragIndex) {
        return { ...q, fragment_index: targetIndex };
      }
      if (q.fragment_index === targetIndex) {
        return { ...q, fragment_index: fragIndex };
      }
      return q;
    });

    const newItems = items.map((item, i) =>
      i === itemIndex
        ? { ...item, fragments: currentFragments, questions: newQuestions }
        : item,
    );
    updateContent("items", newItems);
  };

  const handleCoverChange = (
    itemIndex: number,
    fragIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) updateFragmentField(itemIndex, fragIndex, "cover_image", file);
  };

  // --- New Question Formulation State Getters/Setters ---
  const getNewQuestionText = (itemIndex: number) => newQuestions[itemIndex] || "";
  const getNewQuestionFragmentIndex = (itemIndex: number) => newFragmentIndexMap[itemIndex] ?? 0;
  const getNewQuestionOptions = (itemIndex: number) =>
    newOptionsMap[itemIndex] || [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
    ];

  const setNewQuestionText = (itemIndex: number, value: string) =>
    setNewQuestions((prev) => ({ ...prev, [itemIndex]: value }));

  const setNewQuestionFragmentIndex = (itemIndex: number, value: number) =>
    setNewFragmentIndexMap((prev) => ({ ...prev, [itemIndex]: value }));

  const setNewQuestionOptions = (itemIndex: number, options: AnswerOption[]) =>
    setNewOptionsMap((prev) => ({ ...prev, [itemIndex]: options }));

  const resetNewQuestion = (itemIndex: number) => {
    setNewQuestions((prev) => ({ ...prev, [itemIndex]: "" }));
    setNewFragmentIndexMap((prev) => ({ ...prev, [itemIndex]: 0 }));
    setNewOptionsMap((prev) => ({
      ...prev,
      [itemIndex]: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
      ],
    }));
  };

  // --- Actions for composing new questions ---
  const handleNewOptionText = (itemIndex: number, optionIndex: number, text: string) => {
    const opts = getNewQuestionOptions(itemIndex);
    setNewQuestionOptions(
      itemIndex,
      opts.map((opt, i) => (i === optionIndex ? { ...opt, text } : opt)),
    );
  };

  const handleNewSetCorrect = (itemIndex: number, optionIndex: number) => {
    const opts = getNewQuestionOptions(itemIndex);
    setNewQuestionOptions(
      itemIndex,
      opts.map((opt, i) => ({ ...opt, isCorrect: i === optionIndex })),
    );
  };

  const addNewOption = (itemIndex: number) => {
    setNewQuestionOptions(itemIndex, [
      ...getNewQuestionOptions(itemIndex),
      { text: "", isCorrect: false },
    ]);
  };

  const removeNewOption = (itemIndex: number, optionIndex: number) => {
    const opts = getNewQuestionOptions(itemIndex);
    if (opts.length <= 2) return;
    const updated = opts.filter((_, i) => i !== optionIndex);
    const hasCorrect = updated.some((o) => o.isCorrect);
    setNewQuestionOptions(
      itemIndex,
      hasCorrect
        ? updated
        : updated.map((o, i) => ({ ...o, isCorrect: i === 0 })),
    );
  };

  const canAddNewQuestion = (itemIndex: number) => {
    const qText = getNewQuestionText(itemIndex);
    if (!qText.trim()) return false;
    const filled = getNewQuestionOptions(itemIndex).filter((o) => o.text.trim() !== "");
    if (filled.length < 2) return false;
    return getNewQuestionOptions(itemIndex).some(
      (o) => o.isCorrect && o.text.trim() !== "",
    );
  };

  const saveNewQuestion = (itemIndex: number) => {
    if (!canAddNewQuestion(itemIndex)) return;

    const filledOptions = getNewQuestionOptions(itemIndex)
      .filter((o) => o.text.trim() !== "")
      .map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect }));

    const currentQuestions = items[itemIndex].questions;
    updateItem(itemIndex, "questions", [
      ...currentQuestions,
      {
        fragment_index: getNewQuestionFragmentIndex(itemIndex),
        question: getNewQuestionText(itemIndex).trim(),
        options: filledOptions,
      },
    ]);
    resetNewQuestion(itemIndex);
  };

  // --- Actions for editing existing questions ---
  const startEditingQA = (itemIndex: number, qIndex: number, qa: QA) => {
    setEditingQA({
      itemIndex,
      qIndex,
      fragment_index: qa.fragment_index,
      question: qa.question,
      options: qa.options.map((opt) => ({ ...opt })),
    });
  };

  const handleEditOptionText = (index: number, text: string) => {
    if (!editingQA) return;
    setEditingQA({
      ...editingQA,
      options: editingQA.options.map((opt, i) =>
        i === index ? { ...opt, text } : opt,
      ),
    });
  };

  const handleEditSetCorrect = (index: number) => {
    if (!editingQA) return;
    setEditingQA({
      ...editingQA,
      options: editingQA.options.map((opt, i) => ({
        ...opt,
        isCorrect: i === index,
      })),
    });
  };

  const addEditOption = () => {
    if (!editingQA) return;
    setEditingQA({
      ...editingQA,
      options: [...editingQA.options, { text: "", isCorrect: false }],
    });
  };

  const removeEditOption = (index: number) => {
    if (!editingQA) return;
    const opts = editingQA.options;
    if (opts.length <= 2) return;
    const updated = opts.filter((_, i) => i !== index);
    const hasCorrect = updated.some((o) => o.isCorrect);
    setEditingQA({
      ...editingQA,
      options: hasCorrect
        ? updated
        : updated.map((o, i) => ({ ...o, isCorrect: i === 0 })),
    });
  };

  const canSaveEdit = () => {
    if (!editingQA) return false;
    if (!editingQA.question.trim()) return false;
    const filled = editingQA.options.filter((o) => o.text.trim() !== "");
    if (filled.length < 2) return false;
    return editingQA.options.some((o) => o.isCorrect && o.text.trim() !== "");
  };

  const saveEditingQA = () => {
    if (!editingQA) return;
    const { itemIndex, qIndex, fragment_index, question, options } = editingQA;
    if (!question.trim()) return;
    const filledOptions = options
      .filter((o) => o.text.trim() !== "")
      .map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect }));

    if (filledOptions.length < 2) return;
    if (!filledOptions.some((o) => o.isCorrect)) return;

    const currentQuestions = [...items[itemIndex].questions];
    currentQuestions[qIndex] = {
      fragment_index,
      question: question.trim(),
      options: filledOptions,
    };

    updateItem(itemIndex, "questions", currentQuestions);
    setEditingQA(null);
  };

  const cancelEditingQA = () => {
    setEditingQA(null);
  };

  const removeQA = (itemIndex: number, qIndex: number) => {
    const currentQuestions = items[itemIndex].questions;
    updateItem(
      itemIndex,
      "questions",
      currentQuestions.filter((_, i) => i !== qIndex),
    );
  };

  return (
    <div className="w-full space-y-5 bg-[#fffcf2]/30 p-1 rounded-2xl">
      <FormInput
        label="Title"
        placeholder="e.g. The Legend of the Golden Key"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
        onCopy={() => navigator.clipboard.writeText(exercise.name)}
      />
      <FormInput
        label="Description"
        placeholder="e.g. Read each part of the story and answer the quiz at the end."
        value={exercise.description}
        onChangeText={(text) => updateField("description", text)}
        multiline
        onCopy={() => navigator.clipboard.writeText(exercise.description)}
      />

      {items.map((item, itemIndex) => {
        const hasNoFragments = !item.fragments || item.fragments.length === 0;
        const hasNoQuestions = !item.questions || item.questions.length === 0;
        const isItemInvalid =
          hasNoFragments ||
          hasNoQuestions ||
          item.fragments.some((f) => !f.story?.trim());

        return (
          <div
            key={itemIndex}
            className={`mt-4 p-6 bg-white rounded-2xl border transition-all duration-200 shadow-sm ${
              isItemInvalid
                ? "border-amber-300 ring-2 ring-amber-50"
                : "border-slate-200/70"
            }`}
          >
            {/* Header of Item */}
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
              <span className="font-extrabold text-cyan-750 text-xs tracking-wider uppercase">
                Storytelling Session {itemIndex + 1}
              </span>
              {items.length > 1 && (
                <button
                  type="button"
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded-xl hover:bg-rose-50"
                  onClick={() => removeItem(itemIndex)}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* --- FRAGMENTS SECTION --- */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Story Fragments</h4>
                  <p className="text-[11px] text-slate-400">
                    Add pages or segments of the story with their corresponding illustrations.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => addFragment(itemIndex)}
                  leftIcon={<Plus size={16} />}
                  className="py-1.5 px-3 text-xs"
                >
                  Add Fragment
                </Button>
              </div>

              <div className="space-y-4">
                {item.fragments.map((frag, fragIndex) => (
                  <div
                    key={fragIndex}
                    className="p-4 bg-slate-50/50 border border-slate-150 rounded-xl space-y-3 relative"
                  >
                    {/* Fragment Card Header */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">
                        Fragment {fragIndex + 1}
                      </span>
                      <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-lg p-0.5 shadow-sm">
                        <button
                          type="button"
                          disabled={fragIndex === 0}
                          onClick={() => moveFragment(itemIndex, fragIndex, "up")}
                          className="p-1 text-slate-400 hover:text-cyan-600 disabled:opacity-30 transition-colors cursor-pointer"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={fragIndex === item.fragments.length - 1}
                          onClick={() => moveFragment(itemIndex, fragIndex, "down")}
                          className="p-1 text-slate-400 hover:text-cyan-600 disabled:opacity-30 transition-colors cursor-pointer"
                        >
                          <ArrowDown size={14} />
                        </button>
                        {item.fragments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFragment(itemIndex, fragIndex)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Fragment Input Layout (Responsive grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Left: Image Selector */}
                      <div className="md:col-span-4">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 mb-1.5 block">
                          Illustration Image
                        </label>
                        {frag.cover_image ? (
                          <div className="relative w-full h-32 overflow-hidden rounded-xl border border-slate-200 bg-white flex items-center justify-center">
                            {isDraftPlaceholder(frag.cover_image) ? (
                              <div className="flex flex-col items-center justify-center p-2 text-center select-none">
                                <ImageIcon className="w-6 h-6 text-cyan-650 mb-1 animate-pulse" />
                                <span
                                  className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]"
                                  title={(frag.cover_image as any).name}
                                >
                                  {(frag.cover_image as any).name}
                                </span>
                                <span className="text-[8px] text-rose-500 font-bold uppercase tracking-wider mt-1">
                                  Re-upload needed
                                </span>
                              </div>
                            ) : (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={previewSrc(frag.cover_image)}
                                alt={`Fragment ${fragIndex + 1}`}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <button
                              type="button"
                              className="absolute top-1.5 right-1.5 p-1 bg-white/90 shadow-sm rounded-lg text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                              onClick={() => updateFragmentField(itemIndex, fragIndex, "cover_image", "")}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="w-full h-32 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/5 rounded-xl text-slate-450 transition-all cursor-pointer"
                            onClick={() => fileInputRefs.current[`${itemIndex}-${fragIndex}`]?.click()}
                          >
                            <ImageIcon size={22} className="text-slate-400" />
                            <span className="text-[11px] font-semibold">Upload Image</span>
                          </button>
                        )}
                        <input
                          ref={(el) => {
                            fileInputRefs.current[`${itemIndex}-${fragIndex}`] = el;
                          }}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleCoverChange(itemIndex, fragIndex, e)}
                        />
                      </div>

                      {/* Right: Text Input */}
                      <div className="md:col-span-8">
                        <FormInput
                          label="Fragment Story Text"
                          placeholder="Compose the story segment for this slide..."
                          value={frag.story || ""}
                          onChangeText={(text) =>
                            updateFragmentField(itemIndex, fragIndex, "story", text)
                          }
                          multiline
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* --- QUESTIONS SECTION --- */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Questions & Answers</h4>
                <p className="text-[11px] text-slate-400">
                  Formulate questions that will be answered at the end, associated with specific fragments.
                </p>
              </div>

              {/* List of existing Questions */}
              {item.questions.map((qa, qIndex) => {
                const isEditingThis =
                  editingQA &&
                  editingQA.itemIndex === itemIndex &&
                  editingQA.qIndex === qIndex;

                if (isEditingThis && editingQA) {
                  return (
                    <div
                      key={qIndex}
                      className="p-5 bg-cyan-50/10 border border-cyan-150 rounded-xl space-y-4 shadow-inner animate-fade-in"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          label="Question Text"
                          placeholder="e.g. What color was the wolf?"
                          value={editingQA.question}
                          onChangeText={(text) =>
                            setEditingQA({ ...editingQA, question: text })
                          }
                        />

                        {/* Associated fragment selector */}
                        <div className="space-y-1.5 w-full">
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
                            Associated Fragment
                          </label>
                          <select
                            className="w-full bg-slate-50 border border-slate-250 text-slate-900 rounded-xl p-3 placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all duration-200 text-sm cursor-pointer"
                            value={editingQA.fragment_index}
                            onChange={(e) =>
                              setEditingQA({
                                ...editingQA,
                                fragment_index: parseInt(e.target.value),
                              })
                            }
                          >
                            {item.fragments.map((_, fIdx) => (
                              <option key={fIdx} value={fIdx}>
                                Fragment {fIdx + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Options */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
                          Options
                        </label>
                        {editingQA.options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <button
                              type="button"
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors border-slate-400 hover:border-cyan-500 ${
                                opt.isCorrect ? "border-cyan-500 text-cyan-500" : ""
                              }`}
                              onClick={() => handleEditSetCorrect(i)}
                            >
                              {opt.isCorrect && (
                                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                              )}
                            </button>
                            <div className="flex-1">
                              <FormInput
                                placeholder={`Option ${i + 1}${opt.isCorrect ? " (Correct)" : ""}`}
                                value={opt.text}
                                onChangeText={(text) => handleEditOptionText(i, text)}
                              />
                            </div>
                            {editingQA.options.length > 2 && (
                              <button
                                type="button"
                                className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                onClick={() => removeEditOption(i)}
                              >
                                <X size={18} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          className="text-cyan-600 hover:text-cyan-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          onClick={addEditOption}
                        >
                          <Plus size={14} /> Add option
                        </button>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outlined"
                            onClick={cancelEditingQA}
                            className="py-1.5 px-3 text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            onClick={saveEditingQA}
                            disabled={!canSaveEdit()}
                            className="py-1.5 px-3"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={qIndex}
                    className="p-4 bg-white border border-slate-150 rounded-xl flex items-start justify-between gap-4 shadow-sm hover:shadow transition-shadow duration-150"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-800 text-sm">
                          Q: {qa.question}
                        </p>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 text-[9px] font-extrabold uppercase tracking-wide">
                          Fragment {qa.fragment_index + 1}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        {(qa.options || []).map((opt, oIndex) => (
                          <span
                            key={oIndex}
                            className={`px-3 py-2 rounded-xl text-xs border flex items-center gap-2 ${
                              opt.isCorrect
                                ? "bg-emerald-50/50 border-emerald-200 text-emerald-700 font-bold"
                                : "bg-slate-55/30 border-slate-100 text-slate-500"
                            }`}
                          >
                            {opt.isCorrect ? (
                              <CheckCircle2 size={14} className="text-emerald-600" />
                            ) : (
                              <Circle size={14} className="text-slate-350" />
                            )}
                            {opt.text}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0 self-start">
                      <button
                        type="button"
                        className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                        onClick={() => startEditingQA(itemIndex, qIndex, qa)}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-55 rounded-xl transition-colors cursor-pointer"
                        onClick={() => removeQA(itemIndex, qIndex)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Formulation Form for adding a new Question */}
              <div className="p-5 bg-slate-50/50 border border-slate-200/80 rounded-xl space-y-4">
                <div className="text-xs font-bold text-slate-650 flex items-center gap-1">
                  <HelpCircle size={14} className="text-cyan-600" />
                  <span>Formulate New Question</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Question Text"
                    placeholder="e.g. What color was the wolf?"
                    value={getNewQuestionText(itemIndex)}
                    onChangeText={(text) => setNewQuestionText(itemIndex, text)}
                  />

                  {/* Associated fragment selector */}
                  <div className="space-y-1.5 w-full">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
                      Associate to Story Segment
                    </label>
                    <select
                      className="w-full bg-white border border-slate-205 text-slate-900 rounded-xl p-3 placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all duration-200 text-sm cursor-pointer shadow-sm"
                      value={getNewQuestionFragmentIndex(itemIndex)}
                      onChange={(e) =>
                        setNewQuestionFragmentIndex(itemIndex, parseInt(e.target.value))
                      }
                    >
                      {item.fragments.map((_, fIdx) => (
                        <option key={fIdx} value={fIdx}>
                          Fragment {fIdx + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Options list */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
                    Answer Options
                  </label>
                  {getNewQuestionOptions(itemIndex).map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <button
                        type="button"
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors border-slate-400 hover:border-cyan-400 ${
                          opt.isCorrect ? "border-cyan-400 text-cyan-400" : ""
                        }`}
                        onClick={() => handleNewSetCorrect(itemIndex, i)}
                      >
                        {opt.isCorrect && (
                          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <FormInput
                          placeholder={`Option ${i + 1}${opt.isCorrect ? " (Correct)" : ""}`}
                          value={opt.text}
                          onChangeText={(text) => handleNewOptionText(itemIndex, i, text)}
                        />
                      </div>
                      {getNewQuestionOptions(itemIndex).length > 2 && (
                        <button
                          type="button"
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                          onClick={() => removeNewOption(itemIndex, i)}
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    className="text-cyan-600 hover:text-cyan-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    onClick={() => addNewOption(itemIndex)}
                  >
                    <Plus size={14} /> Add Option
                  </button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => saveNewQuestion(itemIndex)}
                    disabled={!canAddNewQuestion(itemIndex)}
                    leftIcon={<Plus size={16} />}
                    className="py-1.5 px-3.5 text-xs"
                  >
                    Save Question
                  </Button>
                </div>
              </div>
            </div>

            {/* Validation Banner */}
            {isItemInvalid && (
              <div className="mt-4 flex items-start gap-2 text-xs text-amber-700 bg-amber-50/50 p-3 rounded-xl border border-amber-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div className="space-y-1">
                  <span className="font-extrabold uppercase text-[9px] tracking-wider block text-amber-800">
                    Incomplete Configuration
                  </span>
                  <p>
                    Storytelling requires writing text for all fragments and formulating at least one question with options.
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Outer Add Item Button (if multiple storytelling sessions are supported) */}
      <Button
        variant="outlined"
        onClick={addItem}
        leftIcon={<Plus size={18} />}
        className="w-full mt-4 border-dashed hover:border-cyan-500/30 text-cyan-750 hover:bg-cyan-500/5 bg-white shadow-sm"
      >
        Add Another Session
      </Button>
    </div>
  );
}
