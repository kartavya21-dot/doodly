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
    <div className="w-full h-[520px] neon-card rounded-3xl p-4 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col justify-between gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Guess & Chat Arena
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
          LIVE
        </span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 font-sans text-xs scroll-smooth custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 italic text-center p-4">
            <Sparkles className="w-6 h-6 text-slate-600 mb-2 animate-pulse" />
            <span>Type your guess below! Guesses appear here in real-time.</span>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg?.username === username;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-2xl border transition-all ${
                  isMe
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-200 ml-4"
                    : "bg-slate-900/80 border-slate-800 text-slate-200 mr-4"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[11px]">
                  <User className="w-3 h-3 text-slate-400" />
                  <strong className={isMe ? "text-cyan-300" : "text-purple-400"}>
                    {msg?.username || "Player"}
                  </strong>
                </div>
                <p className="text-xs break-words font-medium pl-4">{msg?.message}</p>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Form */}
      <div className="flex gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          value={chat}
          onChange={(e) => setChat(e.target.value)}
          placeholder="Type your guess..."
          className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all text-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendChat();
            }
          }}
        />

        <button
          onClick={sendChat}
          className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
          title="Send Guess"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Next Round Button (Admin Only) */}
      {room?.admin_username === username && (
        <button
          onClick={nextRound}
          className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Skip to Next Round</span>
        </button>
      )}
    </div>
  );
};

export default ChatArea;
