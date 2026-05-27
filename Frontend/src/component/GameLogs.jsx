import React, { useEffect, useRef } from 'react';

// Example types for your logs — add more as your WebSocket expands
const TYPE_STYLES = {
  JOIN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  LEAVE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  MOVE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CHAT: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  DEFAULT: 'bg-zinc-800 text-zinc-300 border-zinc-700'
};

export default function GameLogs({ logs = [] }) {
  const containerRef = useRef(null);

  // Auto-scrolls to the bottom of the log window whenever a new event arrives
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full max-w-xl mx-auto overflow-hidden border bg-zinc-950 border-zinc-800 rounded-xl shadow-2xl">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/40" />
            <span className="w-3 h-3 rounded-full bg-amber-500/40" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/40" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono ml-2">
            Live Feed Feed
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium font-mono text-zinc-500">WS Connected</span>
        </div>
      </div>

      {/* Log Stream Area */}
      <div 
        ref={containerRef}
        className="h-64 p-4 overflow-y-auto font-mono text-xs space-y-2.5 scroll-smooth custom-scrollbar"
      >
        {logs?.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-600 italic">
            Waiting for connection events...
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
                className="flex items-start gap-3 py-1 px-2 rounded hover:bg-zinc-900/50 transition-colors group"
              >
                {/* Timestamp */}
                <span className="text-zinc-600 select-none pt-0.5 font-light">
                  [{timeString}]
                </span>

                {/* Event Type Tag */}
                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wide shrink-0 ${badgeStyle}`}>
                  {log?.type}
                </span>

                {/* Log Message Content */}
                <span className="text-zinc-300 break-all leading-relaxed">
                  <span className="text-zinc-400 font-medium">{log.username}</span>
                  {log?.message?.replace(log.username, '')}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}