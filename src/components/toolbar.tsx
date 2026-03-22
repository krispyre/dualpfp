import { useState } from "react";

type ToolbarProps = {
  isEraser: boolean;
  brushSize: number;
  eraserSize: number;
  isLight: boolean;
  showCircleMask: boolean;
  showSecret: boolean;
  onSetEraser: (wub: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSetBrushSize: (size: number) => void;
  onSetEraserSize: (size: number) => void;
  onSetLight: (wub: boolean) => void;
  onSetCircleMask: (wub: boolean) => void;
  onClearLight: () => void;
  onClearDark: () => void;
  onSaveImg: (name: string) => void;
  onShowSecret: (hue: number, isShow: boolean) => void;
  onToggleSecret: () => void;
};

const Toolbar = ({
  isEraser,
  brushSize,
  eraserSize,
  isLight,
  showCircleMask,
  showSecret,
  onSetEraser,
  onUndo,
  onRedo,
  onSetBrushSize,
  onSetEraserSize,
  onSetLight,
  onSetCircleMask,
  onClearLight,
  onClearDark,
  onSaveImg,
  onShowSecret,
  onToggleSecret,
}: ToolbarProps) => {
  const [filename, setFilename] = useState("dualpfp");
  const handleSetEraser = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSetEraser(e.target.checked);
  };

  const handleUndo = () => {
    onUndo();
  };

  const handleRedo = () => {
    onRedo();
  };

  const handleSetBrushSize = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSetBrushSize(Number(e.target.value));
  };

  const handleSetEraserSize = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSetEraserSize(Number(e.target.value));
  };

  const handleSetLight = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSetLight(e.target.checked);
    // console.warn("hmm", e.target.checked);
  };

  const handleSetCircleMask = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSetCircleMask(e.target.checked);
  };

  const handleClearLight = () => {
    onClearLight();
  };

  const handleClearDark = () => {
    onClearDark();
  };

  const handleSaveImg = (filename: string) => {
    onSaveImg(filename);
  };

  return (
    <>
      <section className="tools">
        <div>
          <label htmlFor="isEraser">eraser?</label>
          <input
            type="checkbox"
            name="isEraser"
            id="isEraser"
            checked={isEraser}
            onChange={handleSetEraser}
          />
        </div>
        <div id="undoStack">
          <button name="undo" id="undo" onClick={handleUndo}>
            undo
          </button>
          <button name="redo" id="redo" onClick={handleRedo}>
            redo
          </button>
        </div>
        <div id="brushSettings">
          <label htmlFor="brushSize">brush size</label>
          <input
            type="range"
            min="1"
            max="100"
            id="brushSize"
            name="brushSize"
            value={brushSize}
            onChange={handleSetBrushSize}
          />
          <label htmlFor="brushSize">{brushSize}</label>
        </div>
        <div id="eraserSettings">
          <label htmlFor="eraserSize">eraser size</label>
          <input
            type="range"
            min="1"
            max="100"
            id="eraserSize"
            name="eraserSize"
            value={eraserSize}
            onChange={handleSetEraserSize}
          />
          <label htmlFor="brushSize">{eraserSize}</label>
        </div>
        <div>
          <label htmlFor="isLight">light mode?</label>
          <input
            type="checkbox"
            name="isLight"
            id="isLight"
            checked={isLight}
            onChange={handleSetLight}
          />
        </div>
        <div>
          <label htmlFor="showCircleMask">show circle mask?</label>
          <input
            type="checkbox"
            name="showCircleMask"
            id="showCircleMask"
            checked={showCircleMask}
            onChange={handleSetCircleMask}
          />
        </div>
        <button
          name="clearLayerLight"
          id="clearLayerLight"
          onClick={handleClearLight}
        >
          clear light mode
        </button>
        <button
          name="clearLayerDark"
          id="clearLayerDark"
          onClick={handleClearDark}
        >
          clear dark mode
        </button>
        <br />
        <button
          onClick={onToggleSecret}
          onPointerLeave={() => onShowSecret(0, false)}
          onPointerMove={(e) => {
            const hue = Math.round(
              (e.nativeEvent.offsetX / (e.target as HTMLElement).clientWidth) *
                255,
            );
            // console.log(hue);
            onShowSecret(hue, true);
          }}
        >
          {showSecret ? "regular bg" : "reveal secret"}
        </button>
        <hr />
        <div id="saveField">
          <input
            type="text"
            placeholder="pfp"
            id="filenameField"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
          />
          <button id="saveButton" onClick={() => handleSaveImg(filename)}>
            save image
          </button>
        </div>
      </section>
    </>
  );
};

export default Toolbar;
