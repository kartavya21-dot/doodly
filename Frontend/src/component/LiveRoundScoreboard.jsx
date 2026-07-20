import React from "react";
import { useGameSocket } from "../context/GameSocketContextProvider";
import { Trophy, Flame, User, Sparkles } from "lucide-react";

export default function LiveRoundScoreboard() {
  const { scores } = useGameSocket();

  if (!scores || scores.length === 0) return null;

  // Sort scores descending
  const sortedScores = [...scores].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="w-full neon-card rounded-3xl p-4 border border-cyan-500/30 shadow-xl backdrop-blur-xl mb-6">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1">
            <span>Live Round Standings</span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </h3>
        </div>

        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Flame className="w-3 h-3 text-emerald-400" /> WS Live Updates
        </span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedScores.map((item, idx) => {
          const username = item.username || item.user_username || `Player ${idx + 1}`;
          const score = item.score ?? 0;

          return (
            <div
              key={username + idx}
              className="flex justify-between items-center bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 rounded-2xl hover:border-cyan-500/40 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500">#{idx + 1}</span>
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200 truncate max-w-[110px]">
                  {username}
                </span>
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
  );
}
