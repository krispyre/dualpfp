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
    // console.log(e.nativeEvent.offsetX, e.nativeEvent.offsetY);

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

  // dither clear alternatively
  useEffect(() => {
    ditherClear(isLight);
  }, [isDrawing]);

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
