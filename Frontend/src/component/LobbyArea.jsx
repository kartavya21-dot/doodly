import React, { use, useContext, useEffect, useState } from "react";
import { useUser } from "../context/UserContextProvider";
import { useGameSocket } from "../context/GameSocketContextProvider";
import { getGamePlayers } from "../services/game";

const LobbyArea = ({ setLogs, setGame, game, room }) => {
  const { socket, isConnected } = useGameSocket();
  const currentUser = useUser().username;
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [playerWithStatus, setPlayerWithStatus] = useState([]);
  const [joinedGame, setJoinedGame] = useState(false);

  const fetchGamePlayers = async () => {
    try {
      const gamePlayers = await getGamePlayers(game.id);

      // Create lookup
      const playerMap = gamePlayers.reduce((acc, player) => {
        acc[player.user_username] = player;
        return acc;
      }, {});

      // Merge room users with game data
      const mergedPlayers = room.users.map((user) => ({
        ...user,
        is_active: playerMap[user.username]?.is_active ?? false,
        turn: playerMap[user.username]?.turn ?? null,
      }));

      setLobbyPlayers(mergedPlayers);
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    if (room && game) {
      fetchGamePlayers();
    }
  }, [room, game]);

  const handleJoin = () => {
    const socketInstance = socket.current;

    if (!socketInstance || !isConnected) {
      console.log("Socket not ready:", socketInstance?.readyState);
      return;
    }

    socketInstance.send(
      JSON.stringify({
        type: "JOIN",
        username: currentUser,
      }),
    );
  };

  const handleStart = () => {
    const socketInstance = socket.current;

    if (!socketInstance || !isConnected) {
      console.log("Socket not ready:", socketInstance?.readyState);
      return;
    }

    socketInstance.send(
      JSON.stringify({
        type: "START",
        username: currentUser,
      }),
    );
  };

  useEffect(() => {
    const socketInstance = socket.current;

    if (!socketInstance) return;

    const handleIncomingMessage = (event) => {
      const messagePayload = JSON.parse(event.data);

      const newLog = {
        ...messagePayload,
        timestamp: Date.now(), // Adds timing anchor
        id: crypto.randomUUID(), // Safe key for React mapping
      };

      setLogs((prevLogs) => [...prevLogs, newLog]);

      if (messagePayload.type === "JOIN") {
        if (messagePayload.username === currentUser) {
          setJoinedGame(true);
        }
        setLobbyPlayers((prev) =>
          prev.map((player) => {
            if (player.username === messagePayload.username) {
              return { ...player, is_active: true };
            }
            return player;
          }),
        );
      }

      if (messagePayload.type === "WIN") {
        setGame((prev) => ({
          ...prev,
          current_round: game.current_round + 1,
        }));
      }

      if (messagePayload.type === "GAME_END") {
        setGame((prev) => ({
          ...prev,
          is_ended: true,
        }));
      }

      if (messagePayload.type === "LOST_CONNECTION") {
        setLobbyPlayers((prev) =>
          prev.map((player) => {
            if (player.username === messagePayload.username) {
              return { ...player, is_active: false };
            }
            return player;
          }),
        );
      }

      if (messagePayload.type === "START") {
        setGame((prev) => ({
          ...prev,
          is_started: true,
          current_player: messagePayload.username,
        }));
      }
      console.log("Inconing lobby: ", game);
    };

    socketInstance.addEventListener("message", handleIncomingMessage);

    return () => {
      socketInstance.removeEventListener("message", handleIncomingMessage);
    };
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-800 text-white p-6 flex flex-col items-center">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-2 tracking-wide">Game Lobby</h1>
      <p className="text-gray-400 mb-6">Waiting for players to join...</p>

      {/* Players Card */}
      <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-xl p-5">
        <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
          Players
        </h2>

        <div className="flex flex-col gap-3">
          {Array.from(lobbyPlayers)?.map((player) => {
            return (
              <div
                key={player.user_username}
                className="flex justify-between items-center bg-gray-800 hover:bg-gray-700 transition-all duration-200 px-4 py-3 rounded-xl"
              >
                <h3 className="text-lg font-medium">{player.username}</h3>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {player.is_active ? "Online" : "Offline"}
                  </span>
                  <div
                    className={`${
                      player.is_active ? "bg-green-500" : "bg-red-500"
                    } w-3 h-3 rounded-full shadow-md`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleJoin}
          disabled={socket.current === null || joinedGame}
          className="px-6 py-2 rounded-xl bg-green-600 hover:bg-green-500 active:scale-95 transition-all duration-150 shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Join
        </button>

        {currentUser === room?.admin_username && (
          <button
            onClick={handleStart}
            className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all duration-150 shadow-lg"
          >
            Start Game
          </button>
        )}
      </div>
    </div>
  );
};

export default LobbyArea;
