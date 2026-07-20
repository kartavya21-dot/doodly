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
      <div className="neon-card rounded-2xl p-3 border border-yellow-500/30 text-center flex items-center justify-center gap-2 mb-3">
        <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
        <span className="text-xs font-mono text-slate-400">Loading Final Leaderboard...</span>
      </div>
    );
  }

  return (
    <div className="neon-card rounded-2xl p-3.5 border border-yellow-500/40 shadow-xl backdrop-blur-xl mb-3 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-yellow-500/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-yellow-400 to-amber-500 p-0.5 shadow-md shadow-yellow-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
              <Trophy className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
          <h3 className="text-sm font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 font-mono">
            FINAL MATCH LEADERBOARD
          </h3>
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
        </div>
        <span className="text-[10px] font-mono text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded-full">
          REST SYNCED
        </span>
      </div>

      {/* Leaderboard Horizontal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {scores.length === 0 ? (
          <div className="text-center text-slate-500 text-xs py-2 col-span-full">
            No player scores recorded for this match.
          </div>
        ) : (
          scores.map((item, index) => {
            const username = item.user_username || item.username || `Player ${index + 1}`;
            const score = item.score ?? 0;

            let rankColor = "bg-slate-950/80 border-slate-800 text-slate-300";
            let icon = <Star className="w-3.5 h-3.5 text-slate-500" />;
            let badge = `#${index + 1}`;

            if (index === 0) {
              rankColor = "bg-yellow-500/15 border-yellow-500/40 text-yellow-200 shadow-sm shadow-yellow-500/10";
              icon = <Crown className="w-4 h-4 text-yellow-400 animate-pulse" />;
              badge = "WINNER";
            } else if (index === 1) {
              rankColor = "bg-slate-800/80 border-slate-700 text-slate-200";
              icon = <Medal className="w-4 h-4 text-slate-300" />;
              badge = "2ND";
            } else if (index === 2) {
              rankColor = "bg-amber-950/40 border-amber-800/40 text-amber-300";
              icon = <Award className="w-4 h-4 text-amber-400" />;
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
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-black/40 border border-white/10">
                    {badge}
                  </span>
                </div>

                <div className="flex items-center gap-1 font-mono">
                  <span className="text-sm font-extrabold text-white">{score}</span>
                  <span className="text-[10px] text-slate-400">pts</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
