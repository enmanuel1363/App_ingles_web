"use client";

import React from "react";
import FormInput from "@/components/ui/FormInput";
import { Music, FileCheck } from "lucide-react";

interface IdentifyAudioFormProps {
  content: {
    audioUrl?: File | string;
    options?: string[];
    correctAnswer?: string;
  };
  onChangeContent: (content: any) => void;
}

export default function IdentifyAudioForm({
  content,
  onChangeContent,
}: IdentifyAudioFormProps) {
  const options = content.options || ["", "", ""];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChangeContent({ ...content, audioUrl: file });
    }
  };

  const handleOptionChange = (idx: number, val: string) => {
    const updatedOpts = [...options];
    updatedOpts[idx] = val;
    onChangeContent({ ...content, options: updatedOpts });
  };

  const handleFieldChange = (field: string, val: any) => {
    if (field === "correctAnswer") {
      const updatedOpts = [...options];
      updatedOpts[0] = val;
      onChangeContent({ ...content, correctAnswer: val, options: updatedOpts });
    } else {
      onChangeContent({ ...content, [field]: val });
    }
  };

  return (
    <div className="space-y-4">
      {/* File Upload */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 flex items-center gap-1">
          <Music className="w-3.5 h-3.5" /> Upload Audio File
        </label>
        <div className="flex items-center space-x-4 bg-white p-3 border border-slate-200 rounded-xl">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="text-xs text-slate-550 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#B4FF2B]/20 file:text-slate-900 hover:file:bg-[#B4FF2B]/35 cursor-pointer file:cursor-pointer w-full"
          />
          {content.audioUrl && (
            <span className="text-xs text-slate-500 font-semibold truncate max-w-[200px] flex items-center gap-1">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              {typeof content.audioUrl === "string" ? "Remote Audio" : content.audioUrl.name}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <FormInput
          label="Correct Answer"
          placeholder="e.g. Correct option text"
          value={content.correctAnswer || ""}
          onChangeText={(val) => handleFieldChange("correctAnswer", val)}
        />
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Distractors (Incorrect Answers)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Distractor 1
              </label>
              <input
                type="text"
                value={options[1] || ""}
                onChange={(e) => handleOptionChange(1, e.target.value)}
                placeholder="e.g. Distractor 1"
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Distractor 2
              </label>
              <input
                type="text"
                value={options[2] || ""}
                onChange={(e) => handleOptionChange(2, e.target.value)}
                placeholder="e.g. Distractor 2"
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs font-bold"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
