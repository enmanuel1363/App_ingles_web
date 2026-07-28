"use client";

import FormInput from "@/components/ui/FormInput";
import Button from "@/components/ui/Button";
import UploadImageModal from "@/components/ui/UploadImageModal";
import { useState } from "react";
import { useExerciseStore } from '../hooks/useExerciseStore';
import { X, Plus, Image as ImageIcon } from "lucide-react";

const EMPTY_ITEM = { images: [] as { url: string | File; description: string }[] };

type Props = {
  id_class: string;
  type: "image_gallery";
  order_index: number;
};

export default function GalleryExerciseForm({ order_index }: Props) {
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

  const updateItem = (itemIndex: number, field: string, value: any) => {
    const newItems = items.map((item: any, i: number) =>
      i === itemIndex ? { ...item, [field]: value } : item,
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

  const addImageToItem = (
    itemIndex: number,
    imageData: { url: string | File; description: string },
  ) => {
    const item = items[itemIndex];
    const newImages = [...(item.images || []), imageData];
    updateItem(itemIndex, "images", newImages);
  };

  const removeImageFromItem = (itemIndex: number, imgIndex: number) => {
    const item = items[itemIndex];
    updateItem(
      itemIndex,
      "images",
      (item.images || []).filter((_: any, i: number) => i !== imgIndex),
    );
  };

  const previewSrc = (url: string | File) =>
    typeof url === "string" ? url : URL.createObjectURL(url);

  return (
    <div className="w-full space-y-4">
      <FormInput
        label="Exercise title"
        placeholder="e.g. Vocabulary: Fruits and vegetables"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
      />
      <FormInput
        label="Description"
        placeholder="Describe the gallery..."
        value={exercise.description}
        onChangeText={(text) => updateField("description", text)}
        multiline
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

          {item.images?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {item.images.map((img: any, imgIndex: number) => (
                <div key={imgIndex} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50/70">
                  <div className="relative w-full h-32">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewSrc(img.url)}
                      alt={img.description}
                      className="w-full h-full object-cover"
                    />
                    <button
                      className="absolute top-2 right-2 p-1.5 bg-slate-50/80 rounded-lg text-slate-650 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => removeImageFromItem(itemIndex, imgIndex)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="p-3 text-sm text-slate-650 text-center font-medium">{img.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50/70 transition-all">
              <ImageIcon size={32} className="text-slate-500 mb-2" />
              <span className="mt-2 text-sm font-medium">No images in this section</span>
            </div>
          )}

          <Button
            variant="outlined"
            onClick={() => {
              setUploadingItemIndex(itemIndex);
              setShowUploadModal(true);
            }}
            leftIcon={<Plus size={18} />}
            className="w-full mt-4 border-dashed hover:border-cyan-500/30 text-cyan-650 hover:bg-cyan-500/5"
          >
            Add Image
          </Button>
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
        onSave={(imgData) => {
          if (uploadingItemIndex !== null) addImageToItem(uploadingItemIndex, imgData);
        }}
        title="Add to Gallery"
        descriptionLabel="Image description"
        descriptionPlaceholder="e.g. Red apple"
      />
    </div>
  );
}
