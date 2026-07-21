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

  return (
    <div className="w-full flex justify-center py-1">
      <div className="w-full neon-card rounded-3xl p-4 md:p-5 border border-slate-200 bg-white/95 shadow-lg relative overflow-hidden backdrop-blur-xl">
        {/* Top bar header */}
        <div className="flex flex-wrap justify-between items-center mb-3 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <Palette className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-wide font-mono">
                  <span className="text-blue-600">D</span>
                  <span className="text-red-500">o</span>
                  <span className="text-amber-500">o</span>
                  <span className="text-blue-600">d</span>
                  <span className="text-green-600">l</span>
                  <span className="text-red-500">y</span>
                  <span className="text-slate-800 ml-1.5">Canvas</span>
                </h2>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Brush className="w-3.5 h-3.5 text-purple-600" />
                <span>
                  {game?.is_ended ? (
                    "Match Concluded"
                  ) : !game?.is_started ? (
                    "Waiting for host to start game"
                  ) : (
                    <>
                      Current Artist:{" "}
                      <strong className="text-blue-600 font-bold">
                        {game?.current_player || "Choosing word..."}
                      </strong>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Neon Timer Indicator - VISIBLE TO EVERYONE DURING GAME */}
          {game?.is_started && !game?.is_ended && (
            <div
              className={`min-w-[100px] px-3.5 py-1.5 rounded-xl flex items-center justify-center gap-2 border-2 text-sm font-extrabold font-mono transition-all duration-300 shadow-sm ${
                timeLeft === 0
                  ? "border-slate-300 text-slate-500 bg-slate-100"
                  : timeLeft <= 10
                  ? "border-red-400 text-red-600 bg-red-50 animate-pulse"
                  : "border-blue-400 text-blue-700 bg-blue-50"
              }`}
            >
              <Clock className="w-4 h-4 text-blue-600" />
              <span>{timeLeft === 0 ? "Time's Up" : `${timeLeft}s`}</span>
            </div>
          )}
        </div>

        {/* Paintbrush Toolkit Bar (Visible for active drawer) */}
        {userPlaying && !game?.is_ended && (
          <div className="mb-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-inner">
            {/* Colors Palette */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-slate-600 mr-1">
                <Palette className="w-4 h-4 text-blue-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono hidden sm:inline">
                  Color:
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {COLOR_OPTIONS.map((c) => {
                  const isSelected = color === c.hex;
                  const isEraser = c.hex === "#ffffff";

                  return (
                    <button
                      key={c.name}
                      onClick={() => setColor(c.hex)}
                      title={c.name}
                      style={{ backgroundColor: c.hex }}
                      className={`w-6 h-6 rounded-full border-2 transition-all duration-150 flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? "border-blue-600 scale-125 shadow-md ring-2 ring-blue-400/40"
                          : "border-slate-300 hover:scale-110"
                      }`}
                    >
                      {isEraser && <Eraser className="w-3 h-3 text-slate-700" />}
                      {isSelected && !isEraser && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Thickness / Size Picker */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-slate-600 mr-1">
                <Sliders className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono hidden sm:inline">
                  Size:
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                {THICKNESS_OPTIONS.map((opt) => {
                  const isSelected = lineWidth === opt.width;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setLineWidth(opt.width)}
                      title={`${opt.label} (${opt.width}px)`}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
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
            </div>
          </div>
        )}

        {/* Board Container */}
        <div className="w-full h-[300px] sm:h-[330px] md:h-[360px] rounded-2xl p-1.5 bg-slate-100 border border-slate-300 shadow-inner relative overflow-hidden group">
          {/* Status Overlay Tag */}
          <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none flex items-center gap-2">
            {game?.is_started && !game?.is_ended && (
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                <Clock className="w-3 h-3 text-blue-600" /> {timeLeft}s
              </span>
            )}
            <span className="text-[10px] font-mono font-bold text-slate-700 bg-white/90 px-2 py-0.5 rounded-md border border-slate-300 shadow-sm">
              {game?.is_ended
                ? "MATCH ENDED"
                : userPlaying
                ? "YOUR TURN TO DRAW"
                : "SPECTATING ARTIST"}
            </span>
          </div>
          <Board color={color} lineWidth={lineWidth} />
        </div>

        {/* Word Choice Section - Removed once word is chosen/acknowledged */}
        {userPlaying && !isSent && !game?.is_ended && (
          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Select Your Secret Word
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {words.map((word) => {
                const isSelected = selectedWord === word;
                return (
                  <button
                    key={word}
                    onClick={() => {
                      setSelectedWord(word);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-emerald-600 text-white scale-105 shadow-md shadow-emerald-500/20 border border-emerald-500"
                        : "bg-white text-slate-700 border border-slate-300 hover:border-blue-500 hover:text-blue-600 shadow-sm"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    <span>{word}</span>
                  </button>
                );
              })}
            </div>

            <button
              disabled={!selectedWord}
              onClick={sendSelectedWord}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Selected Word</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
