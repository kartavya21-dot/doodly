import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoomUsers } from "../services/room";
import { getRoomGames, createGame, deleteGame } from "../services/game";
import {
  ArrowLeft,
  Gamepad2,
  Plus,
  Trash2,
  Flame,
  CheckCircle,
  Clock,
  Loader2,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";

export default function Game() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [gameTotalRound, setGameTotalRound] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchRoomData = async () => {
    setIsLoading(true);
    try {
      const roomUsers = await getRoomUsers(roomId);
      const roomGames = await getRoomGames(roomId);
      setUsers(roomUsers || []);
      setGames(roomGames || []);
    } catch (error) {
      console.error("Failed to load room data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomData();
  }, [roomId]);

  const handleCreateGame = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await createGame(roomId, {
        total_round: gameTotalRound,
        room_id: roomId,
      });
      setGameTotalRound(1);
      fetchRoomData();
    } catch (error) {
      console.error("Error creating game:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGame = async (id, e) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteGame(id);
      fetchRoomData();
    } catch (error) {
      console.error("Error deleting Game:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 neon-card rounded-3xl p-5 border border-white/10 shadow-2xl backdrop-blur-xl">
        <button
          onClick={() => navigate("/room")}
          className="px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lobby</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-wider text-slate-400 font-mono">
              Room Control Center
            </h2>
            <p className="text-lg font-bold text-white flex items-center gap-2 font-mono">
              <span>Room ID: #{roomId}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Start New Game Card */}
      <div className="neon-card rounded-3xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all max-w-xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Start New Match</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400">Configure round limit for the next match</p>
          </div>
        </div>

        <form onSubmit={handleCreateGame} className="flex gap-3">
          <div className="relative flex-1">
            <input
              placeholder="Total Rounds"
              value={gameTotalRound}
              type="number"
              min="1"
              max="20"
              onChange={(e) => setGameTotalRound(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all text-sm font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isCreating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Launch Game</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Games List */}
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Past & Active Matches</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Total Matches: {games?.length || 0}
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 neon-card rounded-3xl border border-white/5">
            <Loader2 className="w-7 h-7 text-cyan-400 animate-spin mr-3" />
            <span className="text-sm text-slate-400 font-mono">Fetching match records...</span>
          </div>
        ) : games?.length === 0 ? (
          <div className="neon-card rounded-3xl p-8 text-center text-slate-500 text-sm border border-white/5">
            No matches created yet in this room. Launch one above!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {games?.map((g) => (
              <div
                key={g.id}
                onClick={() => navigate(`${g.id}`)}
                className="neon-card rounded-2xl p-5 border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer group flex flex-col md:flex-row justify-between md:items-center gap-4 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-extrabold text-lg text-white group-hover:text-cyan-300 transition-colors font-mono">
                      Match #{g.id}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-3 py-0.5 rounded-full border flex items-center gap-1.5 ${
                        g.is_ended
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : g.is_started
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse"
                          : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                      }`}
                    >
                      {g.is_ended ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> Finished
                        </>
                      ) : g.is_started ? (
                        <>
                          <Flame className="w-3 h-3 text-emerald-400" /> Live Match
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" /> Waiting...
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>
                      Rounds: <strong className="text-slate-200">{g.total_round}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Created: {new Date(g.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleDeleteGame(g.id, e)}
                    disabled={deletingId === g.id}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
                    title="Delete Match"
                  >
                    {deletingId === g.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate(`${g.id}`)}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 border border-cyan-500/40 text-cyan-300 hover:text-white transition-all font-bold text-xs flex items-center gap-2 cursor-pointer group-hover:shadow-lg group-hover:shadow-cyan-500/20"
                  >
                    <span>Play Match</span>
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
