export type PatternCategory = "Spaceship" | "Oscillator" | "Gun" | "Methuselah" | "Still Life";

export interface PresetPattern {
  name: string;
  category: PatternCategory;
  description: string;
  rle: string;
  grid: number[][];
}
