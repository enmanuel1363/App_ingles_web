"use client";

import React from "react";
import Button from "@/components/ui/Button";
import { Plus, Trash2, HelpCircle } from "lucide-react";

interface MatchAudioToTextFormProps {
  content: {
    items?: { phrase: string; answer: string }[];
  };
  onChangeContent: (content: any) => void;
}

export default function MatchAudioToTextForm({
  content,
  onChangeContent,
}: MatchAudioToTextFormProps) {
  const items = content.items || [{ phrase: "", answer: "" }];

  const handleItemFieldChange = (
    idx: number,
    field: "phrase" | "answer",
    val: string,
  ) => {
    const updatedItems = [...items];
    updatedItems[idx] = { ...updatedItems[idx], [field]: val };
    onChangeContent({ ...content, items: updatedItems });
  };

  const handleAddItem = () => {
    if (items.length >= 6) return;
    const updatedItems = [...items, { phrase: "", answer: "" }];
    onChangeContent({ ...content, items: updatedItems });
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    const updatedItems = items.filter((_, i) => i !== idx);
    onChangeContent({ ...content, items: updatedItems });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-[#24DFE2]" />
          Match Items ({items.length} of 6)
        </label>
        {items.length < 6 && (
          <Button
            variant="secondary"
            type="button"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleAddItem}
            className="text-[10px] font-black py-1.5 px-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-sm flex items-center gap-1"
          >
            Add Match
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm space-y-3 relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 bg-slate-50 border border-slate-150 py-1 px-2.5 rounded-lg">
                <span className="w-4 h-4 rounded-full bg-[#24DFE2]/20 text-[#14b3b5] flex items-center justify-center text-[10px] font-black">
                  {idx + 1}
                </span>
                Match Item
              </span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-100"
                  title="Remove Match"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 flex items-center gap-1">
                  Phrase
                </label>
                <input
                  type="text"
                  value={item.phrase || ""}
                  onChange={(e) =>
                    handleItemFieldChange(idx, "phrase", e.target.value)
                  }
                  placeholder="e.g. Dog"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#24DFE2] font-bold transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 flex items-center gap-1">
                  Matching (Translation / Text)
                </label>
                <input
                  type="text"
                  value={item.answer || ""}
                  onChange={(e) =>
                    handleItemFieldChange(idx, "answer", e.target.value)
                  }
                  placeholder="e.g. Perro"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 text-xs focus:outline-none focus:bg-white focus:border-[#24DFE2] font-bold transition-all"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
