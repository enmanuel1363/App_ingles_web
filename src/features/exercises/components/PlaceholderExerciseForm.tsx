type Props = {
  id_class: string;
  type: string;
  order_index: number;
};

export default function PlaceholderExerciseForm({ type }: Props) {
  return (
    <div className="w-full">
      <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-2xl shadow-md">
        <p className="m-0 text-slate-500 text-sm">
          The form for <strong className="text-slate-850">{type}</strong> will be implemented in a
          subsequent phase.
        </p>
      </div>
    </div>
  );
}
