import React, { useEffect, useState } from "react";
import Canvas from "./Canvas";
import { useParams } from "react-router-dom";
import { getGame } from "../services/game";
import LobbyArea from "../component/LobbyArea";
import { getRoomById } from "../services/room";
import { GameSocketProvider } from "../context/GameSocketContextProvider";
import ChatArea from "./ChatArea";

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

  useEffect(() => {
    fetchGame();
    fetchRoom();
  }, [gameId, roomId]);

  return (
    <div style={{ color: "white", background: "black" }}>
      <GameSocketProvider gameId={gameId}>
        {game && game?.is_ended && <div>Already ended</div>}
        <Canvas game={game} />
        {game && !game?.is_ended && !game?.is_started && room && (
          <LobbyArea setGame={setGame} game={game} room={room} />
        )}
        {game && !game?.is_ended && game?.is_started && (
          <ChatArea game={game} setGame={setGame} />
        )}
      </GameSocketProvider>
    </div>
  );
};

export default Playground;
