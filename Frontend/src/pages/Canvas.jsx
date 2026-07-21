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
      <div className="w-full neon-card rounded-3xl p-4 md:p-5 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Top bar header */}
        <div className="flex flex-wrap justify-between items-center mb-3 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 p-0.5 shadow-md shadow-pink-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Palette className="w-4 h-4 text-cyan-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white tracking-wide font-mono">
                  DOODLY CANVAS
                </h2>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Brush className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  {game?.is_ended ? (
                    "Match Concluded"
                  ) : !game?.is_started ? (
                    "Waiting for host to start game"
                  ) : (
                    <>
                      Current Artist:{" "}
                      <strong className="text-cyan-300 font-bold">
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
              className={`min-w-[100px] px-3.5 py-1.5 rounded-xl flex items-center justify-center gap-2 border-2 text-sm font-extrabold font-mono transition-all duration-300 shadow-lg ${
                timeLeft === 0
                  ? "border-slate-600 text-slate-400 bg-slate-900/50"
                  : timeLeft <= 10
                  ? "border-rose-500 text-rose-400 bg-rose-500/20 animate-pulse shadow-rose-500/40"
                  : "border-cyan-400 text-cyan-300 bg-cyan-500/10 shadow-cyan-500/20"
              }`}
            >
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{timeLeft === 0 ? "Time's Up" : `${timeLeft}s`}</span>
            </div>
          )}
        </div>

        {/* Paintbrush Toolkit Bar (Visible for active drawer) */}
        {userPlaying && !game?.is_ended && (
          <div className="mb-3 p-2.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-inner">
            {/* Colors Palette */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-slate-400 mr-1">
                <Palette className="w-4 h-4 text-cyan-400" />
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
                          ? "border-cyan-400 scale-125 shadow-md shadow-cyan-500/30 ring-2 ring-cyan-400/50"
                          : "border-slate-700 hover:scale-110"
                      }`}
                    >
                      {isEraser && <Eraser className="w-3 h-3 text-slate-900" />}
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
              <div className="flex items-center gap-1 text-slate-400 mr-1">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono hidden sm:inline">
                  Size:
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {THICKNESS_OPTIONS.map((opt) => {
                  const isSelected = lineWidth === opt.width;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setLineWidth(opt.width)}
                      title={`${opt.label} (${opt.width}px)`}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
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
        <div className="w-full h-[300px] sm:h-[330px] md:h-[360px] rounded-2xl p-1.5 bg-slate-950 border border-slate-800 shadow-inner relative overflow-hidden group">
          {/* Status Overlay Tag */}
          <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none flex items-center gap-2">
            {game?.is_started && !game?.is_ended && (
              <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" /> {timeLeft}s
              </span>
            )}
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-800 shadow">
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
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <p className="text-xs font-bold text-white uppercase tracking-wider">
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
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white scale-105 shadow-md shadow-emerald-500/30 border border-emerald-300"
                        : "bg-slate-900/90 text-slate-300 border border-slate-700/80 hover:border-cyan-400 hover:text-white"
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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
