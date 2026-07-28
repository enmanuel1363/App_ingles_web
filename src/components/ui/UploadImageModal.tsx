"use client";

import { useRef, useState } from "react";
import FormInput from "./FormInput";
import { X, ImagePlus, Trash2, Plus } from "lucide-react";
import Button from "./Button";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { url: string | File; description: string }) => void;
  title?: string;
  descriptionLabel?: string;
  descriptionPlaceholder?: string;
};

export default function UploadImageModal({
  visible,
  onClose,
  onSave,
  title = "Add image",
  descriptionLabel = "Description",
  descriptionPlaceholder = "Write a description...",
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [description, setDescription] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  if (!visible) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl("");
  };

  const handleSave = () => {
    if (!file) {
      alert("You must select an image.");
      return;
    }
    if (description.length < 2) {
      alert("The description is too short.");
      return;
    }
    onSave({ url: file, description });
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setPreviewUrl("");
    setDescription("");
    onClose();
  };

  const canSave = file && description.length >= 2;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-lg bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 relative animate-scale-up text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
          <button 
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-655 p-1.5 rounded-lg hover:bg-slate-50 transition-all duration-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload area or preview */}
        {previewUrl ? (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center group shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="preview" className="object-contain w-full h-full" />
            
            <button 
              className="absolute top-3 right-3 bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-lg transition-colors cursor-pointer shadow-lg z-10"
              onClick={handleRemove}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-200 hover:border-cyan-405 bg-slate-50/50 hover:bg-slate-50 flex flex-col justify-center items-center cursor-pointer transition-all duration-300 group"
            onClick={() => inputRef.current?.click()}
          >
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex justify-center items-center mb-3 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-200">
              <ImagePlus className="w-6 h-6 text-cyan-605" />
            </div>
            <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
              Select image
            </span>
            <span className="text-xs text-slate-400 mt-1 font-semibold">
              Soporta PNG, JPG o GIF
            </span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <FormInput
          label={descriptionLabel}
          placeholder={descriptionPlaceholder}
          value={description}
          onChangeText={setDescription}
        />

        {/* Action row */}
        <div className="flex flex-row-reverse gap-3.5 pt-2">
          <Button
            variant={canSave ? "primary" : "outlined"}
            onClick={handleSave}
            disabled={!canSave}
            leftIcon={<Plus className="w-4 h-4" />}
            className="min-w-[120px]"
          >
            Add
          </Button>
          <Button
            variant="outlined"
            onClick={handleClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
