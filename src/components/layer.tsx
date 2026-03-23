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

  function draw(isRefreshing: boolean, points: Point[]) {
    // todo remove the isRefreshing thing later if possible
    // if not refreshing it is added by a new stroke, not redrawn from undos

    //i stole this smoothing thing from gemini idc

    if (points.length < 2) return;
    const ctx = ctxRef.current;

    // all of these must satisfy
    if (!(ctx && isEnabled)) return;
    //either one must satisfy
    if (!(isRefreshing || isDrawing)) return;
    // 1. Important: Use floor/round coordinates to snap to the pixel grid
    const drawPixel = (x, y) => {
      // Rounding is what prevents the semi-transparency
      ctx.fillRect(Math.floor(x), Math.floor(y), brushSize, brushSize);
    };

    for (let i = 0; i < points.length - 1; i++) {
      const p0 =
        i === 0
          ? points[0]
          : {
              x: (points[i - 1].x + points[i].x) / 2,
              y: (points[i - 1].y + points[i].y) / 2,
            };
      const p1 = points[i];
      const p2 = {
        x: (points[i].x + points[i + 1].x) / 2,
        y: (points[i].y + points[i + 1].y) / 2,
      };

      // 2. Step through the curve (t goes from 0 to 1)
      // We increase 't' by a small amount based on distance to ensure no gaps
      const distance = Math.hypot(p2.x - p0.x, p2.y - p0.y);
      const steps = Math.max(distance, 10); // Adjust density based on length

      for (let t = 0; t <= 1; t += 1 / steps) {
        // Quadratic Bezier formula:
        // B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
        const x = (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t ** 2 * p2.x;
        const y = (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t ** 2 * p2.y;

        drawPixel(x, y);
      }
    }
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
              ctx.fillStyle = "rgba(0,0,0,1)";
              ctx.globalCompositeOperation = "destination-out"; //Uh idk it kinda worked lol
            } else {
              ctx.strokeStyle = BRUSH_COL;
              ctx.fillStyle = BRUSH_COL;
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
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.globalCompositeOperation = "destination-out"; //Uh idk it kinda worked lol
    } else {
      ctx.strokeStyle = BRUSH_COL;
      ctx.fillStyle = BRUSH_COL;

      ctx.globalCompositeOperation = "source-over";
    }

    console.groupEnd();
  }

  function ditherClear(isLight: boolean) {
    if (!canvasRef || !ctxRef.current) return;
    console.warn("di clear");
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
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.globalCompositeOperation = "destination-out"; //Uh idk it kinda worked lol
    } else {
      ctx.strokeStyle = BRUSH_COL;
      ctx.fillStyle = BRUSH_COL;
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
    ctx.lineCap = "butt";
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = BRUSH_COL;
    ctx.fillStyle = BRUSH_COL;

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
