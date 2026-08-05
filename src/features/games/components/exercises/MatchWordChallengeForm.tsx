"use client";

import React from "react";
import Button from "@/components/ui/Button";
import { Plus, Trash2, HelpCircle, CheckCircle2, XCircle } from "lucide-react";

interface MatchWordItem {
  wordToMatch: string;
  correctAnswer: string;
  options: string[]; // [correctAnswer, incorrect1, incorrect2]
}

interface MatchWordChallengeFormProps {
  content: {
    items?: MatchWordItem[];
  };
  onChangeContent: (content: any) => void;
}

export default function MatchWordChallengeForm({
  content,
  onChangeContent,
}: MatchWordChallengeFormProps) {
  const items = content.items || [
    { wordToMatch: "", correctAnswer: "", options: ["", "", ""] },
  ];

  const handleItemFieldChange = (
    itemIdx: number,
    field: keyof Omit<MatchWordItem, "options">,
    val: string
  ) => {
    const updatedItems = [...items];
    const currentItem = { ...updatedItems[itemIdx] };

    if (field === "wordToMatch") {
      currentItem.wordToMatch = val;
    } else if (field === "correctAnswer") {
      currentItem.correctAnswer = val;
      // Actualizamos también la primera opción en options para que coincida con correctAnswer
      const updatedOpts = [...(currentItem.options || ["", "", ""])];
      updatedOpts[0] = val;
      currentItem.options = updatedOpts;
    }

    updatedItems[itemIdx] = currentItem;
    onChangeContent({ ...content, items: updatedItems });
  };

  const handleIncorrectOptionChange = (
    itemIdx: number,
    optIdx: number, // 1 para la primera incorrecta, 2 para la segunda
    val: string
  ) => {
    const updatedItems = [...items];
    const currentItem = { ...updatedItems[itemIdx] };
    const updatedOpts = [...(currentItem.options || ["", "", ""])];

    updatedOpts[optIdx] = val;
    currentItem.options = updatedOpts;

    updatedItems[itemIdx] = currentItem;
    onChangeContent({ ...content, items: updatedItems });
  };

  const handleAddItem = () => {
    if (items.length >= 6) {
      alert("A match word challenge can have a maximum of 6 items!");
      return;
    }
    const newItem: MatchWordItem = {
      wordToMatch: "",
      correctAnswer: "",
      options: ["", "", ""],
    };
    onChangeContent({ ...content, items: [...items, newItem] });
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) {
      alert("You must include at least 1 item for the challenge!");
      return;
    }
    const updated = items.filter((_, i) => i !== idx);
    onChangeContent({ ...content, items: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header section with Add Button */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-[#24DFE2]" />
          Match Word Items ({items.length} of 6)
        </label>

        {items.length < 6 && (
          <Button
            variant="secondary"
            type="button"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleAddItem}
            className="text-[10px] font-black py-1.5 px-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-sm"
          >
            Add Item
          </Button>
        )}
      </div>

      {/* Items list */}
      <div className="space-y-6">
        {items.map((item, idx) => {
          const incorrect1 = item.options?.[1] || "";
          const incorrect2 = item.options?.[2] || "";

          return (
            <div
              key={idx}
              className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4 relative"
            >
              {/* Item Header & Delete button */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 bg-slate-50 border border-slate-150 py-1 px-2.5 rounded-lg">
                  <span className="w-4 h-4 rounded-full bg-[#24DFE2]/20 text-[#14b3b5] flex items-center justify-center text-[10px] font-black">
                    {idx + 1}
                  </span>
                  Word Item
                </span>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-100"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Grid layout for fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Word/Number to Match */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-445 flex items-center gap-1">
                    Word/Number to match
                  </label>
                  <input
                    type="text"
                    value={item.wordToMatch}
                    onChange={(e) =>
                      handleItemFieldChange(idx, "wordToMatch", e.target.value)
                    }
                    placeholder="e.g. Dog (or 5)"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#24DFE2] font-bold transition-all"
                  />
                </div>

                {/* Correct Answer */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    Correct Answer (Match)
                  </label>
                  <input
                    type="text"
                    value={item.correctAnswer}
                    onChange={(e) =>
                      handleItemFieldChange(idx, "correctAnswer", e.target.value)
                    }
                    placeholder="e.g. Perro"
                    className="w-full bg-green-50/20 border border-green-200/80 text-slate-900 rounded-xl p-2.5 text-xs focus:outline-none focus:bg-white focus:border-green-500 font-bold transition-all"
                  />
                </div>
              </div>

              {/* Incorrect options */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-slate-400" />
                  Distractors (Incorrect Answers)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Distractor 1 */}
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={incorrect1}
                      onChange={(e) =>
                        handleIncorrectOptionChange(idx, 1, e.target.value)
                      }
                      placeholder="e.g. Gato (Incorrect 1)"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 text-xs focus:outline-none focus:bg-white focus:border-rose-400 font-bold transition-all"
                    />
                  </div>

                  {/* Distractor 2 */}
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={incorrect2}
                      onChange={(e) =>
                        handleIncorrectOptionChange(idx, 2, e.target.value)
                      }
                      placeholder="e.g. Loro (Incorrect 2)"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 text-xs focus:outline-none focus:bg-white focus:border-rose-400 font-bold transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
