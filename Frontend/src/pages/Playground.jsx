import React, { useEffect, useState } from "react";
import Canvas from "./Canvas";
import { useParams, useNavigate } from "react-router-dom";
import { getGame } from "../services/game";
import LobbyArea from "../component/LobbyArea";
import { getRoomById } from "../services/room";
import { GameSocketProvider } from "../context/GameSocketContextProvider";
import ChatArea from "./ChatArea";
import GameLogs from "../component/GameLogs";
import {
  ArrowLeft,
  Crown,
  Flame,
  Radio,
  Clock,
  CheckCircle2,
  User,
  Users,
  Loader2,
  Terminal,
  Sparkles,
  Trophy,
} from "lucide-react";

const Playground = () => {
  const { gameId, roomId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [room, setRoom] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGame = async () => {
    try {
      const response = await getGame(gameId);
      setGame(response);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRoom = async () => {
    try {
      const response = await getRoomById(roomId);
      setRoom(response);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchGame(), fetchRoom()]);
      setIsLoading(false);
    };
    init();
  }, [gameId, roomId]);

  if (isLoading || !gameId || !game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-pink-500 p-0.5 shadow-xl shadow-cyan-500/20 mb-4 animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">Connecting to Arena...</h3>
        <p className="text-xs text-slate-400 font-mono">Loading match #{gameId} state</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 md:p-6 max-w-7xl mx-auto flex flex-col gap-6">
      <GameSocketProvider game={game} setGame={setGame}>
        {/* Top Game Bar */}
        {game && (
          <header className="neon-card rounded-3xl p-4 md:p-5 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
              <button
                onClick={() => navigate(`/room/${roomId}/game`)}
                className="px-3.5 py-2 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Exit Match</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold">
                  Room #{game.room_id}
                </div>
                <div className="px-3 py-1.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold">
                  Match #{game.id}
                </div>
              </div>
            </div>

            {/* Middle Stats Badges */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {/* Status Chip */}
              <div>
                {game.is_ended ? (
                  <span className="px-3 py-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Match Ended
                  </span>
                ) : game.is_started ? (
                  <span className="px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center gap-1.5 animate-pulse">
                    <Flame className="w-3.5 h-3.5 text-emerald-400" /> Live Match
                  </span>
                ) : (
                  <span className="px-3 py-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Waiting Room
                  </span>
                )}
              </div>

              {/* Round Badge */}
              <div className="px-3.5 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-2xl flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold">Round</span>
                <span className="font-extrabold text-white font-mono">
                  {game.current_round + 1}
                </span>
                <span className="text-slate-500 font-mono">/ {game.total_round}</span>
              </div>

              {/* Current Turn Badge */}
              {game.is_started && !game.is_ended && (
                <div className="px-3.5 py-1.5 bg-slate-900/80 border border-indigo-500/30 rounded-2xl flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-slate-400">Current Turn:</span>
                  <span className="font-bold text-cyan-300">
                    {typeof game.current_player === "object"
                      ? game.current_player?.name
                      : game.current_player || "Choosing..."}
                  </span>
                </div>
              )}
            </div>

            {/* Players Summary */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="truncate max-w-[200px]">
                {Array.isArray(game.players)
                  ? game.players.join(", ")
                  : String(game.players || "None")}
              </span>
            </div>
          </header>
        )}

        {/* Game Finished Overlay Banner */}
        {game && game?.is_ended && (
          <div className="neon-card rounded-3xl p-6 border border-rose-500/30 bg-rose-500/5 text-center flex flex-col items-center gap-2 my-2">
            <Trophy className="w-10 h-10 text-yellow-400 animate-bounce" />
            <h3 className="text-xl font-extrabold text-white">This Match Has Concluded</h3>
            <p className="text-xs text-slate-400">Great doodling! Check final standings or return to the room lobby to start a new match.</p>
          </div>
        )}

        {/* Canvas & Interactive Area */}
        <Canvas game={game} />

        {/* Pre-game Lobby or Active Chat Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            {game && !game?.is_ended && !game?.is_started && room && (
              <LobbyArea setLogs={setLogs} room={room} />
            )}

            {/* Live Event Feed Console */}
            <GameLogs />
          </div>

          {/* Right Chat Column when game is running */}
          {game && !game?.is_ended && game?.is_started && (
            <div className="lg:col-span-1">
              <ChatArea room={room} setLogs={setLogs} game={game} setGame={setGame} />
            </div>
          )}
        </div>
      </GameSocketProvider>
    </div>
  );
};

export default Playground;
