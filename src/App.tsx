import { useEffect, useReducer, useRef, useState } from "react";
import Layer from "./components/layer";
import type { LayerHandle } from "./components/layer";
import "./App.css";
import CircleMask from "./components/circleMask";
import { reducer, initialState } from "./reducer";
import type { Action } from "./reducer";
import type { Point } from "./components/drawAction";
import {
  Circle,
  CircleOff,
  Eraser,
  Lightbulb,
  LightbulbOff,
  Pen,
  Redo2,
  Save,
  Undo2,
  UserCircle,
  UserCircle2,
  UserCircle2Icon,
  UserRound,
  X,
} from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";

const LENGTH = 80;
const COL_DARK = "#313338";
const COL_LIGHT = "#FFFFFF";

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  //most recent draw action
  const lastHistoryAction = useRef<Action["type"] | null>(null);
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

  useEffect(() => {
    const storedHistory = localStorage.getItem("drawHistory");
    const storedStepCount = localStorage.getItem("stepCount");
    if (storedHistory && storedStepCount) {
      const hist = JSON.parse(storedHistory);
      const sc = JSON.parse(storedStepCount);
      dispatch({
        type: "LOAD_HIST",
        drawHistory: hist,
        stepCount: sc,
        maxStepCount: hist.length,
      });
    }
  }, []);

  useEffect(() => {
    if (drawHistory.length > 0) {
      layerDarkRef.current?.loadHistory(stepCount, drawHistory);
      layerLightRef.current?.loadHistory(stepCount, drawHistory);
    }
  }, [drawHistory, stepCount]);

  useEffect(() => {
    if (
      lastHistoryAction.current === "ADD_DRAW" ||
      lastHistoryAction.current === "UNDO" ||
      lastHistoryAction.current === "REDO" ||
      lastHistoryAction.current === "LOAD_HIST"
    ) {
      localStorage.setItem("drawHistory", JSON.stringify(drawHistory));
      localStorage.setItem("stepCount", JSON.stringify(stepCount));
    }
  }, [drawHistory, stepCount]);

  const [filename, setFilename] = useState("dualpfp");

  // track last draw action then dispatch
  const trackedDispatch = (action: Action) => {
    lastHistoryAction.current = action.type;
    dispatch(action);
  };

  const layerDarkCanvas = useRef<HTMLCanvasElement>(null);
  const layerLightCanvas = useRef<HTMLCanvasElement>(null);
  const layerDarkRef = useRef<LayerHandle>(null);
  const layerLightRef = useRef<LayerHandle>(null);

  const addDrawHist = (isLight: boolean, newPath: Point[]) => {
    trackedDispatch({
      type: "ADD_DRAW",
      path: newPath,
      isLight,
      isEraser,
      brushSize: isEraser ? eraserSize : brushSize,
    });
  };

  // button handlers
  const handleSetEraser = (val: boolean) => {
    trackedDispatch({ type: "SET_ERASER", isEraser: val });
    layerDarkRef.current?.setEraser(val);
    layerLightRef.current?.setEraser(val);
  };

  const handleUndo = () => {
    if (state.stepCount <= 0) {
      console.error("stepCount too low");
      return;
    }
    const newStepCount = state.stepCount - 1;
    trackedDispatch({ type: "UNDO", stepCount: newStepCount });
    layerDarkRef.current?.updateByStep(newStepCount);
    layerLightRef.current?.updateByStep(newStepCount);
  };

  const handleRedo = () => {
    if (state.stepCount >= state.maxStepCount) {
      console.warn("most recent history reached");
      return;
    }
    const newStepCount = state.stepCount + 1;
    trackedDispatch({ type: "REDO", stepCount: newStepCount });
    layerDarkRef.current?.updateByStep(newStepCount);
    layerLightRef.current?.updateByStep(newStepCount);
  };

  const handleSetBrushSize = (size: number) => {
    trackedDispatch({ type: "SET_BRUSH_SIZE", size });
    layerDarkRef.current?.setBrushSize(size);
    layerLightRef.current?.setBrushSize(size);
  };

  const handleSetEraserSize = (size: number) => {
    trackedDispatch({ type: "SET_ERASER_SIZE", size });
  };

  const handleSetLight = (mode: boolean) => {
    trackedDispatch({ type: "SWITCH_LAYER", isLight: mode });
  };

  const handleSetCircleMask = (show: boolean) => {
    trackedDispatch({ type: "SET_CIRCLE_MASK", show });
  };

  const handleClearLight = () => {
    trackedDispatch({ type: "CLEAR_LAYER" });
    layerLightRef.current?.clear();
  };

  const handleClearDark = () => {
    trackedDispatch({ type: "CLEAR_LAYER" });
    layerDarkRef.current?.clear();
  };

  const handleSaveImg = (filename: string) => {
    const dark: HTMLCanvasElement = layerDarkCanvas.current!;
    const light: HTMLCanvasElement = layerLightCanvas.current!;

    function isCanvasBlank(canvas) {
      const ctx = canvas.getContext("2d");
      const buffer = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const pixelView = new Uint32Array(buffer.buffer);
      return !pixelView.some((color) => color !== 0);
    }

    if (
      isCanvasBlank(layerDarkCanvas.current) &&
      isCanvasBlank(layerLightCanvas.current)
    ) {
      alert("Canvas blank");
      return;
    }

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
    // window.open(exportLink.href, "_blank");

    exportLink.click();
  };

  const handleToggleSecret = () => {
    trackedDispatch({ type: "TOGGLE_SECRET" });
  };

  const handleShowSecret = (hue: number, isHover: boolean) => {
    if (isHover || showSecret) {
      trackedDispatch({
        type: "SET_BG_COL",
        color: isLight ? `hsl(${hue},10%,80%` : `hsl(${hue},10%,40%`,
        hue: hue,
      });
    } else {
      trackedDispatch({
        type: "SET_BG_COL",
        color: isLight ? COL_LIGHT : COL_DARK,
        hue: hue,
      });
    }
  };
  useHotkeys("ctrl+z", handleUndo);
  useHotkeys("ctrl+shift+z", handleRedo);
  useHotkeys("e", () => {
    handleSetEraser(!isEraser);
  }); // todo turn to toggle
  useHotkeys("b", () => handleSetEraser(false));
  useHotkeys("delete", () => {
    if (isLight) handleClearLight();
    else handleClearDark();
  });
  useHotkeys("ctrl+s", () => handleSaveImg(filename));
  useHotkeys("tab", (e, _) => {
    e.preventDefault();
    if (isLight) handleSetLight(false);
    else handleSetLight(true);
  });
  //disable scroll to zoom
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        console.warn("zooming disabled bc the canvas breaks, sorry");
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <main id="gridWrap">
      <section id="canvasCell">
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
      </section>
      <section id="undoStack">
        <div id="undosWrap" className="btnGroup col">
          <button
            aria-label="undo"
            name="undo"
            id="undo"
            onClick={handleUndo}
            disabled={stepCount <= 0}
            title="unpee pants"
          >
            <Undo2 />
          </button>
          <hr />
          <button
            aria-label="redo"
            name="redo"
            id="redo"
            onClick={handleRedo}
            disabled={stepCount >= maxStepCount}
            title="repee pants"
          >
            <Redo2 />
          </button>
        </div>
      </section>
      <section id="brushSettings">
        <div id="brushSlider" style={{ display: isEraser ? "none" : "block" }}>
          {/* <label htmlFor="brushSize">brush size</label> */}
          <input
            type="range"
            min="1"
            max="10"
            id="brushSize"
            name="brushSize"
            value={brushSize}
            onChange={(e) => handleSetBrushSize(Number(e.target.value))}
          />
          <label className="brushSizeDisplay">{brushSize}</label>
        </div>
        <div id="eraserSlider" style={{ display: isEraser ? "block" : "none" }}>
          {/* <label htmlFor="eraserSize">eraser size</label> */}
          <input
            type="range"
            min="1"
            max="10"
            id="eraserSize"
            name="eraserSize"
            value={eraserSize}
            onChange={(e) => handleSetEraserSize(Number(e.target.value))}
          />
          <label className="brushSizeDisplay">{eraserSize}</label>
        </div>
        <div id="eraserToggle">
          {/* <label htmlFor="isEraser">eraser?</label> */}
          <div className="btnGroup row">
            <button
              id="setEraser"
              onClick={() => handleSetEraser(true)}
              disabled={isEraser}
            >
              <Eraser />
            </button>
            <button
              id="setPen"
              onClick={() => handleSetEraser(false)}
              disabled={!isEraser}
            >
              <Pen />
            </button>
          </div>
        </div>
        <button
          id="revealSecret"
          onClick={handleToggleSecret}
          onPointerLeave={() => handleShowSecret(0, false)}
          onPointerMove={(e) => {
            const hue = Math.round(
              (e.nativeEvent.offsetX / (e.target as HTMLElement).clientWidth) *
                255,
            );
            handleShowSecret(hue, true);
          }}
        >
          {showSecret ? "regular bg" : "...?"}
        </button>
      </section>
      <section id="clearBtns">
        <div id="clearBtnsWrap">
          <button
            name="clearLayerLight"
            id="clearLayerLight"
            onClick={handleClearLight}
            style={{ display: isLight ? "block" : "none" }}
            title="clear light mode"
          >
            {/* clear light mode */}
            <X />
          </button>
          <button
            name="clearLayerDark"
            id="clearLayerDark"
            onClick={handleClearDark}
            style={{ display: isLight ? "none" : "block" }}
            title="clear dark mode"
          >
            {/* clear dark mode */}
            <X />
          </button>
        </div>
      </section>
      <section id="displayToggles">
        <div id="lightToggle">
          {/* <label htmlFor="isLight">light mode?</label> */}
          <button
            id="isLight"
            onClick={() => handleSetLight(!isLight)}
            title="switch to another mode"
          >
            {isLight ? <LightbulbOff /> : <Lightbulb />}
          </button>
        </div>
        <div id="circleToggle">
          {/* <label htmlFor="showCircleMask">show circle mask?</label> */}
          <button
            id="showCircleMask"
            onClick={() => handleSetCircleMask(!showCircleMask)}
            title="see pfp border"
          >
            {showCircleMask ? <UserRound /> : <UserCircle2 />}
          </button>
        </div>
        <div id="saveField">
          {/* <input
            type="text"
            placeholder="pfp"
            id="filenameField"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
          /> */}
          <button
            id="saveButton"
            onClick={() => handleSaveImg(filename)}
            title="save image"
          >
            <Save />
          </button>
        </div>
      </section>
    </main>
  );
}

export default App;
