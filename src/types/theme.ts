export interface Theme {
  id: string;
  name: string;
  bgColor: string;
  bgSecondary: string;
  cellColor: string;
  cellGlowColor: string;
  cellAgeColor: string;
  trailColor: string;
  accentColor: string;
  borderSubtle: string;
  textPrimary: string;
  textMuted: string;
  gridLineColor: string;
}

export type ThemeKey = "cyan" | "green" | "synthwave" | "amber" | "crimson" | "monochrome";

export type BackgroundKey = "classic" | "void" | "black" | "slate";

export interface BackgroundOption {
  id: BackgroundKey;
  name: string;
  color: string;
  secondary: string;
}
