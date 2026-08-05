type Props = {
  grade: string;
};

const CONFIG: Record<string, { text: string; bg: string; border: string }> = {
  "7mo": { text: "text-cyan-700", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  "8vo": { text: "text-amber-700", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  "9no": { text: "text-emerald-700", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  "10mo": { text: "text-indigo-700", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  "11mo": { text: "text-rose-700", bg: "bg-rose-500/10", border: "border-rose-500/20" },
};

const DEFAULT = { text: "text-cyan-700", bg: "bg-cyan-500/10", border: "border-cyan-500/20" };

export default function GradeIcon({ grade }: Props) {
  const { text, bg, border } = CONFIG[grade] || DEFAULT;

  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${bg} ${text} ${border} shadow-sm shrink-0`}>
      {grade}
    </div>
  );
}
