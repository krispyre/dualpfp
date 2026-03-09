/* tslint:disable:no-unused-variable */

import { useState, useRef, useEffect } from "react";
import Layer from "./components/layer";
import Toolbar from "./components/toolbar";
import "./App.css";
import CircleMask from "./components/circleMask";

const LENGTH = 256;
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

  const [filename, setFilename] = useState("dualpfp");

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

  const handleSaveImg = (filename: string) => {
    const dark: HTMLCanvasElement = layerDark.current;
    const light: HTMLCanvasElement = layerLight.current;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = LENGTH;
    exportCanvas.height = LENGTH;
    const exportCtx = exportCanvas.getContext("2d");
    exportCtx.globalCompositeOperation = "source-over";
    exportCtx.drawImage(light, 0, 0);
    exportCtx.drawImage(dark, 0, 0);

    const exportLink = document.createElement("a");
    exportLink.download = filename;
    exportLink.href = exportCanvas.toDataURL("image/png");
    window.open(exportLink.href, "_blank");

    console.log(dark, "Save image");
  };

  const handleToggleSecret = () => {
    setShowSecret(!showSecret);
    console.log(showSecret);
  };
  const handleShowSecret = (hue: number, isHover: boolean) => {
    if (isHover || showSecret) {
      setBgCol(`hsl(${hue},10%,40%`);
    } else {
      if (isLight) {
        setBgCol(COL_LIGHT);
      } else {
        setBgCol(COL_DARK);
      }
    }
    console.log(hue);
  };

  //refactor, should be decoupled to showSecret?
  useEffect(() => {
    if (!showSecret) {
      if (isLight) {
        setBgCol(COL_LIGHT);
      } else {
        setBgCol(COL_DARK);
      }
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
        showSecret={showSecret}
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
        onToggleSecret={handleToggleSecret}
        onShowSecret={handleShowSecret}
      />
    </>
  );
}

export default App;
