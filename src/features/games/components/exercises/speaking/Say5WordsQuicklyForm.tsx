"use client";

import React from "react";

interface Say5WordsQuicklyFormProps {
  content: {
    words?: string[];
    durationSeconds?: number;
  };
  onChangeContent: (content: any) => void;
}

export default function Say5WordsQuicklyForm({
  content,
  onChangeContent,
}: Say5WordsQuicklyFormProps) {
  const words = content.words || ["", "", "", "", ""];

  const handleFieldChange = (field: string, val: any) => {
    onChangeContent({ ...content, [field]: val });
  };

  const handleWordChange = (idx: number, val: string) => {
    const updated = [...words];
    updated[idx] = val;
    onChangeContent({ ...content, words: updated });
  };

  return (
    <div className="space-y-4">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
        5 Words to Speak Quickly
      </span>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3, 4].map((idx) => (
          <div key={idx} className="space-y-1">
            <input
              type="text"
              placeholder={`Word ${idx + 1}`}
              value={words[idx] || ""}
              onChange={(e) => handleWordChange(idx, e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs font-bold"
            />
          </div>
        ))}
      </div>
      <div className="space-y-1.5 pt-2">
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
          Time Limit (seconds)
        </label>
        <input
          type="number"
          value={content.durationSeconds || 10}
          onChange={(e) => handleFieldChange("durationSeconds", Number(e.target.value))}
          className="w-1/3 bg-white border border-slate-200 text-slate-900 rounded-xl p-2.5 focus:border-cyan-500 text-xs font-semibold outline-none"
        />
      </div>
    </div>
  );
}
