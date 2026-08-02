"use client";

import React from "react";
import FormInput from "@/components/ui/FormInput";

interface SpeakingChallengeFormProps {
  subtype: string;
  content: any;
  onChangeContent: (content: any) => void;
}

export default function SpeakingChallengeForm({
  subtype,
  content,
  onChangeContent,
}: SpeakingChallengeFormProps) {
  const handleFieldChange = (field: string, val: any) => {
    onChangeContent({ ...content, [field]: val });
  };

  const handleWordChange = (idx: number, val: string) => {
    const words = content.words || ["", "", "", "", ""];
    const updated = [...words];
    updated[idx] = val;
    onChangeContent({ ...content, words: updated });
  };

  // Render form fields based on subtype
  switch (subtype) {
    case "fluency_challenge":
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

    case "speak_before_timer":
      // Maximum 15 seconds limit
      const duration = content.durationSeconds || 15;
      const durationVal = duration > 15 ? 15 : duration;

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

    case "say_5_words_quickly":
      const words = content.words || ["", "", "", "", ""];
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

    case "tongue_twister_challenge":
    default:
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
}
