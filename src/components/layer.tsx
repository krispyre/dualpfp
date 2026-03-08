import { useEffect, useRef, useState } from "react";

type LayerProps = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isLight: boolean;
  length: number;
  isEnabled: boolean;
};
const Layer = ({ canvasRef, isLight, length, isEnabled }: LayerProps) => {
  const ctxRef = useRef(null);
  const [mode, setMode] = useState(isLight ? 1 : 0);
  const [color, setColor] = useState("#FFFFFF");
  const [isSelected, setIsSelected] = useState(isEnabled);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);

  console.log("my mode is", mode);

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing || !ctxRef.current) return;

    console.log("draw", lastX, lastY, e);

    const ctx: CanvasRenderingContext2D = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();

    setLastX(e.nativeEvent.offsetX);
    setLastY(e.nativeEvent.offsetY);
  }

  const handleClick = (e: MouseEvent) => {
    setIsDrawing(true);
    draw(e);
    setIsDrawing(false);
  };

  const handleMouseUp = (e: MouseEvent) => {
    setIsDrawing(false);
    // console.log("canvas: mouseup");
  };

  const handleMouseDown = (e: MouseEvent) => {
    setIsDrawing(true);
    // console.log("canvas: mousedown");
  };

  const handleMouseMove = (e: MouseEvent) => {
    draw(e);
    // console.log("canvas: mouse move");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isEnabled) return;
    const ctx = canvas.getContext("2d")!;
    ctxRef.current = canvas.getContext("2d")!; // Store for draw()

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
  }, [canvasRef, isEnabled]);

  return (
    <canvas
      ref={canvasRef}
      width={length}
      height={length}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      ur js is disabled
    </canvas>
  );
};

export default Layer;
