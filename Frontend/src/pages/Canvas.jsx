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
  UserCheck,
  Brush,
  Zap,
} from "lucide-react";

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
    const payload = {
      type: "CHOOSE_WORD",
      current_word: selectedWord,
      username: username,
    };
    sendMessage(payload);
  };

  return (
    <div className="w-full flex justify-center py-2">
      <div className="w-full neon-card rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Top bar header */}
        <div className="flex flex-wrap justify-between items-center mb-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 p-0.5 shadow-md shadow-pink-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Palette className="w-5 h-5 text-cyan-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-wide font-mono">
                  DOODLY CANVAS
                </h2>
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Brush className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  {!game?.is_started ? (
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

          {/* Neon Timer Indicator */}
          {userPlaying && (
            <div
              className={`min-w-[100px] px-4 py-2 rounded-2xl flex items-center justify-center gap-2 border-2 text-base font-extrabold font-mono transition-all duration-300 shadow-lg ${
                timeLeft === 0
                  ? "border-slate-600 text-slate-400 bg-slate-900/50"
                  : timeLeft <= 10
                  ? "border-rose-500 text-rose-400 bg-rose-500/10 animate-pulse shadow-rose-500/30"
                  : "border-cyan-400 text-cyan-300 bg-cyan-500/10 shadow-cyan-500/20"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{timeLeft === 0 ? "Time's Up" : `${timeLeft}s`}</span>
            </div>
          )}
        </div>

        {/* Board Container */}
        <div className="w-full h-[380px] rounded-2xl p-2 bg-slate-950 border border-slate-800 shadow-inner relative overflow-hidden group">
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800">
              {userPlaying ? "YOUR TURN TO DRAW" : "SPECTATING ARTIST"}
            </span>
          </div>
          <Board />
        </div>

        {/* Word Choice Section (Visible for active drawer) */}
        {userPlaying && (
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-yellow-400" />
              <p className="text-sm font-bold text-white uppercase tracking-wider">
                Select Your Secret Word
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              {words.map((word) => {
                const isSelected = selectedWord === word;
                return (
                  <button
                    key={word}
                    onClick={() => {
                      setSelectedWord(word);
                    }}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold font-mono transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white scale-105 shadow-lg shadow-emerald-500/30 border border-emerald-300"
                        : "bg-slate-900/90 text-slate-300 border border-slate-700/80 hover:border-cyan-400 hover:text-white hover:scale-102"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    <span>{word}</span>
                  </button>
                );
              })}
            </div>

            <button
              disabled={!selectedWord || isSent}
              onClick={sendSelectedWord}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSent ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Word Lock Confirmed</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Selected Word</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
