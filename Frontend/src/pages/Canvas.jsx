import React, { useState } from "react";
import { useUser } from "../context/UserContextProvider";
import { useGameSocket } from "../context/GameSocketContextProvider";
import Board from "../Canvas/Board";
import {
  Palette,
  Check,
  Clock,
  Send,
  Sparkles,
  Brush,
  Zap,
  Eraser,
  Sliders,
  Trash2,
} from "lucide-react";

const COLOR_OPTIONS = [
  { name: "Black", hex: "#0f172a" },
  { name: "Red", hex: "#ef4444" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Green", hex: "#22c55e" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Orange", hex: "#f97316" },
  { name: "Eraser", hex: "#ffffff" },
];

const THICKNESS_OPTIONS = [
  { label: "Fine", width: 2, dotSize: "w-2 h-2" },
  { label: "Medium", width: 5, dotSize: "w-3 h-3" },
  { label: "Thick", width: 10, dotSize: "w-4 h-4" },
  { label: "Bold", width: 18, dotSize: "w-5 h-5" },
];

const Canvas = () => {
  const { username } = useUser();
  const {
    game,
    selectedWord,
    setSelectedWord,
    isSent,
    timeLeft,
    sendMessage,
    userPlaying,
    clearCanvas,
  } = useGameSocket();

  const [color, setColor] = useState("#0f172a");
  const [lineWidth, setLineWidth] = useState(5);

  const [words] = useState([
    "apple",
    "banana",
    "cherry",
    "date",
    "elderberry",
    "fig",
    "grape",
  ]);

  const sendSelectedWord = () => {
    if (!selectedWord) return;
    const payload = {
      type: "CHOOSE_WORD",
      current_word: selectedWord,
      username: username,
    };
    sendMessage(payload);
  };

  const handleClearCanvas = () => {
    clearCanvas();
    sendMessage({
      type: "CLEAR",
    });
  };

  return (
    <div className="w-full flex justify-center py-1">
      <div className="w-full neon-card rounded-3xl p-3 md:p-5 border border-slate-200 bg-white/95 shadow-lg relative overflow-hidden backdrop-blur-xl">
        {/* Top bar header - single row on all screens */}
        <div className="flex flex-row flex-nowrap justify-between items-center mb-2 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
              <Palette className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-wide font-mono truncate">
                  <span className="text-blue-600">D</span>
                  <span className="text-red-500">o</span>
                  <span className="text-amber-500">o</span>
                  <span className="text-blue-600">d</span>
                  <span className="text-green-600">l</span>
                  <span className="text-red-500">y</span>
                </h2>
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
              </div>

              <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium truncate">
                {game?.is_ended ? (
                  "Ended"
                ) : !game?.is_started ? (
                  "Waiting"
                ) : (
                  <>
                    Artist:{" "}
                    <strong className="text-blue-600 font-bold">
                      {game?.current_player || "Choosing..."}
                    </strong>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Neon Timer Indicator */}
          {game?.is_started && !game?.is_ended && (
            <div
              className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg border-2 text-[10px] sm:text-xs font-extrabold font-mono transition-all duration-300 shadow-sm flex items-center gap-1 shrink-0 ${
                timeLeft === 0
                  ? "border-slate-300 text-slate-500 bg-slate-100"
                  : timeLeft <= 10
                  ? "border-red-400 text-red-600 bg-red-50 animate-pulse"
                  : "border-blue-400 text-blue-700 bg-blue-50"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{timeLeft === 0 ? "Time's Up" : `${timeLeft}s`}</span>
            </div>
          )}
        </div>

        {/* Paintbrush Toolkit Bar (Visible ONLY when active drawer has selected the word) */}
        {userPlaying && isSent && !game?.is_ended && (
          <div className="mb-2 p-2 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-inner animate-fade-in text-[10px]">
            {/* Colors Palette */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 text-slate-600 mr-0.5">
                <Palette className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono hidden xs:inline">
                  Color:
                </span>
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                {COLOR_OPTIONS.map((c) => {
                  const isSelected = color === c.hex;
                  const isEraser = c.hex === "#ffffff";

                  return (
                    <button
                      key={c.name}
                      onClick={() => setColor(c.hex)}
                      title={c.name}
                      style={{ backgroundColor: c.hex }}
                      className={`w-5.5 h-5.5 rounded-full border transition-all duration-150 flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? "border-blue-600 scale-110 shadow-sm ring-1 ring-blue-400/40"
                          : "border-slate-300 hover:scale-105"
                      }`}
                    >
                      {isEraser && <Eraser className="w-2.5 h-2.5 text-slate-700" />}
                      {isSelected && !isEraser && (
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Thickness / Size Picker & Clear Button */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-slate-600 mr-0.5">
                <Sliders className="w-3 h-3 text-purple-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono hidden xs:inline">
                  Size:
                </span>
              </div>

              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm mr-1">
                {THICKNESS_OPTIONS.map((opt) => {
                  const isSelected = lineWidth === opt.width;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setLineWidth(opt.width)}
                      title={`${opt.label} (${opt.width}px)`}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <span
                        className={`rounded-full bg-current ${opt.dotSize}`}
                      />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Clear Canvas Action */}
              <button
                onClick={handleClearCanvas}
                className="px-2 py-0.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 font-bold text-[10px] flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                title="Wipe canvas clean"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        )}

        {/* Board Container - Strict 16:10 aspect ratio for geometric scaling */}
        <div className="w-full aspect-[16/10] rounded-2xl p-1.5 bg-slate-100 border border-slate-300 shadow-inner relative overflow-hidden group">
          {/* Status Overlay Tag */}
          <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none flex items-center gap-2">
            {game?.is_started && !game?.is_ended && (
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                <Clock className="w-3 h-3 text-blue-600" /> {timeLeft}s
              </span>
            )}
            <span className="text-[9px] font-mono font-bold text-slate-700 bg-white/90 px-2 py-0.5 rounded-md border border-slate-300 shadow-sm">
              {game?.is_ended
                ? "MATCH ENDED"
                : userPlaying
                ? isSent
                  ? "YOUR TURN"
                  : "CHOOSE WORD"
                : "SPECTATING"}
            </span>
          </div>
          <Board color={color} lineWidth={lineWidth} />
        </div>

        {/* Word Choice Section - Removed once word is chosen/acknowledged */}
        {userPlaying && !isSent && !game?.is_ended && (
          <div className="mt-3 pt-2.5 border-t border-slate-200">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                Select Your Secret Word
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {words.map((word) => {
                const isSelected = selectedWord === word;
                return (
                  <button
                    key={word}
                    onClick={() => {
                      setSelectedWord(word);
                    }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold font-mono transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? "bg-emerald-600 text-white scale-105 shadow-sm border border-emerald-500"
                        : "bg-white text-slate-700 border border-slate-300 hover:border-blue-500 hover:text-blue-600 shadow-sm"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                    <span>{word}</span>
                  </button>
                );
              })}
            </div>

            <button
              disabled={!selectedWord}
              onClick={sendSelectedWord}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-3 h-3" />
              <span>Submit Word</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
