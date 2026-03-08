/* tslint:disable:no-unused-variable */

import { useState, useRef } from "react";
import Layer from "./components/layer";
import Toolbar from "./components/toolbar";
import "./App.css";

const LENGTH = 512;
const COL_DARK = "#313338";
const COL_LIGHT = "#FFFFFF";

function App() {
  const [isEraser, setIsEraser] = useState(false);
  const [brushSize, setBrushSize] = useState(3);
  const [eraserSize, setEraserSize] = useState(10);
  const [isLight, setIsLight] = useState(false);
  const [showCircleMask, setShowCircleMask] = useState(false);

  const layerLight = useRef(null);
  const layerDark = useRef(null);

  const handleSetEraser = (e) => {
    setIsEraser(e);
  };

  const handleUndo = () => {
    console.log("Undo action");
  };

  const handleRedo = () => {
    console.log("Redo action");
  };

  const handleSetBrushSize = (size: number) => {
    setBrushSize(size);
  };

  const handleSetEraserSize = (size: number) => {
    setEraserSize(size);
  };

  const handleSetLight = (mode: boolean) => {
    setIsLight(mode);
  };

  const handleSetCircleMask = (show: boolean) => {
    setShowCircleMask(show);
  };

  const handleClearLight = () => {
    setImgLight(null);
  };

  const handleClearDark = () => {
    setImgDark(null);
  };

  const handleSaveImg = () => {
    console.log("Save image");
  };

  return (
    <>
      <section id="canvasContainer">
        <div
          id="background"
          style={{
            width: `${LENGTH}px`,
            height: `${LENGTH}px`,
            zIndex: -1,
            backgroundColor: isLight ? COL_LIGHT : COL_DARK,
          }}
        ></div>
        <Layer
          canvasRef={layerDark}
          isLight={false}
          length={LENGTH}
          isEnabled={!isLight}
          brushSize={isEraser ? eraserSize : brushSize}
          isErase={isEraser}
        />
        <Layer
          canvasRef={layerLight}
          isLight={true}
          length={LENGTH}
          isEnabled={isLight}
          brushSize={isEraser ? eraserSize : brushSize}
          isErase={isEraser}
        />
        {/* <canvas id="ui" className="layer" width="" height=""></canvas> */}
      </section>
      <Toolbar
        isEraser={isEraser}
        brushSize={brushSize}
        eraserSize={eraserSize}
        isLight={isLight}
        showCircleMask={showCircleMask}
        onSetEraser={handleSetEraser}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSetBrushSize={handleSetBrushSize}
        onSetEraserSize={handleSetEraserSize}
        onSetLight={handleSetLight}
        onSetCircleMask={handleSetCircleMask}
        onClearLight={handleClearLight}
        onClearDark={handleClearDark}
        onSaveImg={handleSaveImg}
      />
    </>
  );
}

export default App;
