import React, { useEffect, useState } from "react";
import { getGameScores } from "../services/game";
import { Trophy, Crown, Medal, Award, Loader2, Sparkles, Star } from "lucide-react";

export default function GameScoreboard({ gameId }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        const data = await getGameScores(gameId);
        const sorted = (data || []).sort((a, b) => b.score - a.score);
        setScores(sorted);
      } catch (err) {
        console.error("Failed to fetch game scores:", err);
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchScores();
    }
  }, [gameId]);

  if (loading) {
    return (
      <div className="neon-card rounded-2xl p-3 border border-amber-200 bg-white text-center flex items-center justify-center gap-2 mb-3">
        <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
        <span className="text-xs font-mono text-slate-500">Loading Final Leaderboard...</span>
      </div>
    );
  }

  return (
    <div className="neon-card rounded-2xl p-3.5 border border-amber-200 bg-white/95 shadow-md backdrop-blur-xl mb-3 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-amber-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
            <Trophy className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-extrabold tracking-wider text-amber-700 font-mono">
            FINAL MATCH LEADERBOARD
          </h3>
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        </div>
        <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          REST SYNCED
        </span>
      </div>

      {/* Leaderboard Horizontal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {scores.length === 0 ? (
          <div className="text-center text-slate-400 text-xs py-2 col-span-full">
            No player scores recorded for this match.
          </div>
        ) : (
          scores.map((item, index) => {
            const username = item.user_username || item.username || `Player ${index + 1}`;
            const score = item.score ?? 0;

            let rankColor = "bg-slate-50 border-slate-200 text-slate-700";
            let icon = <Star className="w-3.5 h-3.5 text-slate-400" />;
            let badge = `#${index + 1}`;

            if (index === 0) {
              rankColor = "bg-amber-50 border-amber-300 text-amber-900 shadow-xs";
              icon = <Crown className="w-4 h-4 text-amber-500 animate-pulse" />;
              badge = "WINNER";
            } else if (index === 1) {
              rankColor = "bg-slate-100 border-slate-300 text-slate-800";
              icon = <Medal className="w-4 h-4 text-slate-500" />;
              badge = "2ND";
            } else if (index === 2) {
              rankColor = "bg-amber-50/50 border-amber-200 text-amber-800";
              icon = <Award className="w-4 h-4 text-amber-600" />;
              badge = "3RD";
            }

            return (
              <div
                key={username + index}
                className={`flex justify-between items-center px-3 py-2 rounded-xl border transition-all ${rankColor}`}
              >
                <div className="flex items-center gap-2">
                  <span className="shrink-0">{icon}</span>
                  <span className="font-bold text-xs truncate max-w-[100px]">{username}</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white border border-slate-200 shadow-2xs">
                    {badge}
                  </span>
                </div>

                <div className="flex items-center gap-1 font-mono">
                  <span className="text-sm font-extrabold text-slate-900">{score}</span>
                  <span className="text-[10px] text-slate-500">pts</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
