import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGameScores } from "../services/game";
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Loader2,
  Sparkles,
  Star,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";

export default function GameScoreboard({ gameId }) {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        const data = await getGameScores(gameId);
        const sorted = (data || []).sort((a, b) => (b.score || 0) - (a.score || 0));
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
      <div className="neon-card rounded-3xl p-8 border border-amber-200 bg-white/95 text-center flex flex-col items-center justify-center my-8 max-w-xl mx-auto shadow-xl">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-800">Retrieving Final Game Leaderboard...</p>
        <span className="text-xs font-mono text-slate-500 mt-1">REST API Sync</span>
      </div>
    );
  }

  const winner = scores.length > 0 ? scores[0] : null;
  const winnerName = winner?.user_username || winner?.username || "Player 1";
  const winnerScore = winner?.score ?? 0;

  return (
    <div className="w-full max-w-2xl mx-auto neon-card rounded-3xl p-6 md:p-8 border border-amber-200 bg-white/95 shadow-2xl backdrop-blur-xl my-6 flex flex-col items-center text-center animate-pop-in relative overflow-hidden">
      {/* Background Soft Glow Orbs */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Trophy Badge */}
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-lg shadow-amber-500/10 mb-4 animate-bounce relative z-10">
        <Trophy className="w-8 h-8 text-amber-500" />
      </div>

      {/* Header */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: "6s" }} />
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider text-slate-900 font-mono">
            MATCH CONCLUDED!
          </h2>
          <Sparkles className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: "6s" }} />
        </div>
        <p className="text-xs text-slate-500 font-medium">Official Final Scores & Winner Standings</p>
      </div>

      {/* Winner Spotlight Banner */}
      {winner && (
        <div className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-300 shadow-sm flex items-center justify-center gap-3 relative z-10">
          <Crown className="w-6 h-6 text-amber-500 animate-pulse shrink-0" />
          <div className="text-left">
            <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-widest block">
              GRAND WINNER
            </span>
            <span className="text-lg font-extrabold text-slate-900">
              {winnerName}{" "}
              <span className="text-amber-700 font-mono text-base font-bold">
                ({winnerScore} pts)
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Full Leaderboard List */}
      <div className="w-full space-y-2.5 relative z-10 mb-6">
        {scores.length === 0 ? (
          <div className="text-center text-slate-400 text-xs py-6">
            No player scores recorded for this match.
          </div>
        ) : (
          scores.map((item, index) => {
            const username = item.user_username || item.username || `Player ${index + 1}`;
            const score = item.score ?? 0;

            let rankColor = "bg-white border-slate-200 text-slate-700 shadow-2xs";
            let icon = <Star className="w-4 h-4 text-slate-400" />;
            let badge = `#${index + 1}`;

            if (index === 0) {
              rankColor = "bg-amber-50 border-amber-300 text-amber-900 shadow-sm font-bold";
              icon = <Crown className="w-4 h-4 text-amber-500" />;
              badge = "WINNER";
            } else if (index === 1) {
              rankColor = "bg-slate-50 border-slate-300 text-slate-800";
              icon = <Medal className="w-4 h-4 text-slate-500" />;
              badge = "2ND PLACE";
            } else if (index === 2) {
              rankColor = "bg-amber-50/40 border-amber-200 text-amber-800";
              icon = <Award className="w-4 h-4 text-amber-600" />;
              badge = "3RD PLACE";
            }

            return (
              <div
                key={username + index}
                className={`flex justify-between items-center px-4 py-3 rounded-2xl border transition-all ${rankColor}`}
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0">{icon}</span>
                  <span className="font-bold text-sm text-slate-900">{username}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
                    {badge}
                  </span>
                </div>

                <div className="flex items-center gap-1 font-mono">
                  <span className="text-base font-extrabold text-slate-900">{score}</span>
                  <span className="text-xs text-slate-500">pts</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Navigation Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center w-full relative z-10 pt-2 border-t border-slate-200">
        {roomId && (
          <button
            onClick={() => navigate(`/room/${roomId}/game`)}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Return to Room Lobby</span>
          </button>
        )}

        <button
          onClick={() => navigate("/room")}
          className="px-6 py-2.5 rounded-2xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Main Hub</span>
        </button>
      </div>
    </div>
  );
}
