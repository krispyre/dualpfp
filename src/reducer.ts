import type { DrawAction, Point } from "./components/drawAction";

const COL_DARK = "#313338";
const COL_LIGHT = "#FFFFFF";

export type State = {
  drawHistory: DrawAction[];
  stepCount: number;
  maxStepCount: number;
  isLight: boolean;
  isEraser: boolean;
  brushSize: number;
  eraserSize: number;
  bgCol: string;
  showCircleMask: boolean;
  showSecret: boolean;
};

export type Action =
  | {
      type: "ADD_DRAW";
      path: Point[];
      isLight: boolean;
      isEraser: boolean;
      brushSize: number;
    }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SWITCH_LAYER"; isLight: boolean }
  | { type: "SET_ERASER"; isEraser: boolean }
  | { type: "SET_BRUSH_SIZE"; size: number }
  | { type: "SET_ERASER_SIZE"; size: number }
  | { type: "CLEAR_LAYER" }
  | { type: "SET_CIRCLE_MASK"; show: boolean }
  | { type: "TOGGLE_SECRET" }
  | { type: "SET_BG_COL"; color: string };

export const initialState: State = {
  drawHistory: [],
  stepCount: 0,
  maxStepCount: 0,
  isLight: false,
  isEraser: false,
  brushSize: 3,
  eraserSize: 10,
  bgCol: COL_DARK,
  showCircleMask: false,
  showSecret: false,
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_DRAW": {
      const trimmed = state.drawHistory.slice(0, state.stepCount);
      const newHistory = [
        ...trimmed,
        {
          action: "draw" as const,
          path: action.path,
          isLight: action.isLight,
          isEraser: action.isEraser,
          brushSize: action.brushSize,
        },
      ];
      const newStepCount = newHistory.length;

      const newState = {
        ...state,
        drawHistory: newHistory,
        stepCount: newStepCount,
        maxStepCount: newStepCount,
      };
      console.log(newState);
      return newState;
    }

    case "UNDO": {
      if (state.stepCount <= 0) return state;
      const newStepCount = state.stepCount - 1;
      const last = state.drawHistory[newStepCount - 1];
      return {
        ...state,
        stepCount: newStepCount,
        isLight: last?.isLight,
        bgCol: state.showSecret
          ? state.bgCol
          : last?.isLight
            ? COL_LIGHT
            : COL_DARK,
      };
    }

    case "REDO": {
      if (state.stepCount >= state.maxStepCount) return state;
      const newStepCount = state.stepCount + 1;
      const last = state.drawHistory[newStepCount - 1];
      return {
        ...state,
        stepCount: newStepCount,
        isLight: last?.isLight,
        bgCol: state.showSecret
          ? state.bgCol
          : last?.isLight
            ? COL_LIGHT
            : COL_DARK,
      };
    }

    case "SWITCH_LAYER": {
      const trimmed = state.drawHistory.slice(0, state.stepCount);
      const newHistory = [
        ...trimmed,
        { action: "switch" as const, isLight: action.isLight },
      ];
      const newStepCount = newHistory.length;
      return {
        ...state,
        isLight: action.isLight,
        bgCol: action.isLight ? COL_LIGHT : COL_DARK,
        drawHistory: newHistory,
        stepCount: newStepCount,
        maxStepCount: newStepCount,
      };
    }

    case "SET_ERASER":
      return { ...state, isEraser: action.isEraser };

    case "SET_BRUSH_SIZE":
      return { ...state, brushSize: action.size };

    case "SET_ERASER_SIZE":
      return { ...state, eraserSize: action.size };

    case "CLEAR_LAYER": {
      const trimmed = state.drawHistory.slice(0, state.stepCount);
      const newHistory = [
        ...trimmed,
        { action: "clear" as const, isLight: state.isLight },
      ];
      const newStepCount = newHistory.length;
      return {
        ...state,
        drawHistory: newHistory,
        stepCount: newStepCount,
        maxStepCount: newStepCount,
      };
    }

    case "SET_CIRCLE_MASK":
      return { ...state, showCircleMask: action.show };

    case "TOGGLE_SECRET":
      return { ...state, showSecret: !state.showSecret };

    case "SET_BG_COL":
      return { ...state, bgCol: action.color };

    default:
      return state;
  }
}
