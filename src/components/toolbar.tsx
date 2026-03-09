type ToolbarProps = {
  isEraser: boolean;
  brushSize: number;
  eraserSize: number;
  isLight: boolean;
  showCircleMask: boolean;
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
};

const Toolbar = ({
  isEraser,
  brushSize,
  eraserSize,
  isLight,
  showCircleMask,
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
}: ToolbarProps) => {
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

  const handleSaveImg = () => {
    const name =
      (document.getElementById("filenameField") as HTMLInputElement)?.value ||
      "default";
    onSaveImg(name);
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
          onMouseLeave={() => onShowSecret(0, false)}
          onMouseMove={(e) => {
            const hue = Math.round(
              (e.nativeEvent.offsetX / (e.target as HTMLElement).clientWidth) *
                255,
            );
            // console.log(hue);
            onShowSecret(hue, true);
          }}
        >
          reveal secret
        </button>
        <hr />
        <div id="saveField">
          <input type="text" placeholder="file name=>" id="filenameField" />
          <button id="saveButton" onClick={handleSaveImg}>
            save image
          </button>
        </div>
      </section>
    </>
  );
};

export default Toolbar;
