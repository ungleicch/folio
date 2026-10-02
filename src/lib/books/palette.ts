import type { Book } from "./types";

export const CLOTHS = [
  "#7a2e2e",
  "#1e3a5f",
  "#1e4d3a",
  "#8a5a32",
  "#2e3138",
  "#6e2142",
  "#0f4c5c",
  "#5c3d5e",
  "#8c3a2f",
  "#1a365d",
  "#3f4a34",
  "#6b4423",
  "#3e5c76",
  "#234237",
  "#5c4a32",
  "#243044",
];

export const SCENE = {
  light: {
    wall: "#e7e0d6",
    floor: "#d5cdc2",
    wood: "#8d5e3c",
    frame: "#5c3b28",
    back: "#4a3224",
    plaque: "#f4efe6",
    plaqueInk: "#3a3128",
  },
  dark: {
    wall: "#241f1b",
    floor: "#1a1613",
    wood: "#6b4a32",
    frame: "#3d291c",
    back: "#2a1c14",
    plaque: "#3a3128",
    plaqueInk: "#f3efe6",
  },
};

export function clothFor(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return CLOTHS[(h >>> 0) % CLOTHS.length]!;
}

export function clothOf(book: Pick<Book, "id" | "cloth">) {
  return book.cloth || clothFor(book.id);
}

export function inkFor(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return l > 0.62 ? "#1c1c1e" : "#f6f1e6";
}

export function thicknessFor(pages: number | null) {
  const p = pages && pages > 0 ? pages : 320;
  return Math.min(0.19, Math.max(0.078, 0.058 + (p / 800) * 0.11));
}

export function heightFor(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return 0.96 + ((h >>> 0) % 7) * 0.01;
}
