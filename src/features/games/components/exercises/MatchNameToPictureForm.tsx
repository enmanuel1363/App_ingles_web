"use client";

import React from "react";
import FormInput from "@/components/ui/FormInput";
import { Image as ImageIcon } from "lucide-react";

interface MatchNameToPictureFormProps {
  content: {
    imageUrl: File | string;
    options: string[];
    correctAnswer: string;
  };
  onChangeContent: (content: any) => void;
}

export default function MatchNameToPictureForm({
  content,
  onChangeContent,
}: MatchNameToPictureFormProps) {
  const options = content.options || ["", "", "", ""];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChangeContent({ ...content, imageUrl: file });
    }
  };

  const handleOptionChange = (idx: number, val: string) => {
    const updatedOpts = [...options];
    updatedOpts[idx] = val;
    onChangeContent({ ...content, options: updatedOpts });
  };

  const handleFieldChange = (field: string, val: string) => {
    onChangeContent({ ...content, [field]: val });
  };

  return (
    <div className="space-y-4">
      {/* File Upload with Preview */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 flex items-center gap-1">
          <ImageIcon className="w-3.5 h-3.5" /> Upload Challenge Image
        </label>
        <div className="flex items-center space-x-4 bg-white p-3 border border-slate-200 rounded-xl">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#24DFE2]/15 file:text-slate-900 hover:file:bg-[#24DFE2]/25 cursor-pointer file:cursor-pointer w-full"
          />
          {content.imageUrl && (
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
              <img
                src={
                  typeof content.imageUrl === "string"
                    ? content.imageUrl
                    : URL.createObjectURL(content.imageUrl)
                }
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Options Grid */}
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
              placeholder={`e.g. Option {optIdx + 1}`}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs font-bold"
            />
          </div>
        ))}
      </div>

      {/* Correct answer validation */}
      <FormInput
        label="Correct Answer (must match one option exactly)"
        placeholder="e.g. Apple"
        value={content.correctAnswer || ""}
        onChangeText={(val) => handleFieldChange("correctAnswer", val)}
      />
    </div>
  );
}
