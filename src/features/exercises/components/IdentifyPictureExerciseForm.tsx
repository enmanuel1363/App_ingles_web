"use client";

import FormInput from "@/components/ui/FormInput";
import Button from "@/components/ui/Button";
import { useState, useRef, useEffect } from "react";
import { Howl } from "howler";
import { useExerciseStore } from "../hooks/useExerciseStore";
import { EXERCISE_DEFAULT_DESCRIPTIONS } from "../exercise-constants";
import {
  Plus,
  Volume2,
  Play,
  Pause,
  Image as ImageIcon,
  AlertCircle,
  GripVertical,
  CheckCircle2,
  Circle,
  Music,
  Trash2,
  Edit,
  UploadCloud,
} from "lucide-react";
import { previewSrc, isDraftPlaceholder } from "../utils/imagePreview";
import { registerAudioFile, getAudioFile, removeAudioFile } from "../utils/audioRegistry";

type ImageOption = {
  image_url: string | File;
  is_correct: boolean;
};

type IdentifyPictureItem = {
  id: string;
  audio_url: string | File;
  audio_name?: string;
  images: ImageOption[];
};

const EMPTY_ITEM: IdentifyPictureItem = {
  id: "",
  audio_url: "",
  images: [],
};

type Props = {
  id_class: string;
  type: "identify_picture";
  order_index: number;
};

export default function IdentifyPictureExerciseForm({ order_index }: Props) {
  const { data, updateExercise } = useExerciseStore();
  const exercise = data[order_index] || {
    name: "",
    description: EXERCISE_DEFAULT_DESCRIPTIONS.identify_picture,
    content: { items: [{ ...EMPTY_ITEM }] },
  };

  const items: IdentifyPictureItem[] = (exercise.content?.items || [EMPTY_ITEM]).map((item: any) => {
    if (!item.id) {
      item.id = Math.random().toString(36).slice(2, 9);
    }
    return item;
  });

  // Stable references for local Audio Object URLs to prevent recreation conflicts during Zustand state updates
  const audioUrlsRef = useRef<Record<string, string>>({});
  const soundRef = useRef<Howl | null>(null);

  useEffect(() => {
    return () => {
      // Clean up active Howler instances on unmount
      if (soundRef.current) {
        soundRef.current.unload();
      }
      // Clean up all generated blob URLs on component unmount
      Object.values(audioUrlsRef.current).forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  // States for audio playback
  const [playingAudioSrc, setPlayingAudioSrc] = useState<string | null>(null);

  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(
    null,
  );
  const [draggableIndex, setDraggableIndex] = useState<number | null>(null);

  const audioInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const reorderItems = (fromIndex: number, toIndex: number) => {
    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    updateContent("items", newItems);
  };

  const updateField = (field: string, value: any) => {
    updateExercise(order_index, {
      ...exercise,
      description:
        exercise.description || EXERCISE_DEFAULT_DESCRIPTIONS.identify_picture,
      [field]: value,
    });
  };

  const updateContent = (field: string, value: any) => {
    updateExercise(order_index, {
      ...exercise,
      description:
        exercise.description || EXERCISE_DEFAULT_DESCRIPTIONS.identify_picture,
      content: { ...exercise.content, [field]: value },
    });
  };

  const updateItem = (
    itemIndex: number,
    fields: Partial<IdentifyPictureItem>,
  ) => {
    const newItems = items.map((item, i) =>
      i === itemIndex ? { ...item, ...fields } : item,
    );
    updateContent("items", newItems);
  };

  const addItem = () => {
    const newItemId = Math.random().toString(36).slice(2, 9);
    updateContent("items", [
      ...items,
      { id: newItemId, audio_url: "", images: [] },
    ]);
  };

  const removeItem = (itemIndex: number) => {
    if (items.length <= 1) return;
    const item = items[itemIndex];

    // Clean up local blob URL for the removed item if it exists
    const oldUrl = audioUrlsRef.current[item.id];
    if (oldUrl && oldUrl.startsWith("blob:")) {
      URL.revokeObjectURL(oldUrl);
    }
    delete audioUrlsRef.current[item.id];

    // Remove from in-memory raw audio registry
    removeAudioFile(item.id);

    updateContent(
      "items",
      items.filter((_, i) => i !== itemIndex),
    );
  };

  // Audio actions
  const handleAudioChange = (
    itemIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let file = e.target.files?.[0];
    if (!file) return;

    // Force correct MIME type for audio container decoding in browser if OS reports generic types
    const filename = file.name.toLowerCase();
    if (filename.endsWith(".m4a") && (!file.type || file.type === "application/octet-stream")) {
      file = new File([file], file.name, { type: "audio/mp4" });
    } else if (filename.endsWith(".mp3") && (!file.type || file.type === "application/octet-stream")) {
      file = new File([file], file.name, { type: "audio/mpeg" });
    } else if (filename.endsWith(".wav") && (!file.type || file.type === "application/octet-stream")) {
      file = new File([file], file.name, { type: "audio/wav" });
    }

    const item = items[itemIndex];

    // Register file in the memory registry (kept completely separate from Zustand state)
    registerAudioFile(item.id, file);

    // Revoke previous blob URL if exists
    const oldUrl = audioUrlsRef.current[item.id];
    if (oldUrl && oldUrl.startsWith("blob:")) {
      URL.revokeObjectURL(oldUrl);
    }

    // Instantly generate and assign the new Object URL mapped by item.id
    const newUrl = URL.createObjectURL(file);
    audioUrlsRef.current[item.id] = newUrl;

    // Commit only the URI locator string to Zustand store, preventing raw File object serialization bugs
    updateItem(itemIndex, { 
      audio_url: `local-audio://${item.id}`,
      audio_name: file.name
    });
  };

  const handlePlayAudio = (src: string) => {
    console.log("Playing audio source with Howler:", src);
    
    // If the same audio is playing, pause/stop it
    if (soundRef.current && playingAudioSrc === src) {
      if (soundRef.current.playing()) {
        soundRef.current.pause();
        setPlayingAudioSrc(null);
      } else {
        soundRef.current.play();
        setPlayingAudioSrc(src);
      }
      return;
    }

    // Stop and unload any previous sound
    if (soundRef.current) {
      soundRef.current.unload();
    }

    setPlayingAudioSrc(src);

    // Create a new Howl instance using Web Audio API (html5: false)
    soundRef.current = new Howl({
      src: [src],
      format: ["m4a", "mp3", "wav", "webm", "ogg"],
      html5: false, // Forces Web Audio API: XHR load + AudioContext decode (bypasses HTML5 audio tag limitations)
      onend: () => {
        setPlayingAudioSrc(null);
      },
      onloaderror: (id, err) => {
        console.error("Howler load error:", err, "for source:", src);
        setPlayingAudioSrc(null);
      },
      onplayerror: (id, err) => {
        console.error("Howler play error:", err);
        setPlayingAudioSrc(null);
      }
    });

    soundRef.current.play();
  };

  // Image actions (direct file input upload without modal)
  const handleImageAdd = (
    itemIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentItem = items[itemIndex];
    const newImages = [...(currentItem.images || [])];

    const availableSlots = 6 - newImages.length;
    const filesToUpload = Array.from(files).slice(0, availableSlots);

    filesToUpload.forEach((file) => {
      const isFirst = newImages.length === 0;
      newImages.push({
        image_url: file,
        is_correct: isFirst, // Auto-mark correct if it's the first option
      });
    });

    updateItem(itemIndex, { images: newImages });
    e.target.value = "";
  };

  const handleImageReplace = (
    itemIndex: number,
    imageIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentItem = items[itemIndex];
    const newImages = currentItem.images.map((img, idx) =>
      idx === imageIndex
        ? {
            ...img,
            image_url: file,
          }
        : img,
    );

    updateItem(itemIndex, { images: newImages });
    e.target.value = "";
  };

  const removeImageOption = (itemIndex: number, imageIndex: number) => {
    const currentItem = items[itemIndex];
    const newImages = currentItem.images.filter((_, idx) => idx !== imageIndex);

    // If we removed the correct option, auto-assign correct to the first remaining one
    const wasCorrect = currentItem.images[imageIndex]?.is_correct;
    if (wasCorrect && newImages.length > 0) {
      newImages[0].is_correct = true;
    }

    updateItem(itemIndex, { images: newImages });
  };

  const setCorrectOption = (itemIndex: number, imageIndex: number) => {
    const currentItem = items[itemIndex];
    const newImages = currentItem.images.map((img, idx) => ({
      ...img,
      is_correct: idx === imageIndex,
    }));
    updateItem(itemIndex, { images: newImages });
  };

  const triggerAddImageInput = (itemIndex: number) => {
    const el = document.getElementById(`image-add-${itemIndex}`);
    if (el) el.click();
  };

  return (
    <div className="w-full space-y-6 text-slate-800">

      <FormInput
        label="Exercise title"
        placeholder="e.g. Listen and choose the correct picture"
        value={exercise.name}
        onChangeText={(text) => updateField("name", text)}
        onCopy={() => navigator.clipboard.writeText(exercise.name)}
      />

      <FormInput
        label="Description"
        placeholder="e.g. Escucha el audio y selecciona la imagen correcta"
        value={exercise.description}
        onChangeText={(text) => updateField("description", text)}
        onCopy={() => navigator.clipboard.writeText(exercise.description)}
      />

      {items.map((item, itemIndex) => {
        const isDraft = isDraftPlaceholder(item.audio_url);
        let audioSrc: string | null = null;
        let isAudioPlaceholder = isDraft;

        if (item.audio_url && !isDraft) {
          if (typeof item.audio_url === "string") {
            if (item.audio_url.startsWith("local-audio://")) {
              const audioId = item.audio_url.replace("local-audio://", "");
              const localFile = getAudioFile(audioId);
              if (localFile) {
                if (!audioUrlsRef.current[item.id]) {
                  audioUrlsRef.current[item.id] = URL.createObjectURL(localFile);
                }
                audioSrc = audioUrlsRef.current[item.id];
              } else {
                isAudioPlaceholder = true;
              }
            } else {
              audioSrc = item.audio_url;
            }
          } else {
            if (!audioUrlsRef.current[item.id]) {
              audioUrlsRef.current[item.id] = URL.createObjectURL(item.audio_url as File);
            }
            audioSrc = audioUrlsRef.current[item.id];
          }
        }
        const isAudioInvalid = !item.audio_url || isAudioPlaceholder;
        const isImagesInvalid = !item.images || item.images.length < 2;
        const hasCorrectOption = item.images?.some((img) => img.is_correct);
        const isItemInvalid =
          isAudioInvalid || isImagesInvalid || !hasCorrectOption;

        return (
          <div
            key={itemIndex}
            draggable={draggableIndex === itemIndex}
            onDragStart={(e) => {
              e.stopPropagation();
              setDraggedItemIndex(itemIndex);
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", itemIndex.toString());
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (dragOverItemIndex !== itemIndex) {
                setDragOverItemIndex(itemIndex);
              }
            }}
            onDragLeave={(e) => {
              e.stopPropagation();
              setDragOverItemIndex(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const fromIndex = draggedItemIndex;
              if (fromIndex !== null && fromIndex !== itemIndex) {
                reorderItems(fromIndex, itemIndex);
              }
              setDraggedItemIndex(null);
              setDragOverItemIndex(null);
              setDraggableIndex(null);
            }}
            onDragEnd={(e) => {
              e.stopPropagation();
              setDraggedItemIndex(null);
              setDragOverItemIndex(null);
              setDraggableIndex(null);
            }}
            className={`p-6 bg-white border rounded-2xl shadow-sm transition-all duration-200 ${
              isItemInvalid
                ? "border-amber-300 bg-amber-50/5"
                : "border-slate-200/80"
            } ${
              draggedItemIndex === itemIndex ? "opacity-35 scale-[0.98]" : ""
            } ${
              dragOverItemIndex === itemIndex && draggedItemIndex !== itemIndex
                ? "ring-2 ring-cyan-500 ring-offset-2 rounded-2xl scale-[1.01]"
                : ""
            }`}
          >
            {/* Item Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                {items.length > 1 && (
                  <div
                    className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-50 transition-colors"
                    onMouseDown={() => setDraggableIndex(itemIndex)}
                    onMouseUp={() => setDraggableIndex(null)}
                    title="Arrastrar para reordenar"
                  >
                    <GripVertical size={18} />
                  </div>
                )}
                <span className="font-bold text-cyan-600 text-xs tracking-wider uppercase">
                  Question {itemIndex + 1}
                </span>
              </div>
              {items.length > 1 && (
                <button
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50/5 cursor-pointer"
                  onClick={() => removeItem(itemIndex)}
                  title="Eliminar pregunta"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            {/* Audio Selector Section */}
            <div className="mb-6 p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-605 shrink-0">
                  <Volume2 size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-700">
                    Audio Clip
                  </h4>
                  <p className={`text-xs font-semibold truncate max-w-[200px] md:max-w-xs ${
                    isAudioPlaceholder ? "text-rose-500 font-bold uppercase tracking-wider" : "text-slate-400"
                  }`}>
                    {item.audio_url
                      ? isAudioPlaceholder
                        ? "Re-upload audio required"
                        : item.audio_name
                          ? item.audio_name
                          : typeof item.audio_url === "string" && !item.audio_url.startsWith("local-audio://")
                            ? "Audio cargado en servidor"
                            : "Local Audio Clip"
                      : "No audio selected yet"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
                <input
                  ref={(el) => {
                    audioInputRefs.current[itemIndex] = el;
                  }}
                  type="file"
                  accept="audio/*,.m4a"
                  className="hidden"
                  onChange={(e) => handleAudioChange(itemIndex, e)}
                />

                {audioSrc && (
                  <Button
                    variant="outlined"
                    onClick={() => handlePlayAudio(audioSrc)}
                    leftIcon={
                      playingAudioSrc === audioSrc ? (
                        <Pause size={15} />
                      ) : (
                        <Play size={15} />
                      )
                    }
                    className="py-1.5 px-3 text-xs bg-white text-slate-700 border-slate-200"
                  >
                    {playingAudioSrc === audioSrc ? "Pause" : "Listen"}
                  </Button>
                )}

                <Button
                  variant="outlined"
                  onClick={() => audioInputRefs.current[itemIndex]?.click()}
                  leftIcon={<Music size={15} />}
                  className="py-1.5 px-3 text-xs bg-white text-cyan-600 border-slate-200"
                >
                  {item.audio_url ? "Change Audio" : "Upload Audio"}
                </Button>
              </div>
            </div>

            {/* Image Options Grid */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-700">
                  Image Options ({item.images.length}/6)
                </h4>

                <input
                  id={`image-add-${itemIndex}`}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageAdd(itemIndex, e)}
                />

                {item.images.length < 6 && (
                  <button
                    onClick={() => triggerAddImageInput(itemIndex)}
                    className="flex items-center gap-1.5 text-xs text-cyan-605 hover:text-cyan-700 transition-colors font-bold cursor-pointer"
                  >
                    <Plus size={14} /> Add images
                  </button>
                )}
              </div>

              {item.images.length === 0 ? (
                <div
                  onClick={() => triggerAddImageInput(itemIndex)}
                  className="w-full flex flex-col items-center justify-center gap-2.5 p-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30 text-slate-400 hover:bg-slate-50/70 hover:border-cyan-305 transition-all cursor-pointer select-none"
                >
                  <UploadCloud size={32} className="text-slate-300" />
                  <span className="text-xs font-bold text-slate-555">
                    Click to upload images (supports multiple selection)
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {item.images.map((img, imageIndex) => {
                    const isPlaceholder = isDraftPlaceholder(img.image_url);
                    return (
                      <div
                        key={imageIndex}
                        className={`relative group bg-white border rounded-xl overflow-hidden shadow-sm transition-all duration-200 flex flex-col aspect-[4/3] ${
                          img.is_correct
                            ? "border-cyan-500 ring-1 ring-cyan-500"
                            : "border-slate-200/80"
                        }`}
                      >
                        {/* Hidden input to replace this specific image */}
                        <input
                          id={`image-replace-${itemIndex}-${imageIndex}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleImageReplace(itemIndex, imageIndex, e)
                          }
                        />

                        {/* Option Image Thumbnail */}
                        <div className="relative w-full h-full bg-slate-50 flex items-center justify-center overflow-hidden">
                          {isPlaceholder ? (
                            <div className="flex flex-col items-center justify-center p-2 text-center select-none">
                              <ImageIcon className="w-6 h-6 text-cyan-600 mb-1" />
                              <span
                                className="text-[10px] font-bold text-slate-700 truncate max-w-[100px]"
                                title={(img.image_url as any).name}
                              >
                                {(img.image_url as any).name}
                              </span>
                              <span className="text-[8px] text-rose-500 font-bold uppercase mt-0.5">
                                Re-upload
                              </span>
                            </div>
                          ) : (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={previewSrc(img.image_url)}
                              alt="Option"
                              className="w-full h-full object-cover"
                            />
                          )}

                          {/* Image Actions Overlay */}
                          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                const el = document.getElementById(
                                  `image-replace-${itemIndex}-${imageIndex}`,
                                );
                                el?.click();
                              }}
                              className="p-1.5 bg-white/95 rounded-lg shadow-sm hover:text-cyan-650 text-slate-500 transition-colors cursor-pointer"
                              title="Reemplazar imagen"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() =>
                                removeImageOption(itemIndex, imageIndex)
                              }
                              className="p-1.5 bg-white/95 rounded-lg shadow-sm hover:text-rose-650 text-slate-500 transition-colors cursor-pointer"
                              title="Eliminar opción"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {/* Correct/Incorrect Badge */}
                          <button
                            onClick={() =>
                              setCorrectOption(itemIndex, imageIndex)
                            }
                            className={`absolute bottom-2 left-2 flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[10px] font-bold shadow-md cursor-pointer transition-all ${
                              img.is_correct
                                ? "bg-cyan-500 text-white"
                                : "bg-white/90 text-slate-600 hover:bg-white hover:text-slate-800"
                            }`}
                          >
                            {img.is_correct ? (
                              <CheckCircle2
                                size={12}
                                className="text-white fill-white/10"
                              />
                            ) : (
                              <Circle size={12} />
                            )}
                            Correct
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Validation warning inside item */}
            {isItemInvalid && (
              <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-600 font-semibold bg-amber-50/55 p-2.5 rounded-lg border border-amber-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  {isAudioInvalid
                    ? "Se requiere seleccionar un clip de audio."
                    : isImagesInvalid
                      ? "Se requieren al menos 2 imágenes de opción."
                      : "Debes marcar una opción de imagen como la correcta."}
                </span>
              </div>
            )}
          </div>
        );
      })}

      <Button
        variant="outlined"
        onClick={addItem}
        leftIcon={<Plus size={18} />}
        className="w-full border-dashed hover:border-cyan-500/30 text-gray-900 hover:bg-cyan-500/5 py-2.5"
      >
        Add Item
      </Button>

      <p className="mt-6 text-xs text-slate-400 italic text-center font-medium">
        Note: The student listens to the audio and selects which of the visual
        options matches.
      </p>
    </div>
  );
}
