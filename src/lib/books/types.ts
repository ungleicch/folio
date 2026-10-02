export type Status = "reading" | "read" | "want" | "dnf";

export type SortKey = "added" | "author" | "title" | "rating" | "finished";

export type ViewMode = "shelves" | "cards" | "list";

export type Book = {
  id: string;
  title: string;
  author: string;
  year: number | null;
  pages: number | null;
  isbn: string | null;
  coverId: number | null;
  olKey: string | null;
  shelfId: string;
  status: Status;
  rating: number | null;
  feeling: string;
  startedOn: string | null;
  finishedOn: string | null;
  progress: number | null;
  notes: string;
  quote: string;
  tags: string[];
  cloth: string | null;
  blurb: string;
  sample: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Shelf = {
  id: string;
  name: string;
  sample: boolean;
  createdAt: string;
};

export type Nav =
  | { kind: "all" }
  | { kind: "status"; status: Status }
  | { kind: "shelf"; id: string }
  | { kind: "author"; name: string }
  | { kind: "insights" };

export type SearchHit = {
  key: string;
  title: string;
  author: string;
  year: number | null;
  pages: number | null;
  isbn: string | null;
  coverId: number | null;
  subjects: string[];
};

export const STATUS_LABEL: Record<Status, string> = {
  reading: "Reading",
  read: "Finished",
  want: "Want to read",
  dnf: "Set aside",
};

export const RATING_LABEL = [
  "",
  "Didn't like it",
  "It was okay",
  "Liked it",
  "Really liked it",
  "Loved it",
];

export function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function coverSrc(
  book: { isbn: string | null; coverId: number | null },
  size: "M" | "L" = "L",
) {
  if (book.coverId) return `/api/cover?id=${book.coverId}&size=${size}`;
  if (book.isbn) return `/api/cover?isbn=${encodeURIComponent(book.isbn)}&size=${size}`;
  return null;
}

export function grokipediaUrl(title: string) {
  const slug = title
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s+/g, "_");
  return `https://grokipedia.com/page/${encodeURIComponent(slug)}`;
}
