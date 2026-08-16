"use client";

import React, { useState } from "react";
import {
  CaracterPoint,
  CluePoint,
  Point,
} from "@/features/games/games.constants";
import Button from "@/components/ui/Button";
import AlertModal from "@/components/ui/AlertModal";
import {
  Grid,
  Trash2,
  Layers,
  Type,
  Image as ImageIcon,
  Info,
  HelpCircle,
  Upload,
  Lightbulb,
  Plus,
} from "lucide-react";

interface CrosswordChallengeProps {
  content: {
    positions: Point[];
    caracter: CaracterPoint[];
    clue?: CluePoint[];
    backgroundUrl?: string | File;
  };
  onChangeContent: (content: any) => void;
}

// Visual premium color palette for clues
const CLUE_COLORS = [
  { value: "#EF4444", label: "Red", bgClass: "bg-red-500" },
  { value: "#3B82F6", label: "Blue", bgClass: "bg-blue-500" },
  { value: "#10B981", label: "Green", bgClass: "bg-emerald-500" },
  { value: "#F59E0B", label: "Orange", bgClass: "bg-amber-500" },
  { value: "#8B5CF6", label: "Purple", bgClass: "bg-purple-500" },
  { value: "#EC4899", label: "Pink", bgClass: "bg-pink-500" },
  { value: "#14B8A6", label: "Teal", bgClass: "bg-teal-500" },
];

export default function CrosswordChallengeForm({
  content,
  onChangeContent,
}: CrosswordChallengeProps) {
  // Ensure default structures are safe
  const positions = content?.positions || [];
  const caracterList = content?.caracter || [];
  const clueList = content?.clue || [];
  const backgroundUrl = content?.backgroundUrl || "";

  // Helper to sanitize updates and permanently purge the legacy 'clues' key from the object
  const updateContent = (newContent: any) => {
    if (newContent) {
      const { clues, ...cleanContent } = newContent;
      onChangeContent(cleanContent);
    } else {
      onChangeContent(newContent);
    }
  };

  // Find first color not currently in use by any clues
  const firstAvailableColor =
    CLUE_COLORS.find((c) => !clueList.some((v) => v.color === c.value))
      ?.value || CLUE_COLORS[0].value;

  // Edit Mode state: 'structure' (toggle cells), 'letters' (write letters), or 'clues' (assign colors & text clues)
  const [editMode, setEditMode] = useState<"structure" | "letters" | "clues">(
    "structure",
  );

  // Selected cell for editing clue in Clues Mode
  const [selectedClueCell, setSelectedClueCell] = useState<Point | null>(null);

  // State to manage modal alerts
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title?: string;
    message: string;
    type?: "success" | "error" | "info";
  }>({ visible: false, message: "" });

  // Grid definition (12 rows x 12 cols)
  const GRID_SIZE = 12;

  // Check if a cell is active
  const isCellActive = (x: number, y: number) => {
    return positions.some((p) => p.x === x && p.y === y);
  };

  // Get character value of an active cell
  const getCellChar = (x: number, y: number) => {
    const match = caracterList.find(
      (c) => c.points && c.points.x === x && c.points.y === y,
    );
    return match ? match.caracter : "";
  };

  // Get clue associated with a cell
  const getCellClue = (x: number, y: number) => {
    return clueList.find(
      (c) => c.points && c.points.x === x && c.points.y === y,
    );
  };

  // Handler for activating/deactivating a cell (Structure Mode)
  const handleToggleCell = (x: number, y: number) => {
    const isActive = isCellActive(x, y);
    let newPositions = [...positions];
    let newCaracterList = [...caracterList];
    let newClueList = [...clueList];

    if (isActive) {
      // Deactivate cell: remove from positions, letters and clues
      newPositions = newPositions.filter((p) => !(p.x === x && p.y === y));
      newCaracterList = newCaracterList.filter(
        (c) => !(c.points && c.points.x === x && c.points.y === y),
      );
      newClueList = newClueList.filter(
        (c) => !(c.points && c.points.x === x && c.points.y === y),
      );

      // Deselect if we removed the currently selected cell
      if (
        selectedClueCell &&
        selectedClueCell.x === x &&
        selectedClueCell.y === y
      ) {
        setSelectedClueCell(null);
      }
    } else {
      // Activate cell
      newPositions.push({ x, y });
    }

    updateContent({
      ...content,
      positions: newPositions,
      caracter: newCaracterList,
      clue: newClueList,
    });
  };

  // Handler for updating cell letter (Letter Mode)
  const handleCellCharChange = (x: number, y: number, char: string) => {
    const upperChar = char.slice(-1).toUpperCase();
    let newCaracterList = [...caracterList];
    const index = newCaracterList.findIndex(
      (c) => c.points && c.points.x === x && c.points.y === y,
    );

    if (upperChar === "") {
      if (index !== -1) {
        newCaracterList.splice(index, 1);
      }
    } else if (/^[A-Z0-9]$/.test(upperChar)) {
      if (index !== -1) {
        newCaracterList[index] = {
          ...newCaracterList[index],
          caracter: upperChar,
        };
      } else {
        newCaracterList.push({
          caracter: upperChar,
          points: { x, y },
        });
      }
    } else {
      setAlertConfig({
        visible: true,
        title: "Invalid Character",
        message: "Please enter only a single letter or number.",
        type: "error",
      });
      return;
    }

    updateContent({
      ...content,
      caracter: newCaracterList,
    });
  };

  // Handler for creating/updating a clue (Clues Mode)
  const handleSaveClue = (
    x: number,
    y: number,
    text: string,
    color: string,
  ) => {
    let newClueList = [...clueList];
    const index = newClueList.findIndex(
      (c) => c.points && c.points.x === x && c.points.y === y,
    );

    if (index !== -1) {
      newClueList[index] = {
        ...newClueList[index],
        text,
        color,
      };
    } else {
      newClueList.push({
        text,
        color,
        points: { x, y },
      });
    }

    updateContent({
      ...content,
      clue: newClueList,
    });
  };

  // Handler for removing a clue
  const handleRemoveClue = (x: number, y: number) => {
    const newClueList = clueList.filter(
      (c) => !(c.points && c.points.x === x && c.points.y === y),
    );
    updateContent({
      ...content,
      clue: newClueList,
    });
  };

  // Handler to clear the whole grid
  const handleClearGrid = () => {
    updateContent({
      ...content,
      positions: [],
      caracter: [],
      clue: [],
    });
    setSelectedClueCell(null);
    setAlertConfig({
      visible: true,
      title: "Grid Cleared",
      message:
        "The crossword grid structure, characters, and clues have been reset.",
      type: "success",
    });
  };

  // File upload for backgroundUrl
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateContent({
        ...content,
        backgroundUrl: file,
      });
    }
  };

  // Remove background image
  const handleRemoveBackground = () => {
    updateContent({
      ...content,
      backgroundUrl: "",
    });
  };

  // Compute background preview URL safely
  const getBackgroundPreview = () => {
    if (!backgroundUrl) return "";
    if (typeof backgroundUrl === "string") return backgroundUrl;
    if (backgroundUrl instanceof File) {
      try {
        return URL.createObjectURL(backgroundUrl);
      } catch (err) {
        return "";
      }
    }
    return "";
  };

  // Build grid items (12x12)
  const renderGridCells = () => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const active = isCellActive(x, y);
        const charValue = getCellChar(x, y);
        const clueObj = getCellClue(x, y);

        if (editMode === "structure") {
          cells.push(
            <button
              key={`${x}-${y}`}
              type="button"
              onClick={() => handleToggleCell(x, y)}
              className={`relative w-full aspect-square flex items-center justify-center transition-all duration-150 border text-[9px] font-bold rounded shadow-sm ${
                active
                  ? "bg-white border-slate-300 hover:bg-slate-100 text-slate-400"
                  : "bg-slate-900 border-slate-950 hover:bg-slate-800 text-transparent"
              }`}
              title={`Toggle Row ${y + 1}, Col ${x + 1}`}
            >
              {active && clueObj && (
                <span
                  className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: clueObj.color }}
                />
              )}
              {active ? charValue || "·" : ""}
            </button>,
          );
        } else if (editMode === "letters") {
          if (active) {
            cells.push(
              <div key={`${x}-${y}`} className="relative w-full aspect-square">
                {clueObj && (
                  <span
                    className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full z-10"
                    style={{ backgroundColor: clueObj.color }}
                  />
                )}
                <input
                  type="text"
                  value={charValue}
                  onChange={(e) => handleCellCharChange(x, y, e.target.value)}
                  maxLength={1}
                  className="w-full h-full text-center font-extrabold text-xs uppercase bg-white text-slate-900 focus:bg-cyan-50 focus:ring-2 focus:ring-cyan-400 border border-slate-300 rounded outline-none shadow-sm transition-all"
                  title={`Letter Row ${y + 1}, Col ${x + 1}`}
                />
              </div>,
            );
          } else {
            cells.push(
              <div
                key={`${x}-${y}`}
                className="w-full aspect-square bg-slate-900 border border-slate-950 rounded cursor-not-allowed"
                title={`Blocked (Row ${y + 1}, Col ${x + 1})`}
              />,
            );
          }
        } else {
          // Clues Mode
          const isSelected =
            selectedClueCell &&
            selectedClueCell.x === x &&
            selectedClueCell.y === y;

          if (active) {
            cells.push(
              <button
                key={`${x}-${y}`}
                type="button"
                onClick={() => setSelectedClueCell({ x, y })}
                style={{
                  borderColor: isSelected
                    ? "#24DFE2"
                    : clueObj
                      ? clueObj.color
                      : "#d1d5db",
                  borderWidth: clueObj || isSelected ? "2px" : "1px",
                  backgroundColor: isSelected
                    ? "#e6fcfe"
                    : clueObj
                      ? `${clueObj.color}12`
                      : "#ffffff",
                }}
                className={`relative w-full aspect-square flex items-center justify-center transition-all rounded shadow-sm`}
                title={`Clue Cell Row ${y + 1}, Col ${x + 1}`}
              >
                {clueObj && (
                  <span
                    className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: clueObj.color }}
                  />
                )}
                <span
                  className={`text-[10px] font-black uppercase ${isSelected ? "text-cyan-600" : "text-slate-400"}`}
                >
                  {charValue || "·"}
                </span>
              </button>,
            );
          } else {
            cells.push(
              <div
                key={`${x}-${y}`}
                className="w-full aspect-square bg-slate-900 border border-slate-950 rounded cursor-not-allowed"
                title={`Blocked (Row ${y + 1}, Col ${x + 1})`}
              />,
            );
          }
        }
      }
    }
    return cells;
  };

  const activeClue = selectedClueCell
    ? getCellClue(selectedClueCell.x, selectedClueCell.y)
    : null;

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div className="flex items-center gap-2 border-b border-slate-105 pb-3">
        <div className="p-2 bg-cyan-50 rounded-xl text-cyan-600">
          <Grid className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
            Crossword Challenge Maker
          </h3>
          <p className="text-[10px] text-slate-400 font-bold">
            Define your crossword layout, answers and clues on a 12x12 grid
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: The Interactive Grid */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-[460px] bg-slate-100 p-2.5 rounded-2xl border border-slate-200/60 shadow-inner">
            <div
              className="grid gap-[2px] w-full"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              }}
            >
              {renderGridCells()}
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-450 font-bold text-center flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Tip: Active cells have a white background. Blocked/unused cells are
            black.
          </div>
        </div>

        {/* Right Side: Tools & Settings */}
        <div className="lg:col-span-5 space-y-5">
          {/* Mode Switcher */}
          <div className="bg-slate-50 border border-slate-200 p-1.5 rounded-2xl flex gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setEditMode("structure")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-[11px] font-extrabold transition-all ${
                editMode === "structure"
                  ? "bg-white text-slate-950 border border-slate-150 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-500" />
              Structure
            </button>
            <button
              type="button"
              onClick={() => setEditMode("letters")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-[11px] font-extrabold transition-all ${
                editMode === "letters"
                  ? "bg-white text-slate-950 border border-slate-150 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80"
              }`}
            >
              <Type className="w-3.5 h-3.5 text-emerald-500" />
              Letters
            </button>
            <button
              type="button"
              onClick={() => setEditMode("clues")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-[11px] font-extrabold transition-all ${
                editMode === "clues"
                  ? "bg-white text-slate-950 border border-slate-150 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Clues
            </button>
          </div>

          {/* Contextual Editor Panel */}
          {editMode === "structure" && (
            <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2.5 shadow-sm">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-500" />
                Structure Layout Mode
              </h4>
              <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                Click on cells to build the pathway of your crossword. You have
                activated{" "}
                <span className="text-cyan-600 font-extrabold">
                  {positions.length}
                </span>{" "}
                cells.
              </p>
            </div>
          )}

          {editMode === "letters" && (
            <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2.5 shadow-sm">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-500" />
                Fill Solution Letters
              </h4>
              <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                Click inside any active (white) cell to type its answer key.
                Letters are automatically capitalized. You have assigned{" "}
                <span className="text-emerald-600 font-extrabold">
                  {caracterList.length}
                </span>{" "}
                of{" "}
                <span className="font-extrabold text-slate-800">
                  {positions.length}
                </span>{" "}
                letters.
              </p>
            </div>
          )}

          {editMode === "clues" && (
            <div className="space-y-4">
              {!selectedClueCell ? (
                <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-sm text-center">
                  <Lightbulb className="w-6 h-6 text-amber-500 mx-auto animate-bounce" />
                  <h4 className="text-xs font-black text-slate-800 mt-1">
                    Assign Pistas / Clues
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Select any active cell (white) on the grid to assign it a
                    color indicator and a written clue description.
                  </p>
                </div>
              ) : (
                <>
                  {!activeClue ? (
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-sm">
                      <div className="text-xs font-bold text-slate-700">
                        Cell at Row {selectedClueCell.y + 1}, Column{" "}
                        {selectedClueCell.x + 1}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        This cell doesn't have an associated clue description
                        yet. Adding one will draw a color bubble on the cell and
                        list it for players.
                      </p>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() =>
                          handleSaveClue(
                            selectedClueCell.x,
                            selectedClueCell.y,
                            "",
                            firstAvailableColor,
                          )
                        }
                        className="w-full text-xs py-2.5 rounded-xl"
                        leftIcon={<Plus className="w-4 h-4" />}
                      >
                        Add Clue to Cell
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                          Edit Clue (Row {selectedClueCell.y + 1}, Col{" "}
                          {selectedClueCell.x + 1})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            handleRemoveClue(
                              selectedClueCell.x,
                              selectedClueCell.y,
                            );
                          }}
                          className="text-[10px] text-rose-500 hover:text-rose-600 font-extrabold hover:underline"
                        >
                          Delete Clue
                        </button>
                      </div>

                      {/* Color Palette Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
                          Color Tag Indicator
                        </label>
                        <div className="flex items-center gap-2 mt-2">
                          {CLUE_COLORS.filter(
                            (val) =>
                              (activeClue && val.value === activeClue.color) ||
                              !clueList.some((v) => v.color === val.value),
                          ).map((colorObj) => {
                            return (
                              <button
                                key={colorObj.value}
                                type="button"
                                onClick={() =>
                                  handleSaveClue(
                                    selectedClueCell.x,
                                    selectedClueCell.y,
                                    activeClue.text,
                                    colorObj.value,
                                  )
                                }
                                className={`w-6 h-6 rounded-full ${colorObj.bgClass} hover:scale-110 active:scale-95 transition-all shadow-sm ${
                                  activeClue.color === colorObj.value
                                    ? "ring-2 ring-cyan-500 ring-offset-2 scale-115"
                                    : "opacity-85"
                                }`}
                                title={colorObj.label}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Clue Text Area */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
                          Clue description text
                        </label>
                        <textarea
                          value={activeClue.text}
                          onChange={(e) =>
                            handleSaveClue(
                              selectedClueCell.x,
                              selectedClueCell.y,
                              e.target.value,
                              activeClue.color,
                            )
                          }
                          placeholder="e.g. A domestic feline animal (4 letters)..."
                          rows={3}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs font-semibold outline-none focus:border-cyan-500 transition-all focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Clues List summary */}
              {clueList.length > 0 && (
                <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-sm max-h-[200px] overflow-y-auto">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 border-b border-slate-100 pb-1">
                    Registered Clues ({clueList.length})
                  </h4>
                  <div className="space-y-2">
                    {clueList.map((clue, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedClueCell(clue.points)}
                        className={`flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all ${
                          selectedClueCell &&
                          selectedClueCell.x === clue.points.x &&
                          selectedClueCell.y === clue.points.y
                            ? "border-cyan-200 bg-cyan-50/20"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: clue.color }}
                          />
                          <div className="text-[11px] font-bold text-slate-700 truncate">
                            <span className="text-slate-400 mr-1">
                              R{clue.points.y + 1}C{clue.points.x + 1}:
                            </span>
                            {clue.text || (
                              <em className="text-slate-400 font-normal">
                                No clue text yet...
                              </em>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveClue(clue.points.x, clue.points.y);
                            if (
                              selectedClueCell &&
                              selectedClueCell.x === clue.points.x &&
                              selectedClueCell.y === clue.points.y
                            ) {
                              setSelectedClueCell(null);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Background Image Setting */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-sm">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
              Crossword Background (Optional)
            </label>

            <div className="flex items-center gap-3">
              <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-200 hover:bg-slate-50/50 p-4 rounded-xl cursor-pointer transition-all">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span>Choose Background File</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {backgroundUrl && (
                <div className="relative w-12 h-12 rounded-xl border border-slate-200 overflow-hidden shrink-0 group">
                  <img
                    src={getBackgroundPreview()}
                    alt="Background Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveBackground}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white font-extrabold text-[9px]"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Reset / Actions */}
          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <Button
              variant="danger"
              type="button"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={handleClearGrid}
              className="text-xs py-2.5 px-4 rounded-xl shadow-sm"
            >
              Clear Entire Grid
            </Button>
          </div>
        </div>
      </div>

      <AlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
