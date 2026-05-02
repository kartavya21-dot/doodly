import { useEffect, useRef, useState } from "react";

export const useWebSocket = (url) => {
  const ws = useRef(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    ws.current.onclose = () => {
      console.log("Disconnected");
    };

    return () => {
      ws.current.close();
    };
  }, [url]);

  const sendMessage = (data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  };

  return { messages, sendMessage };
};