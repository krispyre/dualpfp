export interface Point {
  x: number;
  y: number;
}
export interface DrawAction {
  action: "switch" | "draw" | "clear";
  path?: Point[];
  isLight: boolean;
  isEraser?: boolean;
}
