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
      })
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
          })
        );
      }
      
      if (messagePayload.type === 'LOST_CONNECTION') {
        setLobbyPlayers((prev) =>
          prev.map((player) => {
            if (player.username === messagePayload.username) {
              return { ...player, isActive: false };
            }
            return player;
          })
        );
      }
    };
    
    // Note: You may want to assign this to socketInstance.onmessage
    socketInstance.onmessage = handleIncomingMessage;

  }, []);

  return (
    <div>
      <h1>Game not started</h1>
      <h2>Players</h2>
      <div className="flex flex-col gap-2">
        {lobbyPlayers.map((player) => {
          return (
            <div
              key={player.username}
              className="border p-2 flex justify-between items-center"
            >
              <h3>{player.username}</h3>
              <div
                className={`${player.isActive ? "bg-green-400" : "bg-red-400"} w-10 aspect-square rounded-full`}
              ></div>
            </div>
          );
        })}
      </div>
      <button
        onClick={handleJoin}
        disabled={socket.current === null}
        className="border-2 border-green-600 p-2 rounded-2xl text-xl"
      >
        Join
      </button>
      {currentUser === room?.admin_username && (
        <button className="border-2 border-green-600 p-2 rounded-2xl text-xl hover:bg-green-500 hover:text-white hover:border-white cursor-pointer">
          Start Game
        </button>
      )}
    </div>
  );
};

export default LobbyArea;