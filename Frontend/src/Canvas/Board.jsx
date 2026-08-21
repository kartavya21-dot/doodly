import { useEffect, useRef } from "react";
import { useGameSocket } from "../context/GameSocketContextProvider";

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

export default function Board({ color = "#0f172a", lineWidth = 4 }) {
  const canvasRef = useRef(null);
  const { registerCanvas, sendMessage, drawSegment, userPlaying, isSent, game } = useGameSocket();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    registerCanvas(canvasRef);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      registerCanvas(null);
    };
  }, [registerCanvas]);

  const isDrawing = useRef(false);
  const prevPoint = useRef(null);

  const canDraw = Boolean(userPlaying && isSent && !game?.is_ended);

  const getCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    if (!canDraw) return;
    isDrawing.current = true;
    prevPoint.current = getCoords(e);
  };

  const lastFrame = useRef(0);

  const handleMouseMove = (e) => {
    if (!isDrawing.current || !canDraw) return;

    const now = performance.now();

    // 60 FPS throttle
    if (now - lastFrame.current < 25) return;
    lastFrame.current = now;

    const curr = getCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const localDrawData = {
      type: "DRAW",
      x0: prevPoint.current.x,
      y0: prevPoint.current.y,
      x1: curr.x,
      y1: curr.y,
      color: color,
      lineWidth: lineWidth,
    };

    const colorIndex = COLOR_PALETTE.indexOf(color);
    const validColorIndex = colorIndex >= 0 ? colorIndex : 0;

    const x0_norm = prevPoint.current.x / canvas.width;
    const y0_norm = prevPoint.current.y / canvas.height;
    const x1_norm = curr.x / canvas.width;
    const y1_norm = curr.y / canvas.height;

    const buffer = new ArrayBuffer(11);
    const view = new DataView(buffer);

    // Byte 0: Type = 1 (DRAW)
    view.setUint8(0, 1);
    // Bytes 1-2: x0 (mapped to 0-65535)
    view.setUint16(1, Math.round(x0_norm * 65535));
    // Bytes 3-4: y0
    view.setUint16(3, Math.round(y0_norm * 65535));
    // Bytes 5-6: x1
    view.setUint16(5, Math.round(x1_norm * 65535));
    // Bytes 7-8: y1
    view.setUint16(7, Math.round(y1_norm * 65535));
    // Byte 9: Color Index
    view.setUint8(9, validColorIndex);
    // Byte 10: Line Width
    view.setUint8(10, lineWidth);

    // Draw locally first using absolute coordinates
    drawSegment(localDrawData);
    // Broadcast binary drawing coordinates
    sendMessage(buffer);

    prevPoint.current = curr;
  };

  const getTouchCoords = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  const handleTouchStart = (e) => {
    if (!canDraw) return;
    isDrawing.current = true;
    prevPoint.current = getTouchCoords(e);
  };

  const handleTouchMove = (e) => {
    if (!isDrawing.current || !canDraw) return;
    
    // Prevent scrolling when drawing on canvas
    if (e.cancelable) e.preventDefault();

    const now = performance.now();

    // 60 FPS throttle
    if (now - lastFrame.current < 25) return;
    lastFrame.current = now;

    const curr = getTouchCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const localDrawData = {
      type: "DRAW",
      x0: prevPoint.current.x,
      y0: prevPoint.current.y,
      x1: curr.x,
      y1: curr.y,
      color: color,
      lineWidth: lineWidth,
    };

    const colorIndex = COLOR_PALETTE.indexOf(color);
    const validColorIndex = colorIndex >= 0 ? colorIndex : 0;

    const x0_norm = prevPoint.current.x / canvas.width;
    const y0_norm = prevPoint.current.y / canvas.height;
    const x1_norm = curr.x / canvas.width;
    const y1_norm = curr.y / canvas.height;

    const buffer = new ArrayBuffer(11);
    const view = new DataView(buffer);

    // Byte 0: Type = 1 (DRAW)
    view.setUint8(0, 1);
    // Bytes 1-2: x0 (mapped to 0-65535)
    view.setUint16(1, Math.round(x0_norm * 65535));
    // Bytes 3-4: y0
    view.setUint16(3, Math.round(y0_norm * 65535));
    // Bytes 5-6: x1
    view.setUint16(5, Math.round(x1_norm * 65535));
    // Bytes 7-8: y1
    view.setUint16(7, Math.round(y1_norm * 65535));
    // Byte 9: Color Index
    view.setUint8(9, validColorIndex);
    // Byte 10: Line Width
    view.setUint8(10, lineWidth);

    // Draw locally first using absolute coordinates
    drawSegment(localDrawData);
    // Broadcast binary drawing coordinates
    sendMessage(buffer);

    prevPoint.current = curr;
  };

  const handleTouchEnd = () => {
    isDrawing.current = false;
    prevPoint.current = null;
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    prevPoint.current = null;
  };

  // Bind touch events manually to support non-passive listener execution
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canDraw) return;

    // Direct listener binding allows e.preventDefault() to work on touchmove in modern mobile browsers
    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [canDraw, color, lineWidth]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={canDraw ? handleMouseDown : () => {}}
      onMouseMove={canDraw ? handleMouseMove : () => {}}
      onMouseUp={canDraw ? handleMouseUp : () => {}}
      onMouseLeave={canDraw ? handleMouseUp : () => {}}
      className={`w-full h-full block bg-white rounded-xl ${
        canDraw ? "cursor-crosshair" : "cursor-not-allowed"
      }`}
    />
  );
}
