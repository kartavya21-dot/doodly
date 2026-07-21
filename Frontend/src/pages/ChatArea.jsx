import React, { useState, useEffect, useRef } from "react";
import { useGameSocket } from "../context/GameSocketContextProvider";
import { useUser } from "../context/UserContextProvider";
import { MessageSquare, Send, FastForward, Sparkles, User } from "lucide-react";

const ChatArea = ({ room }) => {
  const { messages, sendMessage } = useGameSocket();
  const [chat, setChat] = useState("");
  const { username } = useUser();
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendChat = () => {
    if (!chat.trim()) return;
    const payload = {
      type: "GUESS",
      message: chat.trim(),
      username: username,
    };
    sendMessage(payload);
    setChat("");
  };

  const nextRound = () => {
    const payload = {
      type: "NEXT_ROUND",
    };
    sendMessage(payload);
  };

  return (
    <div className="w-full h-full min-h-[440px] max-h-[500px] neon-card rounded-3xl p-4 border border-slate-200 bg-white/95 shadow-lg backdrop-blur-xl flex flex-col justify-between gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
            Live Chat & Guesses
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
          CHAT ACTIVE
        </span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 font-sans text-xs scroll-smooth custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 italic text-center p-4">
            <Sparkles className="w-6 h-6 text-slate-300 mb-2 animate-pulse" />
            <span>Type your guess or message below! Messages appear here in real-time.</span>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg?.username === username;
            return (
              <div
                key={idx}
                className={`p-2 rounded-2xl border transition-all ${
                  isMe
                    ? "bg-blue-50 border-blue-200 text-blue-950 ml-4 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-800 mr-4"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 text-[10px]">
                  <User className="w-3 h-3 text-slate-400" />
                  <strong className={isMe ? "text-blue-700 font-bold" : "text-purple-700 font-bold"}>
                    {msg?.username || "Player"}
                  </strong>
                </div>
                <p className="text-xs break-words font-medium pl-3">{msg?.message}</p>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Form */}
      <div className="flex gap-2 pt-2 border-t border-slate-200">
        <input
          type="text"
          value={chat}
          onChange={(e) => setChat(e.target.value)}
          placeholder="Type guess or message..."
          className="flex-1 px-3.5 py-2 rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-xs font-medium"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendChat();
            }
          }}
        />

        <button
          onClick={sendChat}
          className="p-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Next Round Button (Admin Only) */}
      {room?.admin_username === username && (
        <button
          onClick={nextRound}
          className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Skip to Next Round</span>
        </button>
      )}
    </div>
  );
};

export default ChatArea;
