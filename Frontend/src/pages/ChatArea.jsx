import React, { useEffect, useState } from "react";
import { useGameSocket } from "../context/GameSocketContextProvider";
import { useUser } from "../context/UserContextProvider";

const ChatArea = () => {
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState("");
  const { username } = useUser();
  const { socket, isConnected } = useGameSocket();

  useEffect(() => {
    const socketInstance = socket.current;
    if (!socketInstance) return;

    const handleIncomingMessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "GUESS" || data.type === "CHOOSE_WORD" || data.type === "WIN") {
        setMessages((prev) => [...prev, data]);
      }
    };

    socketInstance.addEventListener("message", handleIncomingMessage);

    return () => {
      socketInstance.removeEventListener("message", handleIncomingMessage);
    };
  }, [socket]);

  // Outgoing message
  const sendMessage = () => {
    const socketInstance = socket.current;

    if (!socketInstance || !isConnected) {
      console.log("Socket not ready:", socketInstance?.readyState);
      return;
    }

    if (!chat.trim()) return;

    const payload = {
      type: "GUESS",
      message: chat.trim(),
      username: username,
    };

    socketInstance.send(JSON.stringify(payload));

    setChat("");
  };

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
              sendMessage();
            }
          }}
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatArea;