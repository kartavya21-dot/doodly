import React, { useEffect, useState } from "react";
import { useGameSocket } from "../context/GameSocketContextProvider";
import {
  Trophy,
  Sparkles,
  PartyPopper,
  CheckCircle2,
  Clock,
  Zap,
  X,
  Flame,
  Award,
  Crown,
  Medal,
} from "lucide-react";

export default function RoundEndModal() {
  const { lastRoundResult, setLastRoundResult, scores, game } = useGameSocket();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (lastRoundResult) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [lastRoundResult]);

  if (!visible || !lastRoundResult) return null;

  const handleClose = () => {
    setVisible(false);
    if (setLastRoundResult) setLastRoundResult(null);
  };

  const isGuessed = lastRoundResult.username && lastRoundResult.message?.includes("guessed");
  const eventScores = lastRoundResult.score || scores || [];
  const sortedScores = [...eventScores].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Background Neon Orbs */}
      <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Main Modal Card */}
      <div className="neon-card rounded-3xl p-6 md:p-8 max-w-lg w-full border border-cyan-400/40 shadow-2xl relative z-10 animate-pop-in flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white hover:border-rose-500/50 transition-all cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 p-0.5 shadow-xl shadow-cyan-500/30 mb-4 animate-bounce">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            {isGuessed ? (
              <PartyPopper className="w-8 h-8 text-cyan-400" />
            ) : (
              <Clock className="w-8 h-8 text-amber-400" />
            )}
          </div>
        </div>

        {/* Headline */}
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" style={{ animationDuration: "5s" }} />
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-pink-400 to-purple-400 font-mono">
            {isGuessed ? "WORD GUESSED!" : "ROUND FINISHED!"}
          </h2>
          <Sparkles className="w-5 h-5 text-pink-400 animate-spin" style={{ animationDuration: "5s" }} />
        </div>

        {/* Dynamic Result Banner */}
        <div className="w-full my-4 py-3 px-4 rounded-2xl bg-slate-950/80 border border-white/10 shadow-inner">
          {isGuessed ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-sm font-bold text-white">
                <span className="text-cyan-300 font-extrabold text-base">
                  {lastRoundResult.username}
                </span>{" "}
                cracked the doodle!
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-sm font-bold text-slate-300">
                {lastRoundResult.message || "Time ran out for this round!"}
              </p>
            </div>
          )}
        </div>

        {/* Updated Round Standings */}
        {sortedScores.length > 0 && (
          <div className="w-full mt-2 mb-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" /> Current Match Standings
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                SCORES UPDATED
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {sortedScores.map((item, idx) => {
                const username = item.username || item.user_username || `Player ${idx + 1}`;
                const score = item.score ?? 0;

                let icon = <Flame className="w-3.5 h-3.5 text-slate-500" />;
                let rankStyle = "bg-slate-900/80 border-slate-800 text-slate-300";

                if (idx === 0) {
                  icon = <Crown className="w-4 h-4 text-yellow-400 animate-pulse" />;
                  rankStyle = "bg-yellow-500/10 border-yellow-500/40 text-yellow-300 shadow-sm shadow-yellow-500/10";
                } else if (idx === 1) {
                  icon = <Medal className="w-4 h-4 text-slate-300" />;
                  rankStyle = "bg-slate-800/80 border-slate-700 text-slate-200";
                } else if (idx === 2) {
                  icon = <Award className="w-4 h-4 text-amber-400" />;
                  rankStyle = "bg-amber-950/30 border-amber-800/40 text-amber-300";
                }

                return (
                  <div
                    key={username + idx}
                    className={`flex justify-between items-center px-4 py-2.5 rounded-xl border transition-all ${rankStyle}`}
                  >
                    <div className="flex items-center gap-2.5">
                      {icon}
                      <span className="text-xs font-bold">{username}</span>
                    </div>

                    <div className="flex items-center gap-1 font-mono">
                      <span className="text-sm font-extrabold text-cyan-300">{score}</span>
                      <span className="text-[10px] text-slate-500">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer info / Continue button */}
        <div className="w-full pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 font-medium">
            Waiting for next round to start...
          </span>

          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Continue Match
          </button>
        </div>
      </div>
    </div>
  );
}
