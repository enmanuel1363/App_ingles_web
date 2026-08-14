"use client";

import React from "react";
import FormInput from "@/components/ui/FormInput";

interface SpeakBeforeTimerFormProps {
  content: {
    phraseToSpeak?: string;
    durationSeconds?: number;
  };
  onChangeContent: (content: any) => void;
}

export default function SpeakBeforeTimerForm({
  content,
  onChangeContent,
}: SpeakBeforeTimerFormProps) {
  const duration = content.durationSeconds || 15;
  const durationVal = duration > 15 ? 15 : duration;

  const handleFieldChange = (field: string, val: any) => {
    onChangeContent({ ...content, [field]: val });
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="Phrase to Speak"
        placeholder="e.g. The quick brown fox jumps over the lazy dog."
        value={content.phraseToSpeak || ""}
        onChangeText={(val) => handleFieldChange("phraseToSpeak", val)}
      />
      <div className="space-y-1.5">
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
          Time Limit (seconds, Max 15s)
        </label>
        <input
          type="number"
          max={15}
          min={1}
          value={durationVal}
          onChange={(e) => {
            let val = Number(e.target.value);
            if (val > 15) val = 15;
            handleFieldChange("durationSeconds", val);
          }}
          className="w-1/3 bg-white border border-slate-200 text-slate-900 rounded-xl p-2.5 focus:border-cyan-500 text-xs font-semibold outline-none"
        />
      </div>
    </div>
  );
}
