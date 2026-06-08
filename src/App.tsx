import { useReducer, useRef, useState } from "react";
import Layer from "./components/layer";
import type { LayerHandle } from "./components/layer";
import Toolbar from "./components/toolbar";
import "./App.css";
import CircleMask from "./components/circleMask";
import { reducer, initialState } from "./reducer";
import type { Point } from "./components/drawAction";

const LENGTH = 256;
const COL_DARK = "#313338";
const COL_LIGHT = "#FFFFFF";

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    secretHue,
    stepCount,
    maxStepCount,
    isEraser,
    brushSize,
    eraserSize,
    isLight,
    showCircleMask,
    showSecret,
    bgCol,
    drawHistory,
  } = state;

  const layerDarkCanvas = useRef<HTMLCanvasElement>(null);
  const layerLightCanvas = useRef<HTMLCanvasElement>(null);
  const layerDarkRef = useRef<LayerHandle>(null);
  const layerLightRef = useRef<LayerHandle>(null);

  const addDrawHist = (isLight: boolean, newPath: Point[]) => {
    dispatch({
      type: "ADD_DRAW",
      path: newPath,
      isLight,
      isEraser,
      brushSize: isEraser ? eraserSize : brushSize,
    });
  };

  const handleSetEraser = (val: boolean) => {
    dispatch({ type: "SET_ERASER", isEraser: val });
    layerDarkRef.current?.setEraser(val);
    layerLightRef.current?.setEraser(val);
  };

  const handleUndo = () => {
    if (state.stepCount <= 0) {
      console.error("stepCount too low");
      return;
    }
    const newStepCount = state.stepCount - 1;
    dispatch({ type: "UNDO" });
    layerDarkRef.current?.undo(newStepCount);
    layerLightRef.current?.undo(newStepCount);
  };

  const handleRedo = () => {
    if (state.stepCount >= state.maxStepCount) {
      console.warn("most recent history reached");
      return;
    }
    const newStepCount = state.stepCount + 1;
    dispatch({ type: "REDO" });
    layerDarkRef.current?.redo(newStepCount);
    layerLightRef.current?.redo(newStepCount);
  };

  const handleSetBrushSize = (size: number) => {
    dispatch({ type: "SET_BRUSH_SIZE", size });
    layerDarkRef.current?.setBrushSize(size);
    layerLightRef.current?.setBrushSize(size);
  };

  const handleSetEraserSize = (size: number) => {
    dispatch({ type: "SET_ERASER_SIZE", size });
  };

  const handleSetLight = (mode: boolean) => {
    dispatch({ type: "SWITCH_LAYER", isLight: mode });
  };

  const handleSetCircleMask = (show: boolean) => {
    dispatch({ type: "SET_CIRCLE_MASK", show });
  };

  const handleClearLight = () => {
    dispatch({ type: "CLEAR_LAYER" });
    layerLightRef.current?.clear();
  };

  const handleClearDark = () => {
    dispatch({ type: "CLEAR_LAYER" });
    layerDarkRef.current?.clear();
  };

  const handleSaveImg = (filename: string) => {
    const dark: HTMLCanvasElement = layerDarkCanvas.current!;
    const light: HTMLCanvasElement = layerLightCanvas.current!;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = LENGTH;
    exportCanvas.height = LENGTH;
    const exportCtx = exportCanvas.getContext("2d")!;
    exportCtx.globalCompositeOperation = "source-over";
    exportCtx.drawImage(light, 0, 0);
    exportCtx.drawImage(dark, 0, 0);

    const exportLink = document.createElement("a");
    exportLink.download = filename;
    exportLink.href = exportCanvas.toDataURL("image/png");
    window.open(exportLink.href, "_blank");
  };

  const handleToggleSecret = () => {
    dispatch({ type: "TOGGLE_SECRET" });
  };

  const handleShowSecret = (hue: number, isHover: boolean) => {
    if (isHover || showSecret) {
      dispatch({
        type: "SET_BG_COL",
        color: isLight ? `hsl(${hue},10%,80%` : `hsl(${hue},10%,40%`,
        hue: hue,
      });
    } else {
      dispatch({
        type: "SET_BG_COL",
        color: isLight ? COL_LIGHT : COL_DARK,
        hue: hue,
      });
    }
  };

  return (
    <>
      <section
        id="canvasContainer"
        style={{
          backgroundColor: bgCol,
        }}
      >
        <Layer
          ref={layerDarkRef}
          drawHistory={drawHistory}
          canvasRef={layerDarkCanvas}
          isLight={false}
          length={LENGTH}
          isEnabled={!isLight}
          brushSize={isEraser ? eraserSize : brushSize}
          isErase={isEraser}
          addDrawHist={addDrawHist}
        />
        <Layer
          ref={layerLightRef}
          drawHistory={drawHistory}
          canvasRef={layerLightCanvas}
          isLight={true}
          length={LENGTH}
          isEnabled={isLight}
          brushSize={isEraser ? eraserSize : brushSize}
          isErase={isEraser}
          addDrawHist={addDrawHist}
        />
        <canvas id="ui" className="layer" width={LENGTH}></canvas>
        <CircleMask isEnabled={showCircleMask} length={LENGTH} />
      </section>
      <Toolbar
        drawHistStep={state.stepCount}
        maxDhStep={state.maxStepCount}
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
