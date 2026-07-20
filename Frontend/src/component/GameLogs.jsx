import React, { useEffect, useRef } from "react";
import { useGameSocket } from "../context/GameSocketContextProvider";
import { Terminal, Activity, Radio, Sparkles } from "lucide-react";

const TYPE_STYLES = {
  JOIN: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  LEAVE: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  MOVE: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  DRAW: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  GUESS: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  CHOOSE_WORD: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  WIN: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  NEXT_ROUND: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  GAME_END: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  DEFAULT: "bg-slate-800 text-slate-300 border-slate-700",
};

export default function GameLogs() {
  const containerRef = useRef(null);
  const { logs, isConnected } = useGameSocket();

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full neon-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Live Socket Event Feed
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Radio className={`w-3.5 h-3.5 ${isConnected ? "text-emerald-400 animate-pulse" : "text-rose-500"}`} />
          <span className="text-[11px] font-mono text-slate-400">
            {isConnected ? "CONNECTED" : "DISCONNECTED"}
          </span>
        </div>
      </div>

      {/* Log Stream Area */}
      <div
        ref={containerRef}
        className="h-44 p-4 overflow-y-auto font-mono text-[11px] space-y-2 scroll-smooth custom-scrollbar bg-slate-950/60"
      >
        {logs?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 italic">
            <Activity className="w-5 h-5 text-slate-700 mb-1 animate-pulse" />
            <span>Listening for real-time WebSocket events...</span>
          </div>
        ) : (
          logs?.map((log, index) => {
            const badgeStyle = TYPE_STYLES[log.type] || TYPE_STYLES.DEFAULT;
            const timeString = log.timestamp
              ? new Date(log.timestamp).toLocaleTimeString([], { hour12: false })
              : new Date().toLocaleTimeString([], { hour12: false });

            return (
              <div
                key={log.id || index}
                className="flex items-start gap-2.5 py-1 px-2 rounded-lg hover:bg-slate-900/80 transition-colors group"
              >
                {/* Timestamp */}
                <span className="text-slate-500 select-none pt-0.5 font-light shrink-0">
                  [{timeString}]
                </span>

                {/* Event Type Tag */}
                <span
                  className={`px-2 py-0.5 text-[9px] font-extrabold rounded border uppercase tracking-wider shrink-0 ${badgeStyle}`}
                >
                  {log?.type}
                </span>

                {/* Log Message Content */}
                <span className="text-slate-300 break-all leading-relaxed">
                  {log.username && (
                    <strong className="text-cyan-300 font-bold mr-1.5">
                      {log.username}:
                    </strong>
                  )}
                  <span>
                    {log?.message
                      ? log.message.replace(log.username || "", "").trim()
                      : JSON.stringify(log)}
                  </span>
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}