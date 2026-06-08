import { useEffect, useRef, useState, useImperativeHandle } from "react";
import type { DrawAction, Point } from "./drawAction.js";

const COL_DARK = "#313338";
const COL_LIGHT = "#FFFFFF";

export type LayerHandle = {
  undo: () => void;
  clear: () => void;
  setEraser: (erase: boolean) => void;
  setBrushSize: (size: number) => void;
};

type LayerProps = {
  ref?: React.Ref<LayerHandle>;
  drawHistory: DrawAction[];
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isLight: boolean;
  length: number;
  isEnabled: boolean;
  brushSize: number;
  isErase: boolean;
  addDrawHist: (isLight: boolean, newPath: Point[]) => void;
};

const Layer = ({
  ref,
  drawHistory,
  canvasRef,
  isLight,
  length,
  isEnabled,
  brushSize,
  isErase,
  addDrawHist,
}: LayerProps) => {
  const brush_col = isLight ? COL_DARK : COL_LIGHT;
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [actualLength, setActualLength] = useState(length);
  const [isDrawing, setIsDrawing] = useState(false);
  const [curPath, setCurPath] = useState<Point[]>([]);

  function draw(isRefreshing: boolean, points: Point[]) {
    if (points.length < 2) return;
    const ctx = ctxRef.current;
    if (!(ctx && isEnabled)) return;
    if (!(isRefreshing || isDrawing)) return;

    const drawPixel = (x: number, y: number) => {
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

      const distance = Math.hypot(p2.x - p0.x, p2.y - p0.y);
      const steps = Math.max(distance, 10);

      for (let t = 0; t <= 1; t += 1 / steps) {
        const x = (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t ** 2 * p2.x;
        const y = (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t ** 2 * p2.y;
        drawPixel(x, y);
      }
    }
  }

  function refresh(customData = null) {
    if (!canvasRef || !ctxRef.current) return;
    const ctx: CanvasRenderingContext2D = ctxRef.current;
    const steps = customData || drawHistory;

    clearLayer();

    for (const step of steps) {
      if (step.isLight == isLight) {
        switch (step.action) {
          case "clear":
            clearLayer();
            break;
          case "draw":
            if (step.isEraser) {
              ctx.strokeStyle = "rgba(0,0,0,1)";
              ctx.fillStyle = "rgba(0,0,0,1)";
              ctx.globalCompositeOperation = "destination-out";
            } else {
              ctx.strokeStyle = brush_col;
              ctx.fillStyle = brush_col;
              ctx.globalCompositeOperation = "source-over";
            }
            ctx.lineWidth = step.brushSize!;
            draw(true, step.path!);
            break;
          case "switch":
            break;
        }
      }
      ditherClear(isLight);
    }

    ctx.lineWidth = brushSize;
    if (isErase) {
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.strokeStyle = brush_col;
      ctx.fillStyle = brush_col;
      ctx.globalCompositeOperation = "source-over";
    }
  }

  function ditherClear(isLight: boolean) {
    if (!canvasRef || !ctxRef.current) return;
    const evens = isLight ? 0 : 1;
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
  }

  function clearLayer() {
    if (!canvasRef || !ctxRef.current) return;
    const ctx: CanvasRenderingContext2D = ctxRef.current;
    ctx.clearRect(0, 0, length, length);
  }

  useImperativeHandle(
    ref,
    () => ({
      undo() {
        refresh();
        ditherClear(isLight);
      },
      clear() {
        clearLayer();
        ditherClear(isLight);
      },
      setEraser(erase: boolean) {
        const ctx = ctxRef.current;
        if (!ctx) return;
        if (erase) {
          ctx.strokeStyle = "rgba(0,0,0,1)";
          ctx.fillStyle = "rgba(0,0,0,1)";
          ctx.globalCompositeOperation = "destination-out";
        } else {
          ctx.strokeStyle = brush_col;
          ctx.fillStyle = brush_col;
          ctx.globalCompositeOperation = "source-over";
        }
      },
      setBrushSize(size: number) {
        if (ctxRef.current) ctxRef.current.lineWidth = size;
      },
    }),
    [drawHistory, isLight, isErase, brushSize],
  );

  const handlePointerUp = (e) => {
    setIsDrawing(false);
    addDrawHist(isLight, curPath);
    const path = curPath;
    setCurPath([]);
    if (path.length > 1) ditherClear(isLight);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const x = (e.nativeEvent.offsetX / actualLength) * length;
    const y = (e.nativeEvent.offsetY / actualLength) * length;
    setCurPath([{ x, y }]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setCurPath((prev) => {
      const x = (e.nativeEvent.offsetX / actualLength) * length;
      const y = (e.nativeEvent.offsetY / actualLength) * length;
      return [...prev, { x, y }];
    });
    if (e.buttons == 1 || e.pointerType == "touch") {
      draw(false, curPath);
    }
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.buttons == 1 || e.pointerType == "touch") {
      setIsDrawing(true);
    } else {
      setIsDrawing(false);
    }
  };

  const handlePointerLeave = () => {
    setIsDrawing(false);
    setCurPath([]);
  };

  //init
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctxRef.current = ctx;
    setActualLength(canvas.getBoundingClientRect().width);
    ctx.imageSmoothingEnabled = false;
    ctx.lineJoin = "round";
    ctx.lineCap = "butt";
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = brush_col;
    ctx.fillStyle = brush_col;
  }, []);

  //sync ctx to current tool settings
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.lineWidth = brushSize;
    if (isErase) {
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.strokeStyle = brush_col;
      ctx.fillStyle = brush_col;
      ctx.globalCompositeOperation = "source-over";
    }
  }, [isLight, isErase, brushSize]);

  return (
    <canvas
      ref={canvasRef}
      width={length}
      height={length}
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
