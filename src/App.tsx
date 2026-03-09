/* tslint:disable:no-unused-variable */

import { useState, useRef, useEffect } from "react";
import Layer from "./components/layer";
import Toolbar from "./components/toolbar";
import "./App.css";
import CircleMask from "./components/circleMask";

const LENGTH = 512;
const COL_DARK = "#313338";
const COL_LIGHT = "#FFFFFF";
const COL_RED = "hsl(353, 60%, 48%)";
function App() {
  const [isEraser, setIsEraser] = useState(false);
  const [brushSize, setBrushSize] = useState(3);
  const [eraserSize, setEraserSize] = useState(10);
  const [isLight, setIsLight] = useState(false);
  const [showCircleMask, setShowCircleMask] = useState(false);

  const layerLight = useRef(null);
  const layerDark = useRef(null);

  const [shouldClearLight, setShouldClearLight] = useState(false);
  const [shouldClearDark, setShouldClearDark] = useState(false);

  const [showSecret, setShowSecret] = useState(false);
  const [bgCol, setBgCol] = useState(COL_DARK);

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
    console.warn(mode);
    setIsLight(mode);
  };

  const handleSetCircleMask = (show: boolean) => {
    setShowCircleMask(show);
  };

  const handleClearLight = () => {
    setShouldClearLight(true);
  };

  const handleClearDark = () => {
    setShouldClearDark(true);
  };

  const handleSaveImg = () => {
    console.log("Save image");
  };

  const handleShowSecret = (hue: number, isShow: boolean) => {
    console.log(hue, isShow);
    if (isShow) {
      setBgCol(`hsl(${hue},10%,40%`);
    } else {
      if (isLight) {
        setBgCol(COL_LIGHT);
      } else {
        setBgCol(COL_DARK);
      }
    }
  };

  //refactor, should be decoupled to showSecret
  useEffect(() => {
    if (isLight) {
      setBgCol(COL_LIGHT);
    } else {
      setBgCol(COL_DARK);
    }
  }, [isLight]);

  return (
    <>
      <section
        id="canvasContainer"
        style={{
          display: "relative",
          width: `${LENGTH}px`,
          height: `${LENGTH}px`,
          backgroundColor: bgCol,
        }}
      >
        <Layer
          canvasRef={layerDark}
          isLight={false}
          length={LENGTH}
          isEnabled={!isLight}
          brushSize={isEraser ? eraserSize : brushSize}
          isErase={isEraser}
          shouldClear={shouldClearDark}
          onClear={() => setShouldClearDark(false)}
        />
        <Layer
          canvasRef={layerLight}
          isLight={true}
          length={LENGTH}
          isEnabled={isLight}
          brushSize={isEraser ? eraserSize : brushSize}
          isErase={isEraser}
          shouldClear={shouldClearLight}
          onClear={() => setShouldClearLight(false)}
        />
        <canvas id="ui" className="layer" width="" height=""></canvas>
        <CircleMask isEnabled={showCircleMask} length={LENGTH} />
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
        onShowSecret={handleShowSecret}
      />
    </>
  );
}

export default App;
