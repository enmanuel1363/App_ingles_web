"use client";

import FormInput from "@/components/ui/FormInput";
import Button from "@/components/ui/Button";
import UploadImageModal from "@/components/ui/UploadImageModal";
import { useState } from "react";
import { useExerciseStore } from '../hooks/useExerciseStore';
import { X, Plus, Link as LinkIcon, Image as ImageIcon, AlertCircle, Edit3 } from "lucide-react";
import { previewSrc, isDraftPlaceholder } from "../utils/imagePreview";


const EMPTY_ITEM = { images: [] as { url: string | File; description: string }[] };

type Props = {
  id_class: string;
  type: "match_names";
  order_index: number;
};

export default function MatchNamesExerciseForm({ order_index }: Props) {
  const { data, updateExercise } = useExerciseStore();
  const exercise = data[order_index] || {
    name: "",
    description: "",
    content: { items: [{ ...EMPTY_ITEM }] },
  };

  const items = exercise.content?.items || [EMPTY_ITEM];
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingItemIndex, setUploadingItemIndex] = useState<number | null>(null);
  const [editingImgIndex, setEditingImgIndex] = useState<number | null>(null);
  const [draggedImgInfo, setDraggedImgInfo] = useState<{ itemIndex: number; imgIndex: number } | null>(null);
  const [dragOverImgInfo, setDragOverImgInfo] = useState<{ itemIndex: number; imgIndex: number } | null>(null);

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

  const addItem = () => updateContent("items", [...items, { images: [] }]);

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
    const currentImages = items[itemIndex].images || [];
    if (currentImages.length < 4) {
      updateItem(itemIndex, { images: [...currentImages, imageData] });
    }
  };

  const updateImageDescription = (
    itemIndex: number,
    imgIndex: number,
    description: string,
  ) => {
    const item = items[itemIndex];
    const newImages = (item.images || []).map((img: any, i: number) =>
      i === imgIndex ? { ...img, description } : img,
    );
    updateItem(itemIndex, { images: newImages });
  };

  const handleSaveImageModal = (imageData: {
    url: string | File;
    description: string;
  }) => {
    if (uploadingItemIndex === null) return;
    if (editingImgIndex !== null) {
      const item = items[uploadingItemIndex];
      const newImages = (item.images || []).map((img: any, i: number) =>
        i === editingImgIndex
          ? { ...img, url: imageData.url, description: imageData.description }
          : img,
      );
      updateItem(uploadingItemIndex, { images: newImages });
    } else {
      addImageToItem(uploadingItemIndex, imageData);
    }
  };

  const removeImageFromItem = (itemIndex: number, imgIndex: number) => {
    updateItem(itemIndex, {
      images: items[itemIndex].images.filter((_: any, i: number) => i !== imgIndex),
    });
  };

  const reorderImages = (itemIndex: number, fromIndex: number, toIndex: number) => {
    const item = items[itemIndex];
    const newImages = [...(item.images || [])];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    updateItem(itemIndex, { images: newImages });
  };


  return (
    <div className="w-full space-y-4">
      <FormInput
        label="Exercise Title"
        placeholder="e.g. Coastal Wildlife Gallery"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
        onCopy={() => navigator.clipboard.writeText(exercise.name)}
      />
      <FormInput
        label="Descriptive Text"
        placeholder="e.g. Match each image with its correct name"
        value={exercise.description}
        onChangeText={(text) => updateField("description", text)}
        multiline
        onCopy={() => navigator.clipboard.writeText(exercise.description)}
      />

      {items.map((item: any, itemIndex: number) => {
        const count = (item.images || []).length;
        const isItemInvalid = count === 0;
        return (
          <div key={itemIndex} className={`mt-4 p-5 bg-slate-50/70 rounded-xl border transition-colors ${
            isItemInvalid ? "border-amber-300 bg-amber-50/10" : "border-slate-200/80"
          }`}>
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

            <div className="mt-4">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span className="text-sm font-medium text-slate-650 mb-2 block">Gallery ({count}/4)</span>
                {count < 4 && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setUploadingItemIndex(itemIndex);
                      setEditingImgIndex(null);
                      setShowUploadModal(true);
                    }}
                    leftIcon={<Plus size={16} />}
                    className="px-3 py-1.5 text-xs font-bold"
                  >
                    Add Image
                  </Button>
                )}
              </div>

              {count > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {item.images.map((img: any, imgIndex: number) => (
                    <div
                      key={imgIndex}
                      draggable
                      onDragStart={(e) => {
                        setDraggedImgInfo({ itemIndex, imgIndex });
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", `${itemIndex},${imgIndex}`);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dragOverImgInfo?.itemIndex !== itemIndex || dragOverImgInfo?.imgIndex !== imgIndex) {
                          setDragOverImgInfo({ itemIndex, imgIndex });
                        }
                      }}
                      onDragLeave={() => {
                        setDragOverImgInfo(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedImgInfo && draggedImgInfo.itemIndex === itemIndex && draggedImgInfo.imgIndex !== imgIndex) {
                          reorderImages(itemIndex, draggedImgInfo.imgIndex, imgIndex);
                        }
                        setDraggedImgInfo(null);
                        setDragOverImgInfo(null);
                      }}
                      onDragEnd={() => {
                        setDraggedImgInfo(null);
                        setDragOverImgInfo(null);
                      }}
                      className={`relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50/70 transition-all duration-200 custom-grab-cursor custom-grabbing-cursor ${
                        draggedImgInfo?.itemIndex === itemIndex && draggedImgInfo?.imgIndex === imgIndex
                          ? "opacity-30 scale-[0.95]"
                          : ""
                      } ${
                        dragOverImgInfo?.itemIndex === itemIndex && dragOverImgInfo?.imgIndex === imgIndex && draggedImgInfo?.imgIndex !== imgIndex
                          ? "ring-2 ring-cyan-500 ring-offset-2 scale-[1.03]"
                          : ""
                      }`}
                    >
                      <div className="relative w-full h-32 flex items-center justify-center bg-slate-50 border-b border-slate-100">
                        {isDraftPlaceholder(img.url) ? (
                          <div className="flex flex-col items-center justify-center p-3 text-center select-none">
                            <ImageIcon className="w-6 h-6 text-cyan-600 mb-1" />
                            <span className="text-xs font-bold text-slate-700 truncate max-w-[130px]" title={(img.url as any).name}>
                              {(img.url as any).name}
                            </span>
                            <span className="text-[9px] text-rose-500 font-bold uppercase tracking-wider mt-0.5">
                              Re-upload image
                            </span>
                          </div>
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={previewSrc(img.url)}
                            alt={img.description}
                            className="w-full h-full object-cover select-none pointer-events-none"
                            draggable={false}
                          />
                        )}
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button
                            type="button"
                            title="Edit image or name"
                            className="p-1.5 bg-white/95 hover:bg-white text-slate-600 hover:text-cyan-600 rounded-lg shadow-sm transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadingItemIndex(itemIndex);
                              setEditingImgIndex(imgIndex);
                              setShowUploadModal(true);
                            }}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            title="Remove image"
                            className="p-1.5 bg-white/95 hover:bg-white text-slate-600 hover:text-rose-600 transition-colors rounded-lg shadow-sm cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImageFromItem(itemIndex, imgIndex);
                            }}
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                      <div className="p-2 border-t border-slate-100 bg-white">
                        <input
                          type="text"
                          value={img.description || ""}
                          onChange={(e) =>
                            updateImageDescription(itemIndex, imgIndex, e.target.value)
                          }
                          placeholder="e.g. Dolphin"
                          title="Click to edit name"
                          className="w-full px-2.5 py-1.5 text-xs text-center text-slate-800 bg-slate-50/80 hover:bg-slate-100/80 focus:bg-white border border-slate-200/80 focus:border-cyan-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium transition-all"
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onDragStart={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50/70 transition-all">
                  <LinkIcon size={32} className="text-slate-500 mb-2" />
                  <span className="mt-2 text-sm font-medium">No images added yet</span>
                </div>
              )}
            </div>

            {isItemInvalid && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 font-semibold bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>At least one image must be added to the gallery.</span>
              </div>
            )}
          </div>
        );
      })}

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
        onClose={() => {
          setShowUploadModal(false);
          setUploadingItemIndex(null);
          setEditingImgIndex(null);
        }}
        onSave={handleSaveImageModal}
        title={editingImgIndex !== null ? "Edit Image" : "Add to Gallery"}
        descriptionLabel="Name / description"
        descriptionPlaceholder="e.g. Dolphin"
        initialUrl={
          uploadingItemIndex !== null && editingImgIndex !== null
            ? items[uploadingItemIndex]?.images?.[editingImgIndex]?.url
            : undefined
        }
        initialDescription={
          uploadingItemIndex !== null && editingImgIndex !== null
            ? items[uploadingItemIndex]?.images?.[editingImgIndex]?.description
            : ""
        }
      />
    </div>
  );
}
