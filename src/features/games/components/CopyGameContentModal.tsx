"use client";

import React, { useState, useMemo } from "react";
import { useGetAllExercisesWithGame } from "../hooks/useGames";
import { GameType, ExerciseGame } from "../games.types";
import {
  GAME_TYPE_CONFIG,
  SUBTYPE_METADATA,
  getSubtypeLabel,
  getSubtypes,
} from "../games.constants";
import Button from "@/components/ui/Button";
import {
  X,
  Search,
  Sparkles,
  Copy,
  Plus,
  Gamepad2,
  PenTool,
  Volume2,
  Mic,
  Check,
} from "lucide-react";

interface CopyGameContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyExercise: (
    exercise: ExerciseGame,
    mode: "replace" | "append",
  ) => void;
  activeExerciseIndex: number | null;
  currentExercisesCount: number;
  maxExercises?: number;
  initialGameType?: GameType | "all";
  initialSubtype?: string | "all";
}

export default function CopyGameContentModal({
  isOpen,
  onClose,
  onCopyExercise,
  activeExerciseIndex,
  currentExercisesCount,
  maxExercises = 8,
  initialGameType = "all",
  initialSubtype = "all",
}: CopyGameContentModalProps) {
  // Query all exercises with their parent game information
  const {
    data: allExercises = [],
    isLoading: isLoadingExercises,
  } = useGetAllExercisesWithGame();

  // Navigation & Filtering State
  const [selectedGameType, setSelectedGameType] = useState<GameType | "all">(
    initialGameType,
  );
  const [selectedSubtype, setSelectedSubtype] = useState<string | "all">(
    initialSubtype,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedNotification, setCopiedNotification] = useState<string | null>(
    null,
  );

  // Available subtypes for the selected game type
  const availableSubtypes = useMemo(() => {
    if (selectedGameType === "all") {
      return Object.entries(SUBTYPE_METADATA).map(([key, meta]) => ({
        value: key,
        label: meta.label,
        gameType: meta.gameType,
      }));
    }
    return getSubtypes(selectedGameType).map((sub) => ({
      value: sub.value,
      label: sub.label,
      gameType: selectedGameType,
    }));
  }, [selectedGameType]);

  // Counts per game type
  const typeCounts = useMemo(() => {
    const counts = { all: allExercises.length, write: 0, listen: 0, speak: 0, mix: 0 };
    allExercises.forEach((ex) => {
      const gType = ex.games?.type || "mix";
      if (counts[gType] !== undefined) {
        counts[gType]++;
      }
    });
    return counts;
  }, [allExercises]);

  // Handle Game Type filter change
  const handleGameTypeChange = (type: GameType | "all") => {
    setSelectedGameType(type);
    setSelectedSubtype("all");
  };

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => {
      // Game Type filter
      if (selectedGameType !== "all") {
        const gameType = ex.games?.type;
        const subtypeMeta = SUBTYPE_METADATA[ex.type as keyof typeof SUBTYPE_METADATA];
        const matchGameType =
          gameType === selectedGameType ||
          (subtypeMeta && subtypeMeta.gameType === selectedGameType);
        if (!matchGameType) return false;
      }

      // Subtype filter
      if (selectedSubtype !== "all" && ex.type !== selectedSubtype) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = ex.name?.toLowerCase().includes(q);
        const matchesDesc = ex.description?.toLowerCase().includes(q);
        const matchesGameName = ex.games?.name?.toLowerCase().includes(q);
        const matchesSubtype = getSubtypeLabel(ex.type).toLowerCase().includes(q);
        const matchesContent = JSON.stringify(ex.content || {}).toLowerCase().includes(q);

        if (!matchesName && !matchesDesc && !matchesGameName && !matchesSubtype && !matchesContent) {
          return false;
        }
      }

      return true;
    });
  }, [allExercises, selectedGameType, selectedSubtype, searchQuery]);

  // Notification helper
  const triggerNotification = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => {
      setCopiedNotification(null);
      onClose();
    }, 1100);
  };

  const handleCopyOne = (
    ex: ExerciseGame,
    mode: "replace" | "append",
  ) => {
    onCopyExercise(ex, mode);
    triggerNotification(
      mode === "replace"
        ? `Ejercicio reemplazado con "${ex.name}"`
        : `Ejercicio "${ex.name}" agregado exitosamente`,
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#fffcf2] rounded-3xl w-full max-w-5xl shadow-2xl relative border border-slate-200/80 max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Floating Toast / Notification */}
        {copiedNotification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-xs font-bold animate-fade-in border border-cyan-400">
            <Check className="w-4 h-4 text-[#24DFE2]" />
            <span>{copiedNotification}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="bg-white border-b border-slate-200/70 p-5 sm:p-6 pb-4 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-cyan-700 bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#24DFE2]" />
                  Librería de Ejercicios
                </span>
                <span className="text-xs font-bold text-slate-400">
                  • {allExercises.length} ejercicios disponibles en juegos creados
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Copiar Contenido de Ejercicios
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Reutiliza ejercicios creados en otros juegos, clasificados por tipo de juego y subtipo de reto.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Capacity indicator */}
              <div className="text-[11px] font-semibold text-slate-500 hidden sm:flex items-center gap-1.5">
                <span>Capacidad:</span>
                <span className={`px-2 py-0.5 rounded-md font-extrabold ${
                  currentExercisesCount >= maxExercises
                    ? "bg-rose-100 text-rose-700"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}>
                  {currentExercisesCount} de {maxExercises}
                </span>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Bar: Categorización por Tipo y Subtipo */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 p-4 px-5 sm:px-6 space-y-3 shrink-0">
          {/* 1. Categoría por Tipo de Juego (GameType) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider mr-1">
              Tipo:
            </span>

            <button
              onClick={() => handleGameTypeChange("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                selectedGameType === "all"
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              🌟 Todos ({typeCounts.all})
            </button>

            <button
              onClick={() => handleGameTypeChange("write")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border flex items-center gap-1.5 cursor-pointer ${
                selectedGameType === "write"
                  ? "bg-cyan-500 text-slate-950 border-cyan-500 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-cyan-50/50"
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-cyan-600" />
              <span>Escritura ({typeCounts.write})</span>
            </button>

            <button
              onClick={() => handleGameTypeChange("listen")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border flex items-center gap-1.5 cursor-pointer ${
                selectedGameType === "listen"
                  ? "bg-lime-400 text-slate-950 border-lime-400 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-lime-50/50"
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-lime-600" />
              <span>Escucha ({typeCounts.listen})</span>
            </button>

            <button
              onClick={() => handleGameTypeChange("speak")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border flex items-center gap-1.5 cursor-pointer ${
                selectedGameType === "speak"
                  ? "bg-amber-400 text-slate-950 border-amber-400 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-amber-50/50"
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-amber-600" />
              <span>Habla ({typeCounts.speak})</span>
            </button>

            <button
              onClick={() => handleGameTypeChange("mix")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border flex items-center gap-1.5 cursor-pointer ${
                selectedGameType === "mix"
                  ? "bg-indigo-500 text-white border-indigo-500 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-indigo-50/50"
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Mixto ({typeCounts.mix})</span>
            </button>
          </div>

          {/* 2. Categoría por Subtipo + Buscador */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            {/* Subtypes dropdown / selector */}
            <div className="flex items-center gap-2 flex-1 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider shrink-0">
                Subtipo:
              </span>
              <select
                value={selectedSubtype}
                onChange={(e) => setSelectedSubtype(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer min-w-[220px]"
              >
                <option value="all">
                  Todos los Subtipos ({availableSubtypes.length})
                </option>
                {availableSubtypes.map((sub) => (
                  <option key={sub.value} value={sub.value}>
                    {sub.label}
                  </option>
                ))}
              </select>

              {selectedSubtype !== "all" && (
                <button
                  onClick={() => setSelectedSubtype("all")}
                  className="text-[11px] text-rose-500 hover:text-rose-700 font-bold underline cursor-pointer shrink-0"
                >
                  Quitar filtro subtipo
                </button>
              )}
            </div>

            {/* Live Search Input */}
            <div className="relative min-w-[240px] sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o palabra..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Body: Lista de Ejercicios */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Loading State */}
          {isLoadingExercises && (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-9 h-9 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 text-xs font-bold">
                Cargando ejercicios de la biblioteca...
              </p>
            </div>
          )}

          {!isLoadingExercises && (
            <div>
              {filteredExercises.length === 0 ? (
                <div className="text-center py-16 bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6">
                  <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-sm font-black text-slate-800">
                    No se encontraron ejercicios
                  </h4>
                  <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto font-medium">
                    No hay ejercicios que coincidan con los filtros seleccionados de tipo, subtipo o búsqueda. Intenta cambiar los filtros superiores.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredExercises.map((ex) => {
                    const subtypeLabel = getSubtypeLabel(ex.type);
                    const gameType = (ex.games?.type || "mix") as GameType;
                    const typeConfig = GAME_TYPE_CONFIG[gameType] || GAME_TYPE_CONFIG.mix;

                    return (
                      <div
                        key={ex.id}
                        className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group text-left"
                      >
                        <div>
                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Subtype Badge */}
                              <span className="text-[10px] font-black bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded-lg">
                                {subtypeLabel}
                              </span>

                              {/* Game Type Badge */}
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border ${typeConfig.badgeColor} ${typeConfig.textColor} ${typeConfig.borderColor}`}
                              >
                                {typeConfig.label}
                              </span>
                            </div>

                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg shrink-0">
                              {ex.points_reward} pts
                            </span>
                          </div>

                          {/* Exercise Title & Description */}
                          <h4 className="text-sm font-black text-slate-900 group-hover:text-cyan-700 transition-colors leading-snug">
                            {ex.name}
                          </h4>

                          {ex.description && (
                            <p className="text-[11px] text-slate-500 mt-1 font-medium line-clamp-2 leading-relaxed">
                              {ex.description}
                            </p>
                          )}

                          {/* Origin Game Link */}
                          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold bg-slate-50/80 border border-slate-100 rounded-lg px-2.5 py-1 w-fit">
                            <Gamepad2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Juego de origen:</span>
                            <span className="text-slate-800 font-black">
                              {ex.games?.name || "Sin asignar"}
                            </span>
                          </div>

                          {/* Detailed Content Preview */}
                          <div className="mt-3 pt-2.5 border-t border-slate-100">
                            <ExerciseContentPreviewBadge
                              type={ex.type}
                              content={ex.content}
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                          {activeExerciseIndex !== null && (
                            <Button
                              variant="outlined"
                              leftIcon={<Copy className="w-3.5 h-3.5" />}
                              onClick={() => handleCopyOne(ex, "replace")}
                              className="text-xs py-1.5 px-3 h-9 rounded-xl font-bold border-slate-200 hover:bg-slate-50"
                              title="Reemplaza los datos del ejercicio que tienes abierto actualmente"
                            >
                              Reemplazar actual
                            </Button>
                          )}

                          <Button
                            variant="primary"
                            leftIcon={<Plus className="w-3.5 h-3.5" />}
                            disabled={currentExercisesCount >= maxExercises}
                            onClick={() => handleCopyOne(ex, "append")}
                            className="text-xs py-1.5 px-3 h-9 rounded-xl font-black text-slate-950 shadow-sm"
                            title={
                              currentExercisesCount >= maxExercises
                                ? "Límite de 8 ejercicios alcanzado"
                                : "Añade este ejercicio como uno nuevo en la lista"
                            }
                          >
                            + Agregar nuevo
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200/70 p-4 px-6 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-400 font-medium">
            💡 Al copiar, la configuración del ejercicio se duplicará limpiamente en tu juego actual.
          </p>
          <Button
            variant="secondary"
            onClick={onClose}
            className="text-xs py-2 px-5 rounded-xl font-bold text-slate-900"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Clean visual preview badge depending on exercise content structure
 */
function ExerciseContentPreviewBadge({
  type,
  content,
}: {
  type: string;
  content: any;
}) {
  if (!content) return null;

  try {
    switch (type) {
      case "match_name_to_picture":
        return (
          <div className="flex items-center gap-3">
            {content.imageUrl ? (
              <img
                src={content.imageUrl}
                alt="preview"
                className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-slate-100 border border-dashed border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-400 shrink-0">
                Sin foto
              </div>
            )}
            <div className="text-[11px] space-y-0.5 overflow-hidden">
              <p className="font-extrabold text-slate-800 truncate">
                Correcta: <span className="text-emerald-600">"{content.correctAnswer || '---'}"</span>
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                Opciones: {Array.isArray(content.options) ? content.options.filter(Boolean).join(", ") : ""}
              </p>
            </div>
          </div>
        );

      case "identify_picture_reading_name":
        return (
          <div className="text-[11px] space-y-1">
            <p className="font-extrabold text-slate-800 truncate">
              Palabra a leer: <span className="text-cyan-700 font-black">"{content.wordToRead || '---'}"</span>
            </p>
            <p className="text-[10px] text-slate-500 font-medium truncate">
              Imágenes ({Array.isArray(content.imageOptions) ? content.imageOptions.length : 0}): {Array.isArray(content.imageOptions) ? content.imageOptions.map((o: any) => o.label).filter(Boolean).join(", ") : ""}
            </p>
          </div>
        );

      case "match_word":
        return (
          <div className="text-[11px] space-y-1">
            <p className="font-extrabold text-slate-700">
              Pares a emparejar ({Array.isArray(content.items) ? content.items.length : 0}):
            </p>
            <div className="flex flex-wrap gap-1">
              {Array.isArray(content.items) &&
                content.items.slice(0, 3).map((item: any, i: number) => (
                  <span
                    key={i}
                    className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md"
                  >
                    {item.wordToMatch} ↔ {item.correctAnswer}
                  </span>
                ))}
            </div>
          </div>
        );

      case "timed_typing_challenge":
        return (
          <div className="text-[11px] space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">
                Tiempo: <span className="font-extrabold text-amber-600">{content.timeLimitSeconds || 30}s</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] text-slate-500 font-bold">
                {Array.isArray(content.words) ? content.words.length : 0} palabras
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono truncate">
              {Array.isArray(content.words) ? content.words.join(", ") : ""}
            </p>
          </div>
        );

      case "crossword":
        return (
          <div className="text-[11px] space-y-1">
            <p className="font-bold text-slate-700">
              Crucigrama:{" "}
              <span className="font-extrabold text-cyan-700">
                {Array.isArray(content.clue) ? content.clue.length : 0} pistas
              </span>{" "}
              • {Array.isArray(content.caracter) ? content.caracter.length : 0} letras
            </p>
            <p className="text-[10px] text-slate-500 truncate font-medium">
              Pistas: {Array.isArray(content.clue) ? content.clue.map((c: any) => c.text).filter(Boolean).join(" | ") : ""}
            </p>
          </div>
        );

      case "identify_audio":
      case "fast_audio_mode":
        return (
          <div className="text-[11px] space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-lime-100 text-lime-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                {type === "fast_audio_mode" ? "Modo Rápido 1.6x" : "Audio Challenge"}
              </span>
              <span className="font-bold text-slate-700 truncate">
                Respuesta: <span className="text-emerald-700 font-extrabold">"{content.correctAnswer || '---'}"</span>
              </span>
            </div>
          </div>
        );

      case "match_audio_to_text":
        return (
          <div className="text-[11px] space-y-1">
            <p className="font-bold text-slate-700">
              Items de audio ({Array.isArray(content.items) ? content.items.length : 0}):
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {Array.isArray(content.items) ? content.items.map((i: any) => i.phrase).filter(Boolean).join(" • ") : ""}
            </p>
          </div>
        );

      case "speak_before_timer":
        return (
          <div className="text-[11px] space-y-0.5">
            <p className="font-bold text-slate-700">
              Frase a decir: <span className="font-extrabold text-amber-700">"{content.phraseToSpeak || '---'}"</span>
            </p>
            <p className="text-[10px] text-slate-400">
              Tiempo límite: {content.durationSeconds || 15}s
            </p>
          </div>
        );

      case "say_5_words_quickly":
        return (
          <div className="text-[11px] space-y-0.5">
            <p className="font-bold text-slate-700">
              5 Palabras rápidas ({content.durationSeconds || 10}s):
            </p>
            <p className="text-[10px] text-slate-500 font-mono truncate">
              {Array.isArray(content.words) ? content.words.join(" • ") : ""}
            </p>
          </div>
        );

      case "tongue_twister_challenge":
        return (
          <div className="text-[11px] space-y-0.5">
            <p className="font-bold text-slate-700 truncate">
              Trabalenguas: <span className="font-extrabold text-amber-700">"{content.tongueTwister || '---'}"</span>
            </p>
            <p className="text-[10px] text-slate-400">
              Máx. intentos: {content.maxAttempts || 3} • Tiempo: {content.durationSeconds || 20}s
            </p>
          </div>
        );

      default:
        return (
          <p className="text-[10px] text-slate-400 font-mono truncate">
            {JSON.stringify(content).slice(0, 60)}...
          </p>
        );
    }
  } catch (err) {
    return null;
  }
}
