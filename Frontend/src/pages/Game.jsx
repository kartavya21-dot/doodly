import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoomUsers } from "../services/room";
import { getRoomGames, createGame, deleteGame } from "../services/game";
import { playSound } from "../utils/soundManager";
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
  CheckCircle2,
} from "lucide-react";

export default function Game() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [gameTotalRound, setGameTotalRound] = useState(1);
  const [activeTab, setActiveTab] = useState("active"); // "active" or "past"

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
      playSound("paperCrumble");
      setActiveTab("active"); // Automatically switch to active tab when launching a game
    } catch (error) {
      playSound("error");
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
      playSound("error");
      console.error("Error deleting Game:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const activeGames = games.filter((g) => !g.is_ended);
  const pastGames = games.filter((g) => g.is_ended);
  const displayedGames = activeTab === "active" ? activeGames : pastGames;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 neon-card rounded-3xl p-5 border border-slate-200 bg-white/90 shadow-lg shadow-slate-200/50 backdrop-blur-xl">
        <button
          onClick={() => navigate("/room")}
          className="px-4 py-2 rounded-2xl bg-white border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lobby</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-wider text-slate-500 font-mono font-semibold">
              Room Control Center
            </h2>
            <p className="text-lg font-bold text-slate-900 flex items-center gap-2 font-mono">
              <span>Room ID: #{roomId}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Start New Game Card */}
      <div className="neon-card rounded-3xl p-6 border border-slate-200 bg-white max-w-xl mx-auto w-full shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Start New Match</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </h3>
            <p className="text-xs text-slate-500">Configure round limit for the next match</p>
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
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm font-mono font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
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

      {/* Games List Container */}
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-4">
        {/* Section Header with Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-extrabold text-slate-900">Room Matches</h3>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "active"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Active</span>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                  activeTab === "active"
                    ? "bg-blue-500 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {activeGames.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("past")}
              className={`px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "past"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Past</span>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                  activeTab === "past"
                    ? "bg-blue-500 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {pastGames.length}
              </span>
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12 neon-card rounded-3xl border border-slate-200 bg-white shadow-sm">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin mr-3" />
            <span className="text-sm text-slate-500 font-mono">Fetching match records...</span>
          </div>
        ) : displayedGames.length === 0 ? (
          /* Empty tab states */
          <div className="neon-card rounded-3xl p-8 text-center text-slate-500 text-sm border border-slate-200 bg-white shadow-sm">
            {activeTab === "active"
              ? "No active/unfinished matches in this room. Launch one above!"
              : "No past matches completed yet in this room."}
          </div>
        ) : (
          /* Matches List */
          <div className="flex flex-col gap-4">
            {displayedGames.map((g) => (
              <div
                key={g.id}
                onClick={() => navigate(`${g.id}`)}
                className="neon-card rounded-2xl p-5 border border-slate-200 bg-white hover:border-blue-400 transition-all cursor-pointer group flex flex-col md:flex-row justify-between md:items-center gap-4 relative overflow-hidden shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-extrabold text-lg text-slate-900 group-hover:text-blue-600 transition-colors font-mono">
                      Match #{g.id}
                    </span>

                    <span
                      className={`text-[11px] font-bold px-3 py-0.5 rounded-full border flex items-center gap-1.5 ${
                        g.is_ended
                          ? "bg-red-50 text-red-700 border-red-200"
                          : g.is_started
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {g.is_ended ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> Finished
                        </>
                      ) : g.is_started ? (
                        <>
                          <Flame className="w-3 h-3 text-emerald-600" /> Live Match
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" /> Waiting...
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>
                      Rounds: <strong className="text-slate-800">{g.total_round}</strong>
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
                    className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
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
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
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
