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

  const [scores, setScores] = useState([]);

  const [lastRoundResult, setLastRoundResult] = useState(null);

  const [isWordChosen, setIsWordChosen] = useState(false);

  const canvasRef = useRef(null);

  const clearCanvas = useCallback(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  const registerCanvas = useCallback(
    (canvas) => {
      canvasRef.current = canvas?.current ?? null;
      if (canvasRef.current) {
        clearCanvas();
      }
    },
    [clearCanvas],
  );

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
  };

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
        timestamp: Date.now(),
        id: crypto.randomUUID(),
      },
    ]);

    if (data.score && Array.isArray(data.score)) {
      setScores(data.score);
    }

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
        clearCanvas();
        setLastRoundResult(null);
        setIsWordChosen(false);
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
        setIsWordChosen(true);
        if (data.username === currentUser) {
          setIsSent(true);
        }
        break;
      }

      case "DRAW": {
        const canvas = canvasRef.current;
        if (canvas) {
          const deNormalizedData = {
            ...data,
            x0: data.x0 * canvas.width,
            y0: data.y0 * canvas.height,
            x1: data.x1 * canvas.width,
            y1: data.y1 * canvas.height,
          };
          drawSegment(deNormalizedData);
        }
        break;
      }

      case "CLEAR": {
        clearCanvas();
        break;
      }

      case "GUESS": {
        setMessages((prev) => [...prev, data]);
        break;
      }

      case "ROUND_END": {
        clearCanvas();
        setSelectedWord(null);
        setIsSent(false);
        setIsWordChosen(false);
        setMessages((prev) => [...prev, data]);
        if (data.score) setScores(data.score);
        setLastRoundResult(data);
        setGame((prev) => ({
          ...prev,
          current_player: null,
        }));
        break;
      }

      case "NEXT_ROUND": {
        clearCanvas();
        setSelectedWord(null);
        setIsSent(false);
        setIsWordChosen(false);
        setLastRoundResult(null);
        setMessages((prev) => [...prev, data]);
        setGame((prev) => ({
          ...prev,
          current_player: data.username,
          current_round: Number(prev.current_round) + 1,
        }));
        break;
      }

      case "GAME_END": {
        clearCanvas();
        setSelectedWord(null);
        setIsSent(false);
        setIsWordChosen(false);
        setLastRoundResult(null);
        if (data.score) setScores(data.score);
        setGame((prev) => ({
          ...prev,
          current_player: null,
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
    if (!game) return;

    if (!game.is_ended && game.current_player === currentUser) {
      setUserPlaying(true);
    } else {
      setUserPlaying(false);
    }
  }, [game.current_player, game.is_ended, currentUser]);

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
        scores,
        lastRoundResult,
        setLastRoundResult,
        isWordChosen,

        registerCanvas,
        drawSegment,
        clearCanvas,

        sendMessage,
      }}
    >
      {children}
    </GameSocketContext.Provider>
  );
}
