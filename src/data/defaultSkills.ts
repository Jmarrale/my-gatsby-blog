import type { Belt } from "./types";

// Starter curriculum used both to seed local sample data and to populate a
// new owner's catalog on first cloud login. The owner can extend this later.
export const DEFAULT_SKILLS: { name: string; category: string; beltLevel: Belt; sort: number }[] = [
  { name: "Shrimp / hip escape", category: "Movement", beltLevel: "White", sort: 1 },
  { name: "Bridge & roll (upa)", category: "Escapes", beltLevel: "White", sort: 2 },
  { name: "Closed guard control", category: "Guard", beltLevel: "White", sort: 3 },
  { name: "Scissor sweep", category: "Sweeps", beltLevel: "White", sort: 4 },
  { name: "Knee-cut pass", category: "Passing", beltLevel: "Blue", sort: 5 },
  { name: "Triangle from guard", category: "Submissions", beltLevel: "Blue", sort: 6 },
  { name: "Single-leg takedown", category: "Takedowns", beltLevel: "Blue", sort: 7 },
  { name: "Back take from turtle", category: "Back", beltLevel: "Purple", sort: 8 },
];
