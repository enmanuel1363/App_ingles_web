"use client";

import { ClipboardIcon } from "lucide-react";

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  onCopy?: () => void;
};

export default function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
  onCopy,
}: Props) {
  const inputClass = "w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all duration-200 text-sm";
  
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
          {label}
        </label>
      )}
      <div className="relative w-full">
        {multiline ? (
          <textarea
            className={`${inputClass} min-h-[100px] resize-y ${onCopy ? "pr-12" : ""}`}
            placeholder={placeholder}
            value={value || ""}
            onChange={(e) => onChangeText(e.target.value)}
          />
        ) : (
          <input
            className={`${inputClass} ${onCopy ? "pr-12" : ""}`}
            placeholder={placeholder}
            value={value || ""}
            onChange={(e) => onChangeText(e.target.value)}
          />
        )}
        
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className={`absolute rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors border border-slate-200 shadow-sm z-10 p-1.5 ${
              multiline ? "top-3 right-3" : "right-3 top-1/2 -translate-y-1/2"
            }`}
          >
            <ClipboardIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
