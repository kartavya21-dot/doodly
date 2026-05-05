import React, { useEffect, useState } from "react";
import { useGameSocket } from "../context/GameSocketContextProvider";

const LobbyArea = ({ game, room }) => {
  const { socket, isConnected } = useGameSocket();
  const [currentUser, setCurrentUser] = useState("");
  // Renamed to clarify this is a state variable
  const [gamePlayersState, setGamePlayersState] = useState([]);
  // Renamed for better clarity
  const [lobbyPlayers, setLobbyPlayers] = useState([]);

  useEffect(() => {
    setGamePlayersState(game?.players || []);
    setCurrentUser(localStorage.getItem("username"));

    const playerList =
      room?.users?.map((player) => ({
        username: player.username,
        isActive:
          game?.players?.some((p) => p.username === player.username) || false,
      })) || [];

    setLobbyPlayers(playerList);
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

  useEffect(() => {
    const socketInstance = socket.current;

    if (!socketInstance) return;

    // Renamed for clarity and fixed the spelling
    const handleIncomingMessage = (event) => {
      const messagePayload = JSON.parse(event.data);

      if (messagePayload.type === "JOIN") {
        setLobbyPlayers((prev) =>
          prev.map((player) => {
            if (player.username === messagePayload.username) {
              return { ...player, isActive: true };
            }
            return player;
          }),
        );
      }

      if (messagePayload.type === "LOST_CONNECTION") {
        setLobbyPlayers((prev) =>
          prev.map((player) => {
            if (player.username === messagePayload.username) {
              return { ...player, isActive: false };
            }
            return player;
          }),
        );
      }
    };

    // Note: You may want to assign this to socketInstance.onmessage
    socketInstance.onmessage = handleIncomingMessage;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 flex flex-col items-center">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-2 tracking-wide">Game Lobby</h1>
      <p className="text-gray-400 mb-6">Waiting for players to join...</p>

      {/* Players Card */}
      <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-xl p-5">
        <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
          Players
        </h2>

        <div className="flex flex-col gap-3">
          {lobbyPlayers.map((player) => {
            return (
              <div
                key={player.username}
                className="flex justify-between items-center bg-gray-800 hover:bg-gray-700 transition-all duration-200 px-4 py-3 rounded-xl"
              >
                <h3 className="text-lg font-medium">{player.username}</h3>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {player.isActive ? "Online" : "Offline"}
                  </span>
                  <div
                    className={`${
                      player.isActive ? "bg-green-500" : "bg-red-500"
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
          disabled={socket.current === null}
          className="px-6 py-2 rounded-xl bg-green-600 hover:bg-green-500 active:scale-95 transition-all duration-150 shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Join
        </button>

        {currentUser === room?.admin_username && (
          <button className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all duration-150 shadow-lg">
            Start Game
          </button>
        )}
      </div>
    </div>
  );
};

export default LobbyArea;
