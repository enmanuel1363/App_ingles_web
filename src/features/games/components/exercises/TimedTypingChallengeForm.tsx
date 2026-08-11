"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import AlertModal from "@/components/ui/AlertModal";
import { Plus, Trash2, Keyboard } from "lucide-react";

interface TimedTypingChallengeFormProps {
  content: {
    words: string[];
    timeLimitSeconds: number;
  };
  onChangeContent: (content: any) => void;
}

export default function TimedTypingChallengeForm({
  content,
  onChangeContent,
}: TimedTypingChallengeFormProps) {
  const words = content.words || [""];
  const timeLimitSeconds = content.timeLimitSeconds || 30;

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title?: string;
    message: string;
    type?: "success" | "error" | "info";
  }>({ visible: false, message: "" });

  const handleWordChange = (idx: number, val: string) => {
    const updated = [...words];
    updated[idx] = val;
    onChangeContent({ ...content, words: updated });
  };

  const handleAddWord = () => {
    if (words.length >= 6) {
      setAlertConfig({
        visible: true,
        title: "Limit Reached",
        message: "A typing challenge can have a maximum of 6 words!",
        type: "info",
      });
      return;
    }
    onChangeContent({ ...content, words: [...words, ""] });
  };

  const handleRemoveWord = (idx: number) => {
    if (words.length <= 1) {
      setAlertConfig({
        visible: true,
        title: "Validation Error",
        message: "You must include at least 1 word for the challenge!",
        type: "info",
      });
      return;
    }
    const updated = words.filter((_, i) => i !== idx);
    onChangeContent({ ...content, words: updated });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeContent({ ...content, timeLimitSeconds: Number(e.target.value) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 flex items-center gap-1">
          <Keyboard className="w-3.5 h-3.5" /> Words to Type ({words.length} of 6)
        </label>
        
        {words.length < 6 && (
          <Button
            variant="secondary"
            type="button"
            leftIcon={<Plus className="w-3 h-3" />}
            onClick={handleAddWord}
            className="text-[10px] font-black py-1 px-2.5 rounded-lg border border-slate-200"
          >
            Add Word
          </Button>
        )}
      </div>

      {/* Words Inputs List */}
      <div className="space-y-3">
        {words.map((word, idx) => (
          <div key={idx} className="flex items-center space-x-3 bg-white p-2 border border-slate-200 rounded-xl">
            <span className="text-xs font-black text-slate-400 w-5 text-center">
              {idx + 1}
            </span>
            <input
              type="text"
              value={word}
              onChange={(e) => handleWordChange(idx, e.target.value)}
              placeholder="e.g. apple"
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500 font-bold"
            />
            {words.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveWord(idx)}
                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                title="Remove Word"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Time Limit Setting */}
      <div className="space-y-1.5 border-t border-slate-150 pt-4">
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Time Limit (seconds)
        </label>
        <input
          type="number"
          value={timeLimitSeconds}
          onChange={handleTimeChange}
          className="w-1/3 bg-white border border-slate-200 text-slate-900 rounded-xl p-2.5 focus:border-cyan-500 text-xs font-semibold outline-none"
        />
      </div>

      <AlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
