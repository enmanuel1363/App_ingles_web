"use client";

import { lesson_type } from "@/types/global.types";
import { useState } from "react";
import { EXERCISE_COMPONENTS } from '../exercise-components';
import {
  EXERCISE_CATEGORIES,
  EXERCISE_DEFAULT_CONTENT,
  EXERCISE_DEFAULT_DESCRIPTIONS,
  lessonTypeOptions,
} from '../exercise-constants';
import { useExerciseStore } from '../hooks/useExerciseStore';
import { 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Check,
  Type, 
  Image as ImageIcon, 
  Link2, 
  FileText, 
  Volume2, 
  Mic, 
  BookOpen, 
  Keyboard, 
  Play, 
  Languages, 
  PenTool 
} from "lucide-react";

type Props = {
  index: number;
  moveUp: () => void;
  moveDown: () => void;
  onRemove?: () => void;
};

// Lucide icon mapping to draw vectors cleanly instead of raw emojis
const LUCIDE_ICONS: Record<string, React.ReactNode> = {
  Type: <Type className="w-5 h-5 text-orange-600" />,
  Image: <ImageIcon className="w-5 h-5 text-pink-600" />,
  Link2: <Link2 className="w-5 h-5 text-teal-600" />,
  FileText: <FileText className="w-5 h-5 text-cyan-600" />,
  Volume2: <Volume2 className="w-5 h-5 text-fuchsia-600" />,
  Mic: <Mic className="w-5 h-5 text-rose-600" />,
  BookOpen: <BookOpen className="w-5 h-5 text-teal-700" />,
  Keyboard: <Keyboard className="w-5 h-5 text-lime-700" />,
  Play: <Play className="w-5 h-5 text-rose-650" />,
  Languages: <Languages className="w-5 h-5 text-purple-700" />,
  PenTool: <PenTool className="w-5 h-5 text-indigo-600" />,
};

export default function CreateExercise({ index, moveUp, moveDown, onRemove }: Props) {
  const { data, updateExercise } = useExerciseStore();
  const exerciseData = data[index];
  const type = exerciseData?.type || "complete_word";

  const [showTypePicker, setShowTypePicker] = useState(false);

  const selectedType = lessonTypeOptions.find((opt) => opt.value === type);
  const ExerciseForm = EXERCISE_COMPONENTS[type];

  const handleTypeChange = (newType: lesson_type) => {
    updateExercise(index, {
      ...exerciseData,
      type: newType,
      description: EXERCISE_DEFAULT_DESCRIPTIONS[newType] || "",
      content: EXERCISE_DEFAULT_CONTENT[newType] || {},
    });
    setShowTypePicker(false);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-md relative space-y-4 text-slate-800 animate-scale-up">
      {/* Top Header Section */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-450">
          Ejercicio #{index + 1}
        </span>
        <div className="flex items-center space-x-1">
          <button 
            className="p-2 rounded-lg border border-slate-200 hover:border-slate-350 text-slate-450 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer bg-white" 
            onClick={moveUp} 
            title="Move up"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button 
            className="p-2 rounded-lg border border-slate-200 hover:border-slate-350 text-slate-450 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer bg-white" 
            onClick={moveDown} 
            title="Move down"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button 
            className="p-2 rounded-lg border border-slate-200 hover:border-rose-300 text-slate-455 hover:text-rose-600 hover:bg-rose-50/50 transition-all cursor-pointer bg-white" 
            onClick={onRemove} 
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selector Trigger Button */}
      <button
        className={`w-full bg-slate-50 border text-slate-700 rounded-xl p-4 focus:ring-1 outline-none transition-all duration-200 text-sm cursor-pointer ${
          showTypePicker 
            ? "border-cyan-500 ring-1 ring-cyan-500" 
            : "border-slate-200 hover:border-slate-300"
        }`}
        onClick={() => setShowTypePicker(!showTypePicker)}
      >
        <div className="flex justify-between items-center">
          {selectedType ? (
            <div className="flex items-center space-x-3.5 text-left">
              <span className="p-2 rounded-lg bg-white border border-slate-200/60 shadow-sm shrink-0">
                {LUCIDE_ICONS[selectedType.icon] || <Type className="w-5 h-5 text-slate-400" />}
              </span>
              <div>
                <div className="font-extrabold text-slate-800 leading-tight">{selectedType.label}</div>
                <div className="text-[10px] uppercase font-bold text-cyan-600 mt-0.5 tracking-wider">
                  {EXERCISE_CATEGORIES[selectedType.value]}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-slate-400 font-bold">Select a type</span>
          )}
          <span className="text-slate-400 shrink-0">
            {showTypePicker ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </button>

      {/* Selector Dropdown Panel */}
      {showTypePicker && (
        <div className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-xl divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
          {lessonTypeOptions.map((option) => {
            const isSelected = type === option.value;
            return (
              <button
                key={option.value}
                className={`w-full flex items-center justify-between p-3.5 text-left transition-all cursor-pointer ${
                  isSelected ? "bg-cyan-500/5 text-cyan-700 font-bold" : "text-slate-655 hover:bg-slate-50 hover:text-slate-900"
                }`}
                onClick={() => handleTypeChange(option.value)}
              >
                <div className="flex items-center space-x-3.5">
                  <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/50 shrink-0">
                    {LUCIDE_ICONS[option.icon] || <Type className="w-4 h-4 text-slate-400" />}
                  </span>
                  <div>
                    <div className="font-bold text-sm leading-tight text-slate-800">{option.label}</div>
                    <div className={`text-[9px] uppercase font-bold mt-0.5 tracking-wider ${
                      isSelected ? "text-cyan-600" : "text-slate-400"
                    }`}>
                      {EXERCISE_CATEGORIES[option.value]}
                    </div>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-cyan-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Exercise Component Form */}
      <div className="border-t border-slate-100 pt-4 mt-2">
        <ExerciseForm id_class={exerciseData?.id_class || ""} type={type} order_index={index} />
      </div>
    </div>
  );
}
