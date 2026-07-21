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
import RoundEndModal from "../component/RoundEndModal";
import {
  ArrowLeft,
  Flame,
  Clock,
  CheckCircle2,
  Users,
  Loader2,
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
        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center mb-3 animate-pulse">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Connecting to Arena...</h3>
        <p className="text-xs text-slate-500 font-mono">Loading match #{gameId} state</p>
      </div>
    );
  }

  const isMatchEnded = game.is_ended || game.current_round >= game.total_round;

  return (
    <div className="min-h-screen p-2 md:p-3 max-w-7xl mx-auto flex flex-col gap-2">
      <GameSocketProvider game={game} setGame={setGame}>
        {/* Animated Round End Popup Modal */}
        <RoundEndModal />

        {/* Ultra-Slim Header Bar */}
        {game && (
          <header className="neon-card rounded-xl px-3 py-1.5 border border-slate-200 bg-white/95 shadow-md backdrop-blur-xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/room/${roomId}/game`)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Exit</span>
              </button>

              <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700">
                  Room #{game.room_id}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-700">
                  Match #{game.id}
                </span>
              </div>
            </div>

            {/* Middle Stats Badges */}
            <div className="flex items-center gap-2">
              {/* Status Chip */}
              <div>
                {isMatchEnded ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ended
                  </span>
                ) : game.is_started ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-full flex items-center gap-1 animate-pulse">
                    <Flame className="w-3 h-3 text-green-600" /> Live
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Waiting
                  </span>
                )}
              </div>

              {/* Round Badge */}
              <div className="px-2.5 py-0.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1 text-[11px]">
                <span className="text-slate-500">Round</span>
                <span className="font-extrabold text-slate-900 font-mono">
                  {Math.min(game.current_round + 1, game.total_round)}
                </span>
                <span className="text-slate-400 font-mono">/ {game.total_round}</span>
              </div>

              {/* Current Turn */}
              {game.is_started && !isMatchEnded && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-50 border border-blue-200 rounded-lg text-[11px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                  <span className="text-slate-500">Turn:</span>
                  <span className="font-bold text-blue-700">
                    {typeof game.current_player === "object"
                      ? game.current_player?.name
                      : game.current_player || "Choosing..."}
                  </span>
                </div>
              )}
            </div>

            {/* Players Summary */}
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[150px]">
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

        {/* Main Arena (Canvas & Chat Side-by-Side in One Screen) */}
        {game && (game.is_started || isMatchEnded) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
            {/* Left Column: Canvas & Leaderboard at Top */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
              {/* REST API End-of-Game Leaderboard at TOP of Canvas */}
              {isMatchEnded && (
                <GameScoreboard gameId={game.id} />
              )}

              <Canvas game={game} />
            </div>

            {/* Right Column: Live Chat Area */}
            <div className="lg:col-span-5 xl:col-span-4">
              <ChatArea room={room} setLogs={() => {}} game={game} setGame={setGame} />
            </div>
          </div>
        )}
      </GameSocketProvider>
    </div>
  );
};

export default Playground;
