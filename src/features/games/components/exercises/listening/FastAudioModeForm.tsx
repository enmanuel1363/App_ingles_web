"use client";

import React from "react";
import FormInput from "@/components/ui/FormInput";
import { Music, FileCheck } from "lucide-react";

interface FastAudioModeFormProps {
  content: {
    audioUrl?: File | string;
    options?: string[];
    correctAnswer?: string;
    playbackRate?: number;
  };
  onChangeContent: (content: any) => void;
}

export default function FastAudioModeForm({
  content,
  onChangeContent,
}: FastAudioModeFormProps) {
  const options = content.options || ["", "", "", ""];

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
    onChangeContent({ ...content, [field]: val });
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

      {/* Options Selection */}
      <div className="grid grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((optIdx) => (
          <div key={optIdx} className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Option {optIdx + 1}
            </label>
            <input
              type="text"
              value={options[optIdx] || ""}
              onChange={(e) => handleOptionChange(optIdx, e.target.value)}
              placeholder={`e.g. Option ${optIdx + 1}`}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs font-bold"
            />
          </div>
        ))}
      </div>

      {/* Correct answer text */}
      <FormInput
        label="Correct Answer"
        placeholder="e.g. Correct phrase"
        value={content.correctAnswer || ""}
        onChangeText={(val) => handleFieldChange("correctAnswer", val)}
      />

      {/* Speed multiplier */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Playback Speed Multiplier (default: 1.6x)
        </label>
        <input
          type="number"
          step="0.1"
          value={content.playbackRate || 1.6}
          onChange={(e) => handleFieldChange("playbackRate", Number(e.target.value))}
          className="bg-white border border-slate-200 text-slate-900 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500 font-semibold w-1/3"
        />
      </div>
    </div>
  );
}
