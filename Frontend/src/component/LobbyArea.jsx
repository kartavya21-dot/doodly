import React, { useEffect } from "react";
import { useUser } from "../context/UserContextProvider";
import { useGameSocket } from "../context/GameSocketContextProvider";
import { getGamePlayers } from "../services/game";
import {
  Users,
  UserCheck,
  Play,
  Crown,
  Sparkles,
  Radio,
  UserPlus,
  Zap,
} from "lucide-react";

const LobbyArea = ({ setLogs, room }) => {
  const { sendMessage, game, lobbyPlayers, setLobbyPlayers } = useGameSocket();
  const currentUser = useUser().username;

  const fetchGamePlayers = async () => {
    try {
      const gamePlayers = await getGamePlayers(game.id);

      const playerMap = gamePlayers.reduce((acc, player) => {
        acc[player.user_username] = player;
        return acc;
      }, {});

      const mergedPlayers = room?.users?.map((user) => ({
        ...user,
        is_active: playerMap[user.username]?.is_active ?? false,
        turn: playerMap[user.username]?.turn ?? null,
      })) || [];

      setLobbyPlayers(mergedPlayers);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (room && game) {
      fetchGamePlayers();
    }
  }, [room, game]);

  const handleJoin = () => {
    sendMessage({
      type: "JOIN",
      username: currentUser,
    });
  };

  const handleStart = () => {
    sendMessage({
      type: "START",
      username: currentUser,
    });
  };

  return (
    <div className="w-full neon-card rounded-3xl p-6 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col items-center">
      {/* Title */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <h2 className="text-2xl font-extrabold text-white tracking-wider font-mono">
            GAME PRE-LOBBY
          </h2>
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
        </div>
        <p className="text-xs text-slate-400">
          Gathering players for Match #{game?.id}. Join in and hit Start when ready!
        </p>
      </div>

      {/* Players Card */}
      <div className="w-full max-w-lg bg-slate-950/80 border border-slate-800 rounded-2xl p-5 mb-6">
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Connected Players ({lobbyPlayers?.length || 0})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            WS LIVE
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {Array.from(lobbyPlayers || [])?.map((player) => {
            const isAdmin = player.username === room?.admin_username;
            const isMe = player.username === currentUser;

            return (
              <div
                key={player.username || player.user_username}
                className={`flex justify-between items-center px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isMe
                    ? "bg-slate-900 border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 p-0.5 flex items-center justify-center">
                    <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{player.username}</span>
                      {isMe && (
                        <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                          You
                        </span>
                      )}
                      {isAdmin && (
                        <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-400" /> Admin
                        </span>
                      )}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      player.is_active ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    {player.is_active ? "Online" : "Offline"}
                  </span>
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      player.is_active
                        ? "bg-emerald-400 shadow-[0_0_8px_#22c55e] animate-pulse"
                        : "bg-slate-600"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={handleJoin}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Join Arena</span>
        </button>

        {currentUser === room?.admin_username && (
          <button
            onClick={handleStart}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-pink-500/20 active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Match Now</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LobbyArea;
