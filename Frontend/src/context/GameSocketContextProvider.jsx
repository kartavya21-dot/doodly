import {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useUser } from "./UserContextProvider";

const GameSocketContext = createContext(null);

export const useGameSocket = () => useContext(GameSocketContext);

export function GameSocketProvider({ game, setGame, children }) {
  const socketRef = useRef(null);
  const currentUser = useUser().username;
  const [isConnected, setIsConnected] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0);

  const [selectedWord, setSelectedWord] = useState("");

  const [isSent, setIsSent] = useState(false);

  const [messages, setMessages] = useState([]);

  const [lobbyPlayers, setLobbyPlayers] = useState([]);

  const [logs, setLogs] = useState([]);

  const [userPlaying, setUserPlaying] = useState(false);

  const canvasRef = useRef(null);

  const registerCanvas = useCallback(
    (canvas) => {
      canvasRef.current = canvas?.current ?? null;
      if (canvasRef.current) {
        // When a new canvas is registered, replay the history
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    },
    [],
  ); // Re-create if history changes, though this is for initial draw

  const drawSegment = (data) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.lineWidth;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(data.x0, data.y0);
    ctx.lineTo(data.x1, data.y1);
    ctx.stroke();
  }

  const sendMessage = (data) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  };

  const handleIncomingMessage = (data) => {
    setLogs((prev) => [
      ...prev,
      {
        ...data,
        timestamp: Date.now(), // Adds timing anchor
        id: crypto.randomUUID(), // Safe key for React mapping
      },
    ]);

    switch (data.type) {
      case "JOIN": {
        setLobbyPlayers((prev) =>
          prev.map((player) => {
            if (player.username === data.username) {
              return { ...player, is_active: true };
            }
            return player;
          }),
        );
        break;
      }

      case "START": {
        setGame((prev) => ({
          ...prev,
          is_started: true,
          current_player: data.username,
        }));
        break;
      }

      case "TIMER": {
        setTimeLeft(data.timeLeft);
        break;
      }

      case "CHOOSE_WORD": {
        setMessages((prev) => [...prev, data]);
        break;
      }

      case "DRAW": {
        drawSegment(data);
        break;
      }

      case "GUESS": {
        setMessages((prev) => [...prev, data]);
        break;
      }

      case "WIN": {
        setSelectedWord(null);
        setIsSent(false);
        setMessages((prev) => [...prev, data]);
        setGame((prev) => ({
          ...prev,
          current_round: game.current_round + 1,
        }));
        break;
      }

      case "NEXT_ROUND": {
        setSelectedWord(null);
        setIsSent(false);
        setMessages((prev) => [...prev, data]);
        setGame((prev) => ({
          ...prev,
          current_player: data.username,
          current_round: Number(prev.current_round) + 1,
        }));
        break;
      }

      case "GAME_END": {
        setSelectedWord(null);
        setIsSent(false);
        setGame((prev) => ({
          ...prev,
          is_ended: true,
        }));
        break;
      }

      case "LOST_CONNECTION": {
        setLobbyPlayers((prev) =>
          prev.map((player) => {
            if (player.username === data.username) {
              return { ...player, is_active: false };
            }
            return player;
          }),
        );
        break;
      }
    }
  };

  useEffect(() => {
    if (!game) return;
    const token = localStorage.getItem("access_token");
    if (!socketRef.current) {
      const ws = new WebSocket(
        `ws://localhost:8000/ws?token=${token}&game_id=${game.id}`,
      );
      ws.onopen = () => setIsConnected(true);
      ws.onclose = () => setIsConnected(false);
      ws.onerror = () => setIsConnected(false);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleIncomingMessage(data);
      };

      socketRef.current = ws;
    }

    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [game.id]);

  useEffect(() => {
    if(!game) return;

    if(game.current_player === currentUser) {
      setUserPlaying(true);
    } else {
      setUserPlaying(false);
    }

  }, [game.current_player])

  return (
    <GameSocketContext.Provider
      value={{
        socket: socketRef,
        isConnected,
        game,
        userPlaying,

        timeLeft,
        selectedWord,
        setSelectedWord,
        isSent,

        messages,
        lobbyPlayers,
        setLobbyPlayers,
        logs,

        registerCanvas,
        drawSegment,

        sendMessage,
      }}
    >
      {children}
    </GameSocketContext.Provider>
  );
}
