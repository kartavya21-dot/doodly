import React from "react";
import { useGameSocket } from "../context/GameSocketContextProvider";
import { Trophy, Flame, User } from "lucide-react";

export default function LiveRoundScoreboard() {
  const { scores } = useGameSocket();

  if (!scores || scores.length === 0) return null;

  const sortedScores = [...scores].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="w-full neon-card rounded-xl px-3 py-1.5 border border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
        <Trophy className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[11px] text-blue-700">LIVE SCORES:</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {sortedScores.map((item, idx) => {
          const username = item.username || item.user_username || `Player ${idx + 1}`;
          const score = item.score ?? 0;

          return (
            <div
              key={username + idx}
              className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg text-[11px] shadow-2xs"
            >
              <span className="text-slate-400 font-mono font-bold">#{idx + 1}</span>
              <span className="font-bold text-slate-800">{username}</span>
              <span className="font-extrabold text-blue-600 font-mono">{score}pt</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
