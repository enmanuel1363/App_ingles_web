"use client";

import React from "react";
import FormInput from "@/components/ui/FormInput";

interface TongueTwisterChallengeFormProps {
  content: {
    tongueTwister?: string;
    durationSeconds?: number;
    maxAttempts?: number;
  };
  onChangeContent: (content: any) => void;
}

export default function TongueTwisterChallengeForm({
  content,
  onChangeContent,
}: TongueTwisterChallengeFormProps) {
  const handleFieldChange = (field: string, val: any) => {
    onChangeContent({ ...content, [field]: val });
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="Tongue Twister Text"
        placeholder="e.g. She sells sea shells by the sea shore..."
        value={content.tongueTwister || ""}
        onChangeText={(val) => handleFieldChange("tongueTwister", val)}
        multiline
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
            Time Limit (seconds)
          </label>
          <input
            type="number"
            value={content.durationSeconds || 20}
            onChange={(e) => handleFieldChange("durationSeconds", Number(e.target.value))}
            className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl p-2.5 focus:border-cyan-500 text-xs font-semibold outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
            Max Retries / Attempts
          </label>
          <input
            type="number"
            value={content.maxAttempts || 3}
            onChange={(e) => handleFieldChange("maxAttempts", Number(e.target.value))}
            className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl p-2.5 focus:border-cyan-500 text-xs font-semibold outline-none"
          />
        </div>
      </div>
    </div>
  );
}
