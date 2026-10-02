import { heightFor, thicknessFor } from "./palette";
import type { Book } from "./types";

export const SHELF = {
  maxPerRow: 7,
  maxWidth: 1.12,
  rowPitch: 1.18,
  minRows: 2,
  maxRows: 4,
  post: 0.065,
  plinth: 0.16,
  board: 0.045,
  gap: 0.014,
  bookDepth: 0.62,
  caseGap: 0.46,
};

export type PlacedBook = {
  book: Book;
  x: number;
  y: number;
  thickness: number;
  height: number;
  lean: number;
};

export type ShelfRow = {
  books: PlacedBook[];
  boardY: number;
};

export type BookcaseLayout = {
  id: string;
  label: string;
  x: number;
  width: number;
  height: number;
  rows: ShelfRow[];
};

const INNER_LEFT = SHELF.post + 0.03;

export function caseWidth() {
  return SHELF.maxWidth + SHELF.post * 2 + 0.06;
}

export function caseHeight(rowCount: number) {
  return SHELF.plinth + rowCount * SHELF.rowPitch + 0.2;
}

function pack(books: Book[]): Book[][] {
  const rows: Book[][] = [];
  let cur: Book[] = [];
  let used = 0;
  for (const book of books) {
    const t = thicknessFor(book.pages);
    const overflows =
      cur.length >= SHELF.maxPerRow || (cur.length > 0 && used + t > SHELF.maxWidth);
    if (overflows) {
      rows.push(cur);
      cur = [];
      used = 0;
    }
    cur.push(book);
    used += t + SHELF.gap;
  }
  if (cur.length) rows.push(cur);
  return rows;
}

function placeRow(books: Book[], boardTop: number): PlacedBook[] {
  if (!books.length) return [];
  const thicknesses = books.map((b) => thicknessFor(b.pages));
  const total =
    thicknesses.reduce((s, w) => s + w, 0) + SHELF.gap * Math.max(0, books.length - 1);
  let x = INNER_LEFT + Math.max(0, (SHELF.maxWidth - total) / 2);
  return books.map((book, index) => {
    const thickness = thicknesses[index]!;
    const height = heightFor(book.id);
    const placed: PlacedBook = {
      book,
      x: x + thickness / 2,
      y: boardTop + height / 2,
      thickness,
      height,
      lean: index === books.length - 1 && books.length > 3 ? 0.045 : 0,
    };
    x += thickness + SHELF.gap;
    return placed;
  });
}

export function layoutBookcases(
  groups: { id: string; label: string; books: Book[] }[],
): BookcaseLayout[] {
  const packed = groups.map((group) => {
    const rows = pack(group.books);
    const chunks: Book[][][] = [];
    const source = rows.length ? rows : [[]];
    for (let i = 0; i < source.length; i += SHELF.maxRows) {
      chunks.push(source.slice(i, i + SHELF.maxRows));
    }
    return { ...group, chunks };
  });

  const target = Math.min(
    SHELF.maxRows,
    Math.max(SHELF.minRows, ...packed.flatMap((g) => g.chunks.map((c) => c.length))),
  );

  const width = caseWidth();
  const cases: BookcaseLayout[] = [];
  let cursor = 0;

  for (const group of packed) {
    group.chunks.forEach((chunk, index) => {
      const rows = chunk.slice();
      while (rows.length < target) rows.push([]);
      const laid: ShelfRow[] = rows.map((books, rowIndex) => {
        const fromBottom = rows.length - 1 - rowIndex;
        const boardTop = SHELF.plinth + fromBottom * SHELF.rowPitch;
        return { books: placeRow(books, boardTop), boardY: boardTop };
      });
      cases.push({
        id: index === 0 ? group.id : `${group.id}-${index + 1}`,
        label: index === 0 ? group.label : `${group.label} ${index + 1}`,
        x: cursor,
        width,
        height: caseHeight(rows.length),
        rows: laid,
      });
      cursor += width + SHELF.caseGap;
    });
  }

  if (!cases.length) return cases;
  const total = cursor - SHELF.caseGap;
  const shift = -total / 2;
  for (const item of cases) item.x += shift;
  return cases;
}

export function booksInOrder(cases: BookcaseLayout[]) {
  return cases.flatMap((c) => c.rows.flatMap((r) => r.books.map((p) => p.book)));
}
