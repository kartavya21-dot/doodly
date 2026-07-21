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
  UserPlus,
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
    <div className="w-full neon-card rounded-3xl p-6 border border-slate-200 bg-white/95 shadow-lg backdrop-blur-xl flex flex-col items-center">
      {/* Title */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-wider font-mono">
            GAME PRE-LOBBY
          </h2>
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Gathering players for Match #{game?.id}. Join in and hit Start when ready!
        </p>
      </div>

      {/* Players Card */}
      <div className="w-full max-w-lg bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 shadow-inner">
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Connected Players ({lobbyPlayers?.length || 0})
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded border border-green-200">
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
                    ? "bg-white border-blue-400 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>{player.username}</span>
                      {isMe && (
                        <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded">
                          You
                        </span>
                      )}
                      {isAdmin && (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-600" /> Admin
                        </span>
                      )}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      player.is_active ? "text-green-600" : "text-slate-400"
                    }`}
                  >
                    {player.is_active ? "Online" : "Offline"}
                  </span>
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      player.is_active
                        ? "bg-green-500 shadow-sm animate-pulse"
                        : "bg-slate-300"
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
          className="px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Join Arena</span>
        </button>

        {currentUser === room?.admin_username && (
          <button
            onClick={handleStart}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
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
