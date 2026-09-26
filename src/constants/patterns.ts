import { parseRLE } from "@/lib/rle-parser";
import type { CellCoordinate, PresetPattern } from "@/types";

const patternCoordinateCache = new Map<string, CellCoordinate[]>();

function p(
  name: string,
  category: PresetPattern["category"],
  description: string,
  rle: string,
): PresetPattern {
  return {
    name,
    category,
    description,
    rle,
    get grid(): CellCoordinate[] {
      let cached = patternCoordinateCache.get(rle);
      if (!cached) {
        cached = parseRLE(rle).grid;
        patternCoordinateCache.set(rle, cached);
      }
      return cached;
    },
  };
}

export const PATTERN_PRESETS: PresetPattern[] = [
  // Spaceships
  p(
    "Glider",
    "Spaceship",
    "The smallest spaceship; travels diagonally across the grid every 4 ticks.",
    "x = 3, y = 3, rule = B3/S23\nbob$2bo$3o!",
  ),

  p(
    "Lightweight Spaceship",
    "Spaceship",
    "Flies horizontally across the board with period 4 (speed c/2).",
    "x = 5, y = 4, rule = B3/S23\nbo2bo$4bo$o3bo$b4o!",
  ),

  p(
    "Middleweight Spaceship",
    "Spaceship",
    "Medium-sized orthogonal spaceship travelling at half the speed of light.",
    "x = 6, y = 5, rule = B3/S23\n3bo2b$bo3bo$o5b$o4bo$6o!",
  ),

  p(
    "Heavyweight Spaceship",
    "Spaceship",
    "The largest of the standard trio of orthogonal spaceships.",
    "x = 7, y = 5, rule = B3/S23\n3b2o2b$bo4bo$o6b$o5bo$7o!",
  ),

  // Guns
  p(
    "Gosper Glider Gun",
    "Gun",
    "The first known gun; continuously creates gliders every 30 ticks.",
    "x = 36, y = 9, rule = B3/S23\n24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4bobo$18bo5bo$19bo3bo$20bobo!",
  ),

  p(
    "Simkin Glider Gun",
    "Gun",
    "Discovered in 2015; produces a glider every 120 generations.",
    "x = 33, y = 21, rule = B3/S23\n2o5b2o$2o5b2o4b$7b2o$7b2o16b$25b2o$25b2o5b2$10b2o3b2o$10bo5bo$11bo3bob$12b3o$13bo9b2$17b2o$17b2o4b2$21b2o$21b2o!",
  ),

  // Oscillators
  p(
    "Blinker",
    "Oscillator",
    "Smallest period 2 oscillator; alternates horizontal and vertical.",
    "x = 3, y = 1, rule = B3/S23\n3o!",
  ),

  p(
    "Toad",
    "Oscillator",
    "Period 2 oscillator composed of two parallel 3-cell bars.",
    "x = 4, y = 2, rule = B3/S23\nb3o$3ob!",
  ),

  p(
    "Beacon",
    "Oscillator",
    "Period 2 oscillator made of two touching diagonal blocks.",
    "x = 4, y = 4, rule = B3/S23\n2o2b$2o2b$2b2o$2b2o!",
  ),

  p(
    "Pulsar",
    "Oscillator",
    "Period 3 oscillator with an expansive symmetric pulse.",
    "x = 13, y = 13, rule = B3/S23\n2b3o3b3o2b$13b$o4bobo4bo$o4bobo4bo$o4bobo4bo$2b3o3b3o2b$13b$2b3o3b3o2b$o4bobo4bo$o4bobo4bo$o4bobo4bo$13b$2b3o3b3o2b!",
  ),

  p(
    "Pentadecathlon",
    "Oscillator",
    "Period 15 oscillator capable of reflecting gliders.",
    "x = 10, y = 3, rule = B3/S23\n2b6o2b$2ob4ob2o$2b6o2b!",
  ),

  p(
    "Figure Eight",
    "Oscillator",
    "Period 8 oscillator shaped like two interlocking 3x3 blocks.",
    "x = 6, y = 6, rule = B3/S23\n3o3b$3o3b$3o3b$3b3o$3b3o$3b3o!",
  ),

  p(
    "Kok's Galaxy",
    "Oscillator",
    "Period 8 rotating spiral galaxy with 4 distinct arms.",
    "x = 9, y = 9, rule = B3/S23\n6o2b$6o2b$2b2o4b$2b2o4b$2b2o4b$4b2o2b$4b2o2b$2b6o$2b6o!",
  ),

  p(
    "Octagon II",
    "Oscillator",
    "Period 5 circular oscillator with hypnotic pulsing symmetry.",
    "x = 8, y = 8, rule = B3/S23\n3b2o3b$2bo2bo2b$bo4bob$o6bo$o6bo$bo4bob$2bo2bo2b$3b2o3b!",
  ),

  // Still Lifes
  p(
    "Block",
    "Still Life",
    "The simplest 2x2 stable still life pattern.",
    "x = 2, y = 2, rule = B3/S23\n2o$2o!",
  ),

  p(
    "Beehive",
    "Still Life",
    "The second most common stable still life in Game of Life.",
    "x = 4, y = 3, rule = B3/S23\nb2ob$o2bo$b2ob!",
  ),

  p(
    "Loaf",
    "Still Life",
    "A 7-cell asymmetric still life resembling a loaf of bread.",
    "x = 4, y = 4, rule = B3/S23\nb2ob$o2bo$bobo$2bob!",
  ),

  p(
    "Boat",
    "Still Life",
    "A 5-cell still life with diagonal symmetry.",
    "x = 3, y = 3, rule = B3/S23\n2ob$obo$bob!",
  ),

  p(
    "Tub",
    "Still Life",
    "A 4-cell hollow still life with diagonal reflection symmetry.",
    "x = 3, y = 3, rule = B3/S23\nbob$obo$bob!",
  ),

  p(
    "Eater 1",
    "Still Life",
    "Classic fishhook still life that can consume oncoming gliders.",
    "x = 4, y = 4, rule = B3/S23\n2o2b$obob$2bob$2b2o!",
  ),

  // Methuselahs
  p(
    "Acorn",
    "Methuselah",
    "Takes 5,206 generations to stabilize and spawns 13 gliders.",
    "x = 7, y = 3, rule = B3/S23\nbo5b$3bob$2ob3o!",
  ),

  p(
    "R-pentomino",
    "Methuselah",
    "Only 5 cells, yet evolves for 1,103 generations creating 6 gliders.",
    "x = 3, y = 3, rule = B3/S23\nb2o$2ob$bo!",
  ),

  p(
    "Diehard",
    "Methuselah",
    "Eventually vanishes completely after exactly 130 generations.",
    "x = 8, y = 3, rule = B3/S23\n6bob$2o6b$bo3b3o!",
  ),

  p(
    "B-heptomino",
    "Methuselah",
    "A 7-cell methuselah that creates an active reaction for 148 ticks.",
    "x = 4, y = 3, rule = B3/S23\nb3o$3ob$bobo!",
  ),

  p(
    "Pi-heptomino",
    "Methuselah",
    "Resembles Greek letter Pi; evolves dynamically for 173 generations.",
    "x = 3, y = 3, rule = B3/S23\n3o$obo$obo!",
  ),
];

export const SPEED_PRESETS = [
  { label: "Slow (500ms)", ms: 500 },
  { label: "Medium (250ms)", ms: 250 },
  { label: "Fast (100ms)", ms: 100 },
  { label: "Hyper (40ms)", ms: 40 },
] as const;
