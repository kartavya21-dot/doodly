import { createContext, useContext, useRef, useEffect, useState } from "react";

const GameSocketContext = createContext(null);

export const useGameSocket = () => useContext(GameSocketContext);

export function GameSocketProvider({ gameId, children }) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!socketRef.current) {
      const ws = new WebSocket(`ws://localhost:8000/ws?token=${token}&game_id=${gameId}`);

      ws.onopen = () => setIsConnected(true);
      ws.onclose = () => setIsConnected(false);
      ws.onerror = () => setIsConnected(false);

      socketRef.current = ws;
    }
  
    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [gameId]);

  return (
    <GameSocketContext.Provider value={{socket: socketRef, isConnected}}>
      {children}
    </GameSocketContext.Provider>
  );
}