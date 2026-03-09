export interface Point {
  x: number;
  y: number;
}
export interface DrawAction {
  action: "switch" | "draw";
  path?: Point[];
  isLight: boolean;
}
