import { useEffect, useRef, useState } from "react";
import type { Point } from "./drawAction.js";

const COL_DARK = "#313338";
const COL_LIGHT = "#FFFFFF";

type LayerProps = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isLight: boolean;
  length: number;
  isEnabled: boolean;
  brushSize: number;
  isErase: boolean;
  shouldClear: boolean;
  shouldUndo: boolean;
  onClear: (isLight: boolean) => void;
  onUndo: (isLight: boolean) => void;
  addDrawHist: (isLight: boolean, newPath: Point[]) => void;
};

const Layer = ({
  canvasRef,
  isLight,
  length,
  isEnabled,
  brushSize,
  isErase,
  shouldClear,
  onClear,
  onUndo,
  addDrawHist,
}: LayerProps) => {
  const BRUSH_COL = isLight ? COL_DARK : COL_LIGHT;
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [curPath, setCurPath] = useState([]);

  //console.log("im lightmode", isLight);

  function drawUnSmoothed(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing || !ctxRef.current || !isEnabled) return;

    const ctx: CanvasRenderingContext2D = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  }

  function draw(points, f = 0.3, t = 1) {
    //i stole this smoothing thing from perplexity idc
    if (!isDrawing || !ctxRef.current || !isEnabled) return;

    const ctx: CanvasRenderingContext2D = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    let preP = points[0],
      dx1 = 0,
      dy1 = 0;
    for (let i = 1; i < points.length; i++) {
      const curP = points[i];
      const nexP = points[i + 1] || {
        x: curP.x + (curP.x - preP.x),
        y: curP.y,
      }; // Extrapolate end

      // Safe slope: avoid div-by-zero
      const dx = nexP.x - preP.x;
      const safeM = dx !== 0 ? (nexP.y - preP.y) / dx : 0; // Default horizontal if vertical

      const dx2 = (nexP.x - curP.x) * -f;
      const dy2 = dx2 * safeM * t;
      ctx.bezierCurveTo(
        preP.x - dx1,
        preP.y - dy1,
        curP.x + dx2,
        curP.y + dy2,
        curP.x,
        curP.y,
      );
      dx1 = dx2;
      dy1 = dy2;
      preP = curP;
    }
    ctx.stroke();
  }

  function ditherClear(isLight: boolean) {
    if (!canvasRef || !ctxRef.current) return;
    //called on release
    const evens = isLight ? 0 : 1; //even pixels erased for light mode
    const ctx: CanvasRenderingContext2D = ctxRef.current;
    const imgData = ctx.getImageData(0, 0, length, length);
    const data = imgData.data;

    for (let y = 0; y < length; y++) {
      for (let x = 0; x < length; x++) {
        const i = 4 * (x + length * y);

        if ((x + y) % 2 == evens) {
          data[i + 3] = 0;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
    console.log("dither clear");
  }

  function clearLayer(isLight: boolean) {
    if (!canvasRef || !ctxRef.current) return;
    const ctx: CanvasRenderingContext2D = ctxRef.current;
    ctx.clearRect(0, 0, length, length);
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    //toodoo doesnot work
    setIsDrawing(true);
    setCurPath([{ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }]);
    drawUnSmoothed(e);
    setIsDrawing(false);
    setCurPath([]);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(false);
    addDrawHist(isLight, curPath);
    setCurPath([]);
    // console.log("canvas: mouseup");
  };

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    setCurPath([{ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }]);

    // console.log("canvas: mousedown");
  };

  const handleMouseMove = (e) => {
    setCurPath((prev) => [
      ...prev,
      { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY },
    ]);
    if (e.buttons == 1) {
      draw(curPath);
      // console.log(curPath);
    }

    setLastX(e.nativeEvent.offsetX);
    setLastY(e.nativeEvent.offsetY);
    // console.log("canvas: mouse move");
  };

  const handleMouseEnter = (e) => {
    if (e.buttons == 1) {
      setIsDrawing(true);
      setLastX(e.nativeEvent.offsetX);
      setLastY(e.nativeEvent.offsetY);
    } else {
      setIsDrawing(false);
    }
  };
  const handleMouseLeave = (e) => {
    setIsDrawing(false);
    setCurPath([]);
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

  //dither clear
  useEffect(() => {
    if (!isDrawing) {
      ditherClear(isLight);
    }
  }, [isDrawing]);

  //clear layer
  useEffect(() => {
    if (shouldClear) {
      clearLayer(isLight);
      //fire event
      onClear(isLight);
    }
  }, [shouldClear]);

  //init
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isEnabled) return;
    const ctx = canvas.getContext("2d")!;
    ctxRef.current = canvas.getContext("2d")!; // Store for draw()

    ctx.imageSmoothingEnabled = false;
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
