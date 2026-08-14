"use client";

import React from "react";
import FormInput from "@/components/ui/FormInput";

interface FluencyChallengeFormProps {
  content: {
    phraseToComplete?: string;
    targetPhrase?: string;
    durationSeconds?: number;
  };
  onChangeContent: (content: any) => void;
}

export default function FluencyChallengeForm({
  content,
  onChangeContent,
}: FluencyChallengeFormProps) {
  const handleFieldChange = (field: string, val: any) => {
    onChangeContent({ ...content, [field]: val });
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="Phrase to Complete / Prompt Start"
        placeholder="e.g. As soon as I arrived home, I..."
        value={content.phraseToComplete || ""}
        onChangeText={(val) => handleFieldChange("phraseToComplete", val)}
      />
      <FormInput
        label="Complete Target Phrase (Expected Pronunciation)"
        placeholder="e.g. As soon as I arrived home, I went straight to sleep."
        value={content.targetPhrase || ""}
        onChangeText={(val) => handleFieldChange("targetPhrase", val)}
      />
      <div className="space-y-1.5">
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
          Time Limit (seconds)
        </label>
        <input
          type="number"
          value={content.durationSeconds || 15}
          onChange={(e) => handleFieldChange("durationSeconds", Number(e.target.value))}
          className="w-1/3 bg-white border border-slate-200 text-slate-900 rounded-xl p-2.5 focus:border-cyan-500 text-xs font-semibold outline-none"
        />
      </div>
    </div>
  );
}
