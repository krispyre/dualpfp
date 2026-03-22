import { useEffect, useRef, useState } from "react";
import type { DrawAction, Point } from "./drawAction.js";

const COL_DARK = "#313338";
const COL_LIGHT = "#FFFFFF";

type LayerProps = {
  drawHistory: DrawAction[];
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isLight: boolean;
  length: number;
  isEnabled: boolean;
  brushSize: number;
  isErase: boolean;
  shouldClear: boolean;
  shouldUndo: boolean;
  onClear: (isLight: boolean) => void;
  onUndo: () => void;
  addDrawHist: (isLight: boolean, newPath: Point[]) => void;
};

const Layer = ({
  drawHistory,
  canvasRef,
  isLight,
  length,
  isEnabled,
  brushSize,
  isErase,
  shouldClear,
  shouldUndo,
  onClear,
  onUndo,
  addDrawHist,
}: LayerProps) => {
  const BRUSH_COL = isLight ? COL_DARK : COL_LIGHT;
  const ctxRef = useRef(null);
  const [actualLength, setActualLength] = useState(length);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [curPath, setCurPath] = useState([]);
  //console.log("im lightmode", isLight);

  function drawUnSmoothed(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing || !ctxRef.current || !isEnabled) return;

    const ctx: CanvasRenderingContext2D = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(curPath[-1].x, curPath[-1].y);
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  }

  function draw(isRefreshing: boolean, points: Point[], f = 0.3, t = 1) {
    // todo remove the isRefreshing thing later

    //i stole this smoothing thing from perplexity idc
    // console.log(isRefreshing, isDrawing, !!ctxRef.current, isEnabled);
    // all of these must satisfy
    if (!(ctxRef.current && isEnabled)) return;
    //either one must satisfy
    if (!(isRefreshing || isDrawing)) return;

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
    // console.log("stroke");
    ctx.stroke();
  }

  function refresh(customData = null) {
    // console.warn(!!canvasRef, !!ctxRef.current);
    if (!canvasRef || !ctxRef.current) return;
    const ctx: CanvasRenderingContext2D = ctxRef.current;
    const steps = customData || drawHistory;
    console.group("refresh using", steps);

    clearLayer();

    for (const step of steps) {
      if (step.isLight == isLight) {
        switch (step.action) {
          case "clear":
            console.log("clear layer");
            clearLayer();
            break;
          case "draw":
            if (step.isEraser) {
              ctx.strokeStyle = "rgba(0,0,0,1)";
              ctx.globalCompositeOperation = "destination-out"; //Uh idk it kinda worked lol
            } else {
              ctx.strokeStyle = BRUSH_COL;
              ctx.globalCompositeOperation = "source-over";
            }
            ctx.lineWidth = step.brushSize;
            console.log("draw", step.path);
            draw(true, step.path);
            break;
          case "switch":
            console.log("switch is not my problem");
            break;
          default:
            console.error("unknown step", step.action);
        }
      }
      ditherClear(isLight);
    }

    //restore brush sizes
    ctx.lineWidth = brushSize;
    if (isErase) {
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.globalCompositeOperation = "destination-out"; //Uh idk it kinda worked lol
    } else {
      ctx.strokeStyle = BRUSH_COL;
      ctx.globalCompositeOperation = "source-over";
    }

    console.groupEnd();
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
        data[i + 3] = data[i + 3] < 128 ? 0 : 255;

        if ((x + y) % 2 == evens) {
          data[i + 3] = 0;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
    // console.log("dither clear");
  }

  function clearLayer() {
    if (!canvasRef || !ctxRef.current) return;
    const ctx: CanvasRenderingContext2D = ctxRef.current;
    ctx.clearRect(0, 0, length, length);
  }

  const handleClick = (e: React.PointerEvent<HTMLCanvasElement>) => {
    //toodoo doesnot work
    setIsDrawing(true);
    setCurPath([{ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }]);
    drawUnSmoothed(e);
    setIsDrawing(false);
    setCurPath([]);
  };

  const handlePointerUp = () => {
    // console.warn(e.nativeEvent.target); // doesnt fire on button clicks
    setIsDrawing(false);
    addDrawHist(isLight, curPath);
    setCurPath([]);

    // console.log("canvas: mouseup");
  };

  const handlePointerDown = (e) => {
    setIsDrawing(true);
    const x = (e.nativeEvent.offsetX / actualLength) * length;
    const y = (e.nativeEvent.offsetY / actualLength) * length;
    setCurPath([{ x, y }]);

    // console.log("canvas: mousedown");
  };

  const handlePointerMove = (e) => {
    setCurPath((prev) => {
      const x = (e.nativeEvent.offsetX / actualLength) * length;
      const y = (e.nativeEvent.offsetY / actualLength) * length;
      return [...prev, { x, y }];
    });
    if (e.buttons == 1 || e.pointerType == "touch") {
      draw(false, curPath);
      // console.log(curPath);
    }

    setLastX(e.nativeEvent.offsetX);
    setLastY(e.nativeEvent.offsetY);
    // console.log("canvas: mouse move");
  };

  const handlePointerEnter = (e) => {
    if (e.buttons == 1 || e.pointerType == "touch") {
      setIsDrawing(true);
      setLastX(e.nativeEvent.offsetX);
      setLastY(e.nativeEvent.offsetY);
    } else {
      setIsDrawing(false);
    }
  };
  const handlePointerLeave = () => {
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
    // console.warn("change erase to", isErase);
  }, [isErase]);

  //change pen size
  useEffect(() => {
    if (!canvasRef.current || !ctxRef.current) return;
    const ctx: CanvasRenderingContext2D = ctxRef.current;
    //eraser size is updated in brushSize
    ctx.lineWidth = brushSize;
    // console.log("change brush size to", brushSize);
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
      clearLayer();
      //fire event
      onClear(isLight);
    }
  }, [shouldClear]);

  //undo+redo
  useEffect(() => {
    if (shouldUndo) {
      refresh();
      onUndo();
    }
  }, [drawHistory]);
  async function loadData() {
    const res = await fetch("./dhexample1.json");
    if (!res.ok) throw new Error("Network error: " + res.status);
    const data = await res.json(); // parsed JS value
    console.log(data);

    refresh(data);
  }
  //init
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isEnabled) return;
    const ctx = canvas.getContext("2d")!;
    ctxRef.current = canvas.getContext("2d")!; // Store for draw()

    setActualLength(() => {
      const owo = canvas.getBoundingClientRect().width;
      return owo;
    });

    ctx.imageSmoothingEnabled = false;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = BRUSH_COL;

    // loadData();
  }, [canvasRef, isEnabled]);

  return (
    <canvas
      ref={canvasRef}
      width={length}
      height={length}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
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
