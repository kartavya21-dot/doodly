import { useEffect, useRef } from "react";
import { useGameSocket } from "../context/GameSocketContextProvider";
import { useUser } from "../context/UserContextProvider";

export default function Board({ color = "#0f172a", lineWidth = 4 }) {
  const canvasRef = useRef(null);
  const { registerCanvas, sendMessage, drawSegment, userPlaying } = useGameSocket();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;

    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    registerCanvas(canvasRef);

    return () => registerCanvas(null);
  }, [registerCanvas]);

  const isDrawing = useRef(false);
  const prevPoint = useRef(null);

  const getCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    prevPoint.current = getCoords(e);
  };

  const lastFrame = useRef(0);

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;

    const now = performance.now();

    // 60 FPS throttle
    if (now - lastFrame.current < 25) return;
    lastFrame.current = now;

    const curr = getCoords(e);

    const drawData = {
      type: "DRAW",
      x0: prevPoint.current.x,
      y0: prevPoint.current.y,
      x1: curr.x,
      y1: curr.y,
      color: color,
      lineWidth: lineWidth,
    };

    // Draw locally first
    drawSegment(drawData);
    sendMessage(drawData);

    prevPoint.current = curr;
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    prevPoint.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={userPlaying ? handleMouseDown : () => {}}
      onMouseMove={userPlaying ? handleMouseMove : () => {}}
      onMouseUp={userPlaying ? handleMouseUp : () => {}}
      onMouseLeave={userPlaying ? handleMouseUp : () => {}}
      className={`w-full h-full block bg-white rounded-xl ${
        userPlaying ? "cursor-crosshair" : "cursor-not-allowed"
      }`}
    />
  );
}
