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
        // Sort scores descending
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
      <div className="neon-card rounded-3xl p-8 border border-yellow-500/30 text-center flex flex-col items-center justify-center my-6">
        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mb-3" />
        <p className="text-xs font-mono text-slate-400">Retrieving Final Game Leaderboard via REST...</p>
      </div>
    );
  }

  return (
    <div className="neon-card rounded-3xl p-6 md:p-8 border border-yellow-500/40 shadow-2xl backdrop-blur-xl my-6 flex flex-col items-center relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-yellow-400 via-amber-500 to-orange-500 p-0.5 shadow-xl shadow-yellow-500/30 mb-3 animate-bounce">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <h2 className="text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 font-mono">
            FINAL LEADERBOARD
          </h2>
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
        </div>
        <p className="text-xs text-slate-400 mt-1">Official Final Standings (Fetched via REST API)</p>
      </div>

      {/* Leaderboard List */}
      <div className="w-full max-w-xl space-y-3 relative z-10">
        {scores.length === 0 ? (
          <div className="text-center text-slate-500 text-xs py-6">
            No player scores recorded for this match yet.
          </div>
        ) : (
          scores.map((item, index) => {
            const username = item.user_username || item.username || `Player ${index + 1}`;
            const score = item.score ?? 0;

            let rankColor = "bg-slate-900/80 border-slate-800 text-slate-300";
            let icon = <Star className="w-4 h-4 text-slate-500" />;
            let badge = `#${index + 1}`;

            if (index === 0) {
              rankColor = "bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-transparent border-yellow-500/50 text-yellow-200 shadow-lg shadow-yellow-500/10";
              icon = <Crown className="w-5 h-5 text-yellow-400 animate-pulse" />;
              badge = "WINNER";
            } else if (index === 1) {
              rankColor = "bg-gradient-to-r from-slate-300/15 via-slate-400/5 to-transparent border-slate-400/40 text-slate-200";
              icon = <Medal className="w-5 h-5 text-slate-300" />;
              badge = "2ND";
            } else if (index === 2) {
              rankColor = "bg-gradient-to-r from-amber-700/20 via-amber-800/5 to-transparent border-amber-600/40 text-amber-300";
              icon = <Award className="w-5 h-5 text-amber-400" />;
              badge = "3RD";
            }

            return (
              <div
                key={username + index}
                className={`flex justify-between items-center px-5 py-4 rounded-2xl border transition-all duration-200 ${rankColor}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="shrink-0">{icon}</div>
                  <div>
                    <h4 className="font-bold text-base flex items-center gap-2">
                      <span>{username}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10">
                        {badge}
                      </span>
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-xl font-extrabold text-white">{score}</span>
                  <span className="text-xs text-slate-400">pts</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
