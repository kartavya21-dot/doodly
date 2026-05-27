import React, { useEffect, useState } from "react";
import Canvas from "./Canvas";
import { useParams } from "react-router-dom";
import { getGame } from "../services/game";
import LobbyArea from "../component/LobbyArea";
import { getRoomById } from "../services/room";
import { GameSocketProvider } from "../context/GameSocketContextProvider";
import ChatArea from "./ChatArea";
import GameLogs from "../component/GameLogs";

const Playground = () => {
  const { gameId, roomId } = useParams();
  const [game, setGame] = useState(null);
  const [room, setRoom] = useState(null);
  const [logs, setLogs] = useState([]);

  const fetchGame = async () => {
    try {
      const response = await getGame(gameId);
      setGame(response);
    } catch (e) {
      alert(e);
    }
  };

  const fetchRoom = async () => {
    try {
      const response = await getRoomById(roomId);
      setRoom(response);
    } catch (e) {
      alert(e);
    }
  };


  return (
    <div style={{ color: "white", background: "black" }}>
      <GameSocketProvider gameId={gameId}>
        {game && (
          <div className="max-w-md mx-auto my-6 scale-80 -mb-10 overflow-hidden bg-white border border-gray-100 shadow-xl rounded-2xl dark:bg-gray-900 dark:border-gray-800">
            {/* Header Section */}
            <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-indigo-100 uppercase">
                    Room ID
                  </p>
                  <h3 className="text-2xl font-bold text-white font-mono">
                    {game.room_id}
                  </h3>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {game.is_ended ? (
                    <span className="px-2.5 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full dark:bg-red-900/30 dark:text-red-400">
                      Ended
                    </span>
                  ) : game.is_started ? (
                    <span className="px-2.5 py-1 text-xs font-medium text-green-700 bg-green-100 animate-pulse rounded-full dark:bg-green-900/30 dark:text-green-400">
                      Live
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full dark:bg-yellow-900/30 dark:text-yellow-400">
                      Waiting
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Game Stats Info Grid */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current Round
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {game.current_round}{" "}
                    <span className="text-xs font-normal text-gray-400">
                      / {game.total_round}
                    </span>
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Game ID
                  </p>
                  <p
                    className="text-sm font-mono font-semibold text-gray-700 dark:text-gray-300 truncate"
                    title={game.id}
                  >
                    {game.id}
                  </p>
                </div>
              </div>

              {/* Player Info Sections */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                    Current Turn
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {typeof game.current_player === "object"
                        ? game.current_player?.name
                        : game.current_player}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                    Players Logged In
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {Array.isArray(game.players)
                      ? game.players.join(", ")
                      : String(game.players)}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Timeline Stamp */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-right dark:bg-gray-800/30 dark:border-gray-800">
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                Created:{" "}
                {new Date(game.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        )}
        <GameLogs logs={logs} />
        {game && game?.is_ended && <div>Already ended</div>}
        <Canvas game={game} />
        {game && !game?.is_ended && !game?.is_started && room && (
          <LobbyArea
            setLogs={setLogs}
            setGame={setGame}
            game={game}
            room={room}
          />
        )}
        {game && !game?.is_ended && game?.is_started && (
          <ChatArea
            room={room}
            setLogs={setLogs}
            game={game}
            setGame={setGame}
          />
        )}
      </GameSocketProvider>
    </div>
  );
};

export default Playground;
