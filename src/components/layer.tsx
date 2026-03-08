import { useEffect, useRef, useState } from "react";
const COL_DARK = "#313338";
const COL_LIGHT = "#FFFFFF";

type LayerProps = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isLight: boolean;
  length: number;
  isEnabled: boolean;
  brushSize: number;
  isErase: boolean;
};

const Layer = ({
  canvasRef,
  isLight,
  length,
  isEnabled,
  brushSize,
  isErase,
}: LayerProps) => {
  const BRUSH_COL = isLight ? COL_DARK : COL_LIGHT;
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);

  const [z, setZ] = useState(isEnabled ? 1 : 0);

  //console.log("im lightmode", isLight);

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing || !ctxRef.current || !isEnabled) return;

    // console.log("draw", lastX, lastY, e);

    const ctx: CanvasRenderingContext2D = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  }

  const handleClick = (e) => {
    setIsDrawing(true);
    draw(e);
    setIsDrawing(false);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(false);
    // console.log("canvas: mouseup");
  };

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    // console.log("canvas: mousedown");
  };

  const handleMouseMove = (e) => {
    draw(e);

    setLastX(e.nativeEvent.offsetX);
    setLastY(e.nativeEvent.offsetY);
    // console.log("canvas: mouse move");
  };

  //toggle pen/eraser
  useEffect(() => {
    if (!canvasRef || !ctxRef.current) return;
    const ctx: CanvasRenderingContext2D = ctxRef.current;
    if (isErase) {
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.globalCompositeOperation = "destination-out"; //Uh idk it kinda worked lol
    } else {
      ctx.strokeStyle = BRUSH_COL;
      ctx.globalCompositeOperation = "source-over";
    }
    console.warn("change erase to", isErase);
  }, [isErase]);

  //change pen size
  useEffect(() => {
    if (!canvasRef.current || !ctxRef.current) return;
    const ctx: CanvasRenderingContext2D = ctxRef.current;
    //eraser size is updated in brushSize
    ctx.lineWidth = brushSize;
    console.log("change brush size to", brushSize);
  }, [brushSize]);

  //change z index who's on top to be drawn

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isEnabled) return;
    const ctx = canvas.getContext("2d")!;
    ctxRef.current = canvas.getContext("2d")!; // Store for draw()

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = BRUSH_COL;
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
      style={{
        zIndex: isEnabled ? 2 : 1,
      }}
      id={isLight ? "li" : "da"}
    >
      ur js is disabled
    </canvas>
  );
};

export default Layer;
