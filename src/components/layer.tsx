import React, { useRef } from "react";

const Layer = ({ isLight, length }) => {
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
