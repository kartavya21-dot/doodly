import React, { useEffect, useState } from "react";
import Canvas from "./Canvas";
import { useParams, useNavigate } from "react-router-dom";
import { getGame } from "../services/game";
import LobbyArea from "../component/LobbyArea";
import { getRoomById } from "../services/room";
import { GameSocketProvider } from "../context/GameSocketContextProvider";
import ChatArea from "./ChatArea";
import GameScoreboard from "../component/GameScoreboard";
import LiveRoundScoreboard from "../component/LiveRoundScoreboard";
import {
  ArrowLeft,
  Flame,
  Clock,
  CheckCircle2,
  Users,
  Loader2,
  Trophy,
} from "lucide-react";

const Playground = () => {
  const { gameId, roomId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [room, setRoom] = useState(null);

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

  const isMatchEnded = game.is_ended || game.current_round >= game.total_round;

  return (
    <div className="min-h-screen p-2 md:p-4 max-w-7xl mx-auto flex flex-col gap-3">
      <GameSocketProvider game={game} setGame={setGame}>
        {/* Top Game Bar */}
        {game && (
          <header className="neon-card rounded-2xl p-3 md:p-4 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col lg:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
              <button
                onClick={() => navigate(`/room/${roomId}/game`)}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit Match</span>
              </button>

              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold">
                  Room #{game.room_id}
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold">
                  Match #{game.id}
                </div>
              </div>
            </div>

            {/* Middle Stats Badges */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* Status Chip */}
              <div>
                {isMatchEnded ? (
                  <span className="px-3 py-1 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Match Ended
                  </span>
                ) : game.is_started ? (
                  <span className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center gap-1 animate-pulse">
                    <Flame className="w-3.5 h-3.5 text-emerald-400" /> Live Match
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Waiting Room
                  </span>
                )}
              </div>

              {/* Round Badge */}
              <div className="px-3 py-1 bg-slate-900/80 border border-slate-700/80 rounded-xl flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-semibold">Round</span>
                <span className="font-extrabold text-white font-mono">
                  {Math.min(game.current_round + 1, game.total_round)}
                </span>
                <span className="text-slate-500 font-mono">/ {game.total_round}</span>
              </div>

              {/* Current Turn Badge */}
              {game.is_started && !isMatchEnded && (
                <div className="px-3 py-1 bg-slate-900/80 border border-indigo-500/30 rounded-xl flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-slate-400">Turn:</span>
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
              <span className="truncate max-w-[180px]">
                {Array.isArray(game.players)
                  ? game.players.join(", ")
                  : String(game.players || "None")}
              </span>
            </div>
          </header>
        )}

        {/* Real-time WebSocket Scores Banner */}
        <LiveRoundScoreboard />

        {/* Pre-Game Lobby View */}
        {game && !game?.is_started && !isMatchEnded && room && (
          <LobbyArea setLogs={() => {}} room={room} />
        )}

        {/* Main Arena (Side-by-Side Canvas & Chat without scrolling) */}
        {game && (game.is_started || isMatchEnded) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Canvas Column */}
            <div className="lg:col-span-7 xl:col-span-8">
              <Canvas game={game} />
            </div>

            {/* Chat Column (Allowed during live match AND post-game ended state) */}
            <div className="lg:col-span-5 xl:col-span-4">
              <ChatArea room={room} setLogs={() => {}} game={game} setGame={setGame} />
            </div>
          </div>
        )}

        {/* REST API End-of-Game Leaderboard */}
        {isMatchEnded && (
          <GameScoreboard gameId={game.id} />
        )}
      </GameSocketProvider>
    </div>
  );
};

export default Playground;
