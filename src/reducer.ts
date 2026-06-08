import type { DrawAction, Point } from "./components/drawAction"

const COL_DARK = "#313338"
const COL_LIGHT = "#FFFFFF"

export type State = {
  drawHistory: DrawAction[]
  isLight: boolean
  isEraser: boolean
  brushSize: number
  eraserSize: number
  bgCol: string
  showCircleMask: boolean
  showSecret: boolean
}

export type Action =
  | { type: "ADD_DRAW"; path: Point[]; isLight: boolean; isEraser: boolean; brushSize: number }
  | { type: "UNDO" }
  | { type: "SWITCH_LAYER"; isLight: boolean }
  | { type: "SET_ERASER"; isEraser: boolean }
  | { type: "SET_BRUSH_SIZE"; size: number }
  | { type: "SET_ERASER_SIZE"; size: number }
  | { type: "CLEAR_LAYER" }
  | { type: "SET_CIRCLE_MASK"; show: boolean }
  | { type: "TOGGLE_SECRET" }
  | { type: "SET_BG_COL"; color: string }

export const initialState: State = {
  drawHistory: [],
  isLight: false,
  isEraser: false,
  brushSize: 3,
  eraserSize: 10,
  bgCol: COL_DARK,
  showCircleMask: false,
  showSecret: false,
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_DRAW":
      return {
        ...state,
        drawHistory: [
          ...state.drawHistory,
          {
            action: "draw",
            path: action.path,
            isLight: action.isLight,
            isEraser: action.isEraser,
            brushSize: action.brushSize,
          },
        ],
      }

    case "UNDO": {
      const newHistory = state.drawHistory.slice(0, -1)
      const last = newHistory.at(-1)
      return {
        ...state,
        drawHistory: newHistory,
        isLight: last?.isLight ?? state.isLight,
        bgCol: state.showSecret
          ? state.bgCol
          : last?.isLight
            ? COL_LIGHT
            : COL_DARK,
      }
    }

    case "SWITCH_LAYER":
      return {
        ...state,
        isLight: action.isLight,
        bgCol: action.isLight ? COL_LIGHT : COL_DARK,
        drawHistory: [
          ...state.drawHistory,
          { action: "switch", isLight: action.isLight },
        ],
      }

    case "SET_ERASER":
      return { ...state, isEraser: action.isEraser }

    case "SET_BRUSH_SIZE":
      return { ...state, brushSize: action.size }

    case "SET_ERASER_SIZE":
      return { ...state, eraserSize: action.size }

    case "CLEAR_LAYER":
      return {
        ...state,
        drawHistory: [
          ...state.drawHistory,
          { action: "clear", isLight: state.isLight },
        ],
      }

    case "SET_CIRCLE_MASK":
      return { ...state, showCircleMask: action.show }

    case "TOGGLE_SECRET":
      return { ...state, showSecret: !state.showSecret }

    case "SET_BG_COL":
      return { ...state, bgCol: action.color }

    default:
      return state
  }
}
