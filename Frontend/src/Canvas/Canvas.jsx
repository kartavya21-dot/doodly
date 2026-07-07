import { useRef, useEffect, useState } from "react";
export default function Canvas({ isPencil }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const prevPoint = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // 🎨 Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 3;
    context.strokeStyle = isPencil ? "white" : "black";

    contextRef.current = context;
  }, []);

  // ✏️ Update color
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = isPencil ? "white" : "black";
    }
  }, [isPencil]);

  // 🌐 Handle incoming strokes
  const handleIncomingDraw = (data) => {
    const { x, y, prevX, prevY, color } = data;

    const ctx = contextRef.current;
    if (!ctx) return;

    ctx.strokeStyle = color;

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // 🖊️ Start drawing
  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;

    prevPoint.current = { x: offsetX, y: offsetY };
    setIsDrawing(true);
  };

  // ✏️ Draw
  const draw = (e) => {
    if (!isDrawing || !prevPoint.current) return;

    const { offsetX, offsetY } = e.nativeEvent;

    const currentPoint = { x: offsetX, y: offsetY };
    const ctx = contextRef.current;

    // draw locally
    ctx.beginPath();
    ctx.moveTo(prevPoint.current.x, prevPoint.current.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();

    // send to server
    sendMessage({
      x: currentPoint.x,
      y: currentPoint.y,
      prevX: prevPoint.current.x,
      prevY: prevPoint.current.y,
      color: isPencil ? "white" : "black",
    });

    prevPoint.current = currentPoint;
  };

  // 🛑 Stop drawing
  const stopDrawing = () => {
    setIsDrawing(false);
    prevPoint.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      style={{ cursor: "crosshair", backgroundColor: "black" }}
    />
  );
}