import {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useUser, getStoredUsername } from "./UserContextProvider";
import { playSound } from "../utils/soundManager";
import { getWsUrl } from "../services";

const GameSocketContext = createContext(null);

export const useGameSocket = () => useContext(GameSocketContext);

const COLOR_PALETTE = [
  "#0f172a", // 0: Black
  "#ef4444", // 1: Red
  "#ec4899", // 2: Pink
  "#a855f7", // 3: Purple
  "#3b82f6", // 4: Blue
  "#06b6d4", // 5: Cyan
  "#22c55e", // 6: Green
  "#eab308", // 7: Yellow
  "#f97316", // 8: Orange
  "#ffffff"  // 9: Eraser
];

// Must match the REFERENCE_WIDTH in Board.jsx
const REFERENCE_WIDTH = 1000;

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

  // Tracks which player is currently picking a word (cleared once word is chosen)
  const [choosingPlayer, setChoosingPlayer] = useState(null);

  const canvasRef = useRef(null);
  const drawHistoryRef = useRef([]);

  const redrawHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const seg of drawHistoryRef.current) {
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = (seg.normalizedLW / REFERENCE_WIDTH) * canvas.width;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(seg.x0 * canvas.width, seg.y0 * canvas.height);
      ctx.lineTo(seg.x1 * canvas.width, seg.y1 * canvas.height);
      ctx.stroke();
    }
  }, []);

  const addDrawHistory = useCallback((seg) => {
    drawHistoryRef.current.push(seg);
  }, []);

  const clearCanvas = useCallback(() => {
    drawHistoryRef.current = [];
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  const registerCanvas = useCallback(
    (canvas) => {
      canvasRef.current = canvas?.current ?? null;
      if (canvasRef.current) {
        redrawHistory();
      }
    },
    [redrawHistory],
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
      if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
        socketRef.current.send(data);
      } else {
        if (data && typeof data === "object") {
          const needsUsername =
            "username" in data ||
            ["JOIN", "START", "GUESS", "CHOOSE_WORD"].includes(data.type);

          if (needsUsername) {
            const resolvedUsername =
              (data.username && data.username !== "null" && data.username !== "undefined"
                ? data.username
                : null) ||
              currentUser ||
              getStoredUsername();

            if (!resolvedUsername) {
              console.warn(
                "WebSocket message blocked: username is null/missing for message:",
                data
              );
              alert("Username not found. Please try again joining.");
              return;
            }

            data.username = resolvedUsername;
          }
        }
        socketRef.current.send(JSON.stringify(data));
      }
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
        playSound("doorOpen");
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
        setChoosingPlayer(data.username);
        playSound("gunSound");
        setGame((prev) => ({
          ...prev,
          is_started: true,
          current_player: data.username,
        }));
        break;
      }

      case "TIMER": {
        setTimeLeft(data.timeLeft);
        if (data.timeLeft <= 10 && data.timeLeft > 0) {
          playSound("paperCrumble");
        }
        break;
      }

      case "CHOOSE_WORD": {
        setMessages((prev) => [...prev, data]);
        setIsWordChosen(true);
        setChoosingPlayer(null);
        playSound("gunSound");
        if (data.username === currentUser) {
          setIsSent(true);
        }
        break;
      }

      case "DRAW": {
        const normalizedLW =
          data.normalizedLW ||
          (data.lineWidth ? Math.round((data.lineWidth / REFERENCE_WIDTH) * 1000) : 4);

        drawHistoryRef.current.push({
          x0: data.x0,
          y0: data.y0,
          x1: data.x1,
          y1: data.y1,
          color: data.color,
          normalizedLW,
        });

        const canvas = canvasRef.current;
        if (canvas) {
          const deNormalizedData = {
            ...data,
            x0: data.x0 * canvas.width,
            y0: data.y0 * canvas.height,
            x1: data.x1 * canvas.width,
            y1: data.y1 * canvas.height,
            lineWidth: (normalizedLW / REFERENCE_WIDTH) * canvas.width,
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
        playSound("tada");
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
        setChoosingPlayer(data.username);
        setMessages((prev) => [...prev, data]);
        playSound("gunSound");
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
        playSound("successWin");
        setGame((prev) => ({
          ...prev,
          current_player: null,
          is_ended: true,
        }));
        break;
      }

      case "LOST_CONNECTION": {
        playSound("doorClosing");
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
      
      case "LEFT_GAME": {
        playSound("doorClosing");
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
      const ws = new WebSocket(getWsUrl(game.id, token));
      ws.binaryType = "arraybuffer";
      ws.onopen = () => setIsConnected(true);
      ws.onclose = () => setIsConnected(false);
      ws.onerror = () => setIsConnected(false);

      ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          // Decode binary DRAW data
          const view = new DataView(event.data);
          const type = view.getUint8(0);

          if (type === 1) { // 1 = DRAW
            const x0_norm = view.getUint16(1) / 65535;
            const y0_norm = view.getUint16(3) / 65535;
            const x1_norm = view.getUint16(5) / 65535;
            const y1_norm = view.getUint16(7) / 65535;
            const colorIndex = view.getUint8(9);
            const normalizedLW = view.getUint8(10);

            const color = COLOR_PALETTE[colorIndex] || "#0f172a";

            drawHistoryRef.current.push({
              x0: x0_norm,
              y0: y0_norm,
              x1: x1_norm,
              y1: y1_norm,
              color,
              normalizedLW,
            });

            const canvas = canvasRef.current;
            if (canvas) {
              // Scale lineWidth from reference width to the receiver's actual canvas width
              const lineWidth = (normalizedLW / REFERENCE_WIDTH) * canvas.width;
              const deNormalizedData = {
                x0: x0_norm * canvas.width,
                y0: y0_norm * canvas.height,
                x1: x1_norm * canvas.width,
                y1: y1_norm * canvas.height,
                color,
                lineWidth,
              };
              drawSegment(deNormalizedData);
            }
          }
        } else {
          // JSON text frame
          try {
            const data = JSON.parse(event.data);
            handleIncomingMessage(data);
          } catch (e) {
            console.error("Failed to parse websocket message:", e);
          }
        }
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
        choosingPlayer,

        registerCanvas,
        drawSegment,
        clearCanvas,
        redrawHistory,
        addDrawHistory,

        sendMessage,
      }}
    >
      {children}
    </GameSocketContext.Provider>
  );
}
