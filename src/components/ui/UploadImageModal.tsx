"use client";

import { useEffect, useRef, useState } from "react";
import FormInput from "./FormInput";
import { X, ImagePlus, Trash2, Plus, Camera, Check } from "lucide-react";
import Button from "./Button";
import { useModal } from "@/components/ui/ModalProvider";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { url: string | File; description: string }) => void;
  title?: string;
  descriptionLabel?: string;
  descriptionPlaceholder?: string;
  initialUrl?: string | File | null;
  initialDescription?: string;
  submitButtonText?: string;
};

export default function UploadImageModal({
  visible,
  onClose,
  onSave,
  title = "Add image",
  descriptionLabel = "Description",
  descriptionPlaceholder = "Write a description...",
  initialUrl,
  initialDescription = "",
  submitButtonText,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [description, setDescription] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state when modal opens or initial values change
  useEffect(() => {
    if (visible) {
      setDescription(initialDescription || "");
      if (initialUrl) {
        setCurrentUrl(initialUrl);
        if (typeof initialUrl === "string") {
          setPreviewUrl(initialUrl);
        } else if (initialUrl instanceof File) {
          setPreviewUrl(URL.createObjectURL(initialUrl));
        } else if (typeof initialUrl === "object" && (initialUrl as any)?.__isDraftPlaceholder) {
          setPreviewUrl("/600x600.png");
        } else {
          setPreviewUrl("");
        }
      } else {
        setCurrentUrl(null);
        setPreviewUrl("");
      }
      setFile(null);
    }
  }, [visible, initialUrl, initialDescription]);

  // Clean up Object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const { showAlert } = useModal();

  if (!visible) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(selected);
    setCurrentUrl(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleRemove = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setCurrentUrl(null);
    setPreviewUrl("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleSave = () => {
    const targetImage = file || currentUrl;
    if (!targetImage) {
      showAlert({
        title: "Seleccionar imagen",
        message: "Debes seleccionar una imagen para continuar.",
        type: "error",
      });
      return;
    }
    if (description.trim().length < 2) {
      showAlert({
        title: "Descripción corta",
        message: "La descripción es demasiado corta.",
        type: "error",
      });
      return;
    }
    onSave({ url: targetImage, description: description.trim() });
    handleClose();
  };

  const handleClose = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setCurrentUrl(null);
    setPreviewUrl("");
    setDescription("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onClose();
  };

  const canSave = Boolean(file || currentUrl) && description.trim().length >= 2;

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
            
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              <button
                type="button"
                className="bg-white/95 hover:bg-white text-slate-700 hover:text-cyan-600 p-2 rounded-lg transition-colors cursor-pointer shadow-lg flex items-center gap-1.5 text-xs font-semibold"
                onClick={() => inputRef.current?.click()}
                title="Change image"
              >
                <Camera className="w-4 h-4" />
                <span>Change</span>
              </button>
              <button 
                type="button"
                className="bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-lg transition-colors cursor-pointer shadow-lg"
                onClick={handleRemove}
                title="Remove image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
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
            leftIcon={currentUrl && !file ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            className="min-w-[120px]"
          >
            {submitButtonText || (initialUrl ? "Save" : "Add")}
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
