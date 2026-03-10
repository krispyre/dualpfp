import { useRef, useEffect } from "react";

const CircleMask = ({ isEnabled, length }) => {
  const canvasRef: React.RefObject<HTMLCanvasElement> = useRef(null);

  useEffect(() => {
    if (!canvasRef) return;
    const ctx: CanvasRenderingContext2D = canvasRef.current.getContext("2d");
    if (isEnabled) {
      console.log("show mask");
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, .7)";
      ctx.fillRect(0, 0, length, length);

      ctx.beginPath();
      ctx.arc(
        Math.floor(length / 2),
        Math.floor(length / 2),
        Math.floor(length / 2),
        0,
        Math.PI * 2,
      );
      ctx.closePath();
      ctx.clip();

      ctx.clearRect(0, 0, length, length);
      ctx.restore();
    } else {
      ctx.clearRect(0, 0, length, length);
      console.log("hide mask");
    }
  }, [isEnabled]);

  return (
    <canvas
      ref={canvasRef}
      id="circle_mask"
      className="layer"
      width={length}
      height={length}
      style={{ zIndex: 2, pointerEvents: "none" }}
    ></canvas>
  );
};

export default CircleMask;
