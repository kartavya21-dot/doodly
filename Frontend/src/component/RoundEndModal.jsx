import React, { useEffect, useState } from "react";
import { useGameSocket } from "../context/GameSocketContextProvider";
import {
  Trophy,
  Sparkles,
  PartyPopper,
  CheckCircle2,
  Clock,
  X,
  Flame,
  Award,
  Crown,
  Medal,
} from "lucide-react";

export default function RoundEndModal() {
  const { lastRoundResult, setLastRoundResult, scores } = useGameSocket();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      {/* Background Soft Orbs */}
      <div className="absolute w-96 h-96 bg-blue-300/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-96 h-96 bg-red-300/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Main Modal Card */}
      <div className="neon-card rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-200 bg-white/95 shadow-2xl relative z-10 animate-pop-in flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Badge */}
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 p-0.5 shadow-lg shadow-blue-500/10 mb-4 animate-bounce flex items-center justify-center">
          {isGuessed ? (
            <PartyPopper className="w-8 h-8 text-blue-600" />
          ) : (
            <Clock className="w-8 h-8 text-amber-500" />
          )}
        </div>

        {/* Headline */}
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: "5s" }} />
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider font-mono">
            <span className="text-blue-600">{isGuessed ? "WORD " : "ROUND "}</span>
            <span className="text-red-500">{isGuessed ? "GUESSED!" : "FINISHED!"}</span>
          </h2>
          <Sparkles className="w-5 h-5 text-green-500 animate-spin" style={{ animationDuration: "5s" }} />
        </div>

        {/* Dynamic Result Banner */}
        <div className="w-full my-4 py-3 px-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner">
          {isGuessed ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-sm font-bold text-slate-900">
                <span className="text-blue-600 font-extrabold text-base">
                  {lastRoundResult.username}
                </span>{" "}
                cracked the doodle!
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-sm font-bold text-slate-700">
                {lastRoundResult.message || "Time ran out for this round!"}
              </p>
            </div>
          )}
        </div>

        {/* Updated Round Standings */}
        {sortedScores.length > 0 && (
          <div className="w-full mt-2 mb-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-500" /> Current Match Standings
              </span>
              <span className="text-[10px] font-mono font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
                SCORES UPDATED
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {sortedScores.map((item, idx) => {
                const username = item.username || item.user_username || `Player ${idx + 1}`;
                const score = item.score ?? 0;

                let icon = <Flame className="w-3.5 h-3.5 text-slate-400" />;
                let rankStyle = "bg-white border-slate-200 text-slate-700 shadow-2xs";

                if (idx === 0) {
                  icon = <Crown className="w-4 h-4 text-amber-500 animate-pulse" />;
                  rankStyle = "bg-amber-50 border-amber-300 text-amber-900 shadow-xs";
                } else if (idx === 1) {
                  icon = <Medal className="w-4 h-4 text-slate-400" />;
                  rankStyle = "bg-slate-100 border-slate-300 text-slate-800";
                } else if (idx === 2) {
                  icon = <Award className="w-4 h-4 text-amber-600" />;
                  rankStyle = "bg-amber-50/50 border-amber-200 text-amber-800";
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
                      <span className="text-sm font-extrabold text-slate-900">{score}</span>
                      <span className="text-[10px] text-slate-500">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer info / Continue button */}
        <div className="w-full pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 font-medium">
            Waiting for next round to start...
          </span>

          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Continue Match
          </button>
        </div>
      </div>
    </div>
  );
}
