"use client";

import React from "react";
import FormInput from "@/components/ui/FormInput";

interface ImageOption {
  id: string;
  url: File | string;
  label: string;
}

interface IdentifyPictureReadingNameFormProps {
  content: {
    wordToRead: string;
    imageOptions: ImageOption[];
    correctAnswer: string;
  };
  onChangeContent: (content: any) => void;
}

export default function IdentifyPictureReadingNameForm({
  content,
  onChangeContent,
}: IdentifyPictureReadingNameFormProps) {
  const imageOptions = content.imageOptions || [
    { id: "1", url: "", label: "" },
    { id: "2", url: "", label: "" },
  ];

  const handleFileChange = (idx: number, file: File) => {
    const updatedCards = [...imageOptions];
    if (!updatedCards[idx]) {
      updatedCards[idx] = { id: String(idx + 1), url: "", label: "" };
    }
    updatedCards[idx] = { ...updatedCards[idx], url: file };
    onChangeContent({ ...content, imageOptions: updatedCards });
  };

  const handleLabelChange = (idx: number, label: string) => {
    const updatedCards = [...imageOptions];
    if (!updatedCards[idx]) {
      updatedCards[idx] = { id: String(idx + 1), url: "", label: "" };
    }
    updatedCards[idx] = { ...updatedCards[idx], label };
    onChangeContent({ ...content, imageOptions: updatedCards });
  };

  const handleWordChange = (wordToRead: string) => {
    onChangeContent({ ...content, wordToRead });
  };

  const handleCorrectAnswerChange = (correctAnswer: string) => {
    onChangeContent({ ...content, correctAnswer });
  };

  return (
    <div className="space-y-4">
      <FormInput
        label="Word to read"
        placeholder="e.g. Car"
        value={content.wordToRead || ""}
        onChangeText={handleWordChange}
      />
      <div className="space-y-3">
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
          Image Options (Minimum 2)
        </label>
        {[0, 1].map((cardIdx) => (
          <div
            key={cardIdx}
            className="grid grid-cols-2 gap-4 border border-slate-200/50 bg-white p-3 rounded-xl items-center"
          >
            <div className="flex items-center space-x-2 w-full">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChange(cardIdx, file);
                }}
                className="text-xs text-slate-550 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer file:cursor-pointer w-full"
              />
              {imageOptions[cardIdx]?.url && (
                <div className="w-8 h-8 rounded border border-slate-100 bg-slate-50 shrink-0">
                  <img
                    src={
                      typeof imageOptions[cardIdx].url === "string"
                        ? (imageOptions[cardIdx].url as string)
                        : URL.createObjectURL(imageOptions[cardIdx].url as File)
                    }
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Label (e.g. Car)"
              value={imageOptions[cardIdx]?.label || ""}
              onChange={(e) => handleLabelChange(cardIdx, e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500 font-semibold"
            />
          </div>
        ))}
      </div>
      <FormInput
        label="Correct Answer Label"
        placeholder="e.g. Car"
        value={content.correctAnswer || ""}
        onChangeText={handleCorrectAnswerChange}
      />
    </div>
  );
}
