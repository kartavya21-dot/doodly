import React, { useEffect, useState } from "react";
import { useGameSocket } from "../context/GameSocketContextProvider";
import { useUser } from "../context/UserContextProvider";

const ChatArea = ({game, setGame}) => {
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState("");
  const { username } = useUser();
  const { socket, isConnected } = useGameSocket();

  useEffect(() => {
    const socketInstance = socket.current;
    if (!socketInstance) return;

    const handleIncomingMessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "GUESS" || data.type === "CHOOSE_WORD" || data.type === "WIN" || data.type === "NEXT_ROUND") {
        setMessages((prev) => [...prev, data]);
        if(data.type === "NEXT_ROUND") {
          setGame((prev) => ({
            ...prev,
            current_player: data.next_player
          }))
        }
      }
    };

    socketInstance.addEventListener("message", handleIncomingMessage);

    return () => {
      socketInstance.removeEventListener("message", handleIncomingMessage);
    };
  }, [socket]);

  // Outgoing message
  const sendMessage = (payload) => {
    const socketInstance = socket.current;

    if (!socketInstance || !isConnected) {
      console.log("Socket not ready:", socketInstance?.readyState);
      return;
    }

    socketInstance.send(JSON.stringify(payload));
  };

  const sendChat = () => {
    if(!chat.trim()) return;
    const payload = {
      type: "GUESS",
      message: chat.trim(),
      username: username,
    };
    sendMessage(payload);
    setChat("");
  }

  const nextRound = () => {
    const payload = {
      type: "NEXT_ROUND",
    };
    sendMessage(payload);
  }

  return (
    <div
      style={{
        width: "300px",
        height: "500px",
        border: "1px solid gray",
        display: "flex",
        flexDirection: "column",
        padding: "10px",
        gap: "10px",
      }}
    >
      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          border: "1px solid lightgray",
          padding: "10px",
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: "8px" }}>
            <strong>{msg?.username || "User"}:</strong> {msg.message}
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={chat}
          onChange={(e) => setChat(e.target.value)}
          placeholder="Type message..."
          style={{
            flex: 1,
            padding: "8px",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendChat();
            }
          }}
        />

        <button onClick={sendChat}>Send</button>
      </div>
      {game.current_player === username && <button style={{
        border: "1px solid black",
        backgroundColor: "blue"
      }} onClick={nextRound}>
        Next Round
      </button>}
    </div>
  );
};

export default ChatArea;