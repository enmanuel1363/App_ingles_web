"use client";

import FormInput from "@/components/ui/FormInput";
import Button from "@/components/ui/Button";
import UploadImageModal from "@/components/ui/UploadImageModal";
import { useState } from "react";
import { useExerciseStore } from '../hooks/useExerciseStore';
import { X, Plus, Camera, Image as ImageIcon } from "lucide-react";
import { previewSrc, isDraftPlaceholder } from "../utils/imagePreview";


const EMPTY_ITEM = { image_url: "" as string | File, image_title: "" };

type Props = {
  id_class: string;
  type: "write_word";
  order_index: number;
};

export default function WriteWordExerciseForm({ order_index }: Props) {
  const { data, updateExercise } = useExerciseStore();
  const exercise = data[order_index] || {
    name: "",
    description: "",
    content: { items: [{ ...EMPTY_ITEM }] },
  };

  const items = exercise.content?.items || [EMPTY_ITEM];
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingItemIndex, setUploadingItemIndex] = useState<number | null>(null);

  const updateField = (field: string, value: any) => {
    updateExercise(order_index, { ...exercise, [field]: value });
  };

  const updateContent = (field: string, value: any) => {
    updateExercise(order_index, {
      ...exercise,
      content: { ...exercise.content, [field]: value },
    });
  };

  const updateItem = (itemIndex: number, fields: Record<string, any>) => {
    const newItems = items.map((item: any, i: number) =>
      i === itemIndex ? { ...item, ...fields } : item,
    );
    updateContent("items", newItems);
  };

  const addItem = () => updateContent("items", [...items, { ...EMPTY_ITEM }]);

  const removeItem = (itemIndex: number) => {
    if (items.length <= 1) return;
    updateContent(
      "items",
      items.filter((_: any, i: number) => i !== itemIndex),
    );
  };

  const handleSaveImage = (imageData: { url: string | File; description: string }) => {
    if (uploadingItemIndex === null) return;
    updateItem(uploadingItemIndex, {
      image_url: imageData.url,
      image_title: imageData.description,
    });
  };


  return (
    <div className="w-full space-y-4">
      <FormInput
        label="Title of the exercise"
        placeholder="e.g. What is this?"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
        onCopy={() => navigator.clipboard.writeText(exercise.name)}
      />
      <FormInput
        label="Description"
        placeholder="Observe the image and write the correct word"
        value={exercise.description}
        onChangeText={(text) => updateField("description", text)}
        multiline
        onCopy={() => navigator.clipboard.writeText(exercise.description)}
      />

      {items.map((item: any, itemIndex: number) => (
        <div key={itemIndex} className="mt-4 p-5 bg-slate-50/70 rounded-xl border border-slate-200/80 ">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-cyan-650 text-sm tracking-wide uppercase">Item {itemIndex + 1}</span>
            {items.length > 1 && (
              <button
                className="text-slate-500 hover:text-rose-600 transition-colors p-1 rounded-lg hover:bg-rose-500/5"
                onClick={() => removeItem(itemIndex)}
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 mb-2">
            <span className="text-sm font-medium text-slate-650 block">Image of the Exercise</span>
            <button
              className="flex items-center gap-2 text-sm text-cyan-650 hover:text-cyan-300 transition-colors font-medium"
              onClick={() => {
                setUploadingItemIndex(itemIndex);
                setShowUploadModal(true);
              }}
            >
              <Camera size={16} /> {item.image_url ? "Change" : "Add"}
            </button>
          </div>

          {item.image_url ? (
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="relative w-full h-48 flex items-center justify-center bg-slate-50 border-b border-slate-100">
                {isDraftPlaceholder(item.image_url) ? (
                  <div className="flex flex-col items-center justify-center p-3 text-center select-none">
                    <ImageIcon className="w-8 h-8 text-cyan-600 mb-1" />
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]" title={(item.image_url as any).name}>
                      {(item.image_url as any).name}
                    </span>
                    <span className="text-[9px] text-rose-500 font-bold uppercase tracking-wider mt-0.5">
                      Re-upload image
                    </span>
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewSrc(item.image_url)}
                    alt={item.image_title}
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  className="absolute top-2 right-2 p-1.5 bg-slate-50/80 rounded-lg text-slate-650 hover:text-rose-600 transition-colors"
                  onClick={() => {
                    updateItem(itemIndex, { image_url: "", image_title: "" });
                  }}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-3 border-t border-slate-200 bg-slate-50">
                <span className="text-sm font-medium text-slate-700">{item.image_title}</span>
              </div>
            </div>
          ) : (
            <button
              className="w-full flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50/70 hover:border-cyan-300 transition-all"
              onClick={() => {
                setUploadingItemIndex(itemIndex);
                setShowUploadModal(true);
              }}
            >
              <ImageIcon size={32} className="text-slate-500" />
              <span className="text-sm font-medium mt-2">No image selected</span>
            </button>
          )}
        </div>
      ))}

      <Button
        variant="outlined"
        onClick={addItem}
        leftIcon={<Plus size={18} />}
        className="w-full mt-4 border-dashed hover:border-cyan-500/30 text-cyan-650 hover:bg-cyan-500/5"
      >
        Add item
      </Button>

      <UploadImageModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSave={handleSaveImage}
        title="Exercise Image"
        descriptionLabel="Word to write"
        descriptionPlaceholder="e.g. Apple"
      />
    </div>
  );
}
