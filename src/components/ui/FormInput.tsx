"use client";

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
};

export default function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
}: Props) {
  const inputClass = "w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all duration-200 text-sm";
  
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          className={`${inputClass} min-h-[100px] resize-y`}
          placeholder={placeholder}
          value={value || ""}
          onChange={(e) => onChangeText(e.target.value)}
        />
      ) : (
        <input
          className={inputClass}
          placeholder={placeholder}
          value={value || ""}
          onChange={(e) => onChangeText(e.target.value)}
        />
      )}
    </div>
  );
}
