import { useRef } from "react";

type LayerProps = {
  isLight: boolean;
  length: number;
};
const Layer = ({ isLight, length }: LayerProps) => {
  const canvasRef = useRef(null);

  if (isLight) {
    console.log("im darkmode layer");
  } else {
    console.log("im lightmode layer");
  }
  return (
    <canvas ref={canvasRef} width={length} height={length}>
      ur js is disabled
    </canvas>
  );
};

export default Layer;
