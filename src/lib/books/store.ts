import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { seedBooks, seedShelves } from "./seed";
import type { Book, Shelf, SortKey, ViewMode } from "./types";

type LibraryData = {
  books: Book[];
  shelves: Shelf[];
  goal: number;
  sort: SortKey;
  view: ViewMode;
  samplesCleared: boolean;
};

type LibraryState = LibraryData & {
  addBook: (input: Omit<Book, "id" | "sample" | "createdAt" | "updatedAt">) => string;
  updateBook: (id: string, patch: Partial<Book>) => void;
  removeBook: (id: string) => void;
  addShelf: (name: string) => string;
  renameShelf: (id: string, name: string) => void;
  removeShelf: (id: string) => boolean;
  clearSamples: () => void;
  setGoal: (goal: number) => void;
  setSort: (sort: SortKey) => void;
  setView: (view: ViewMode) => void;
  replaceAll: (data: Partial<LibraryData>) => void;
};

function nowISO() {
  return new Date().toISOString();
}

export const useLibrary = create<LibraryState>()(
  persist(
    (set, get) => ({
      books: seedBooks,
      shelves: seedShelves,
      goal: 12,
      sort: "added",
      view: "shelves",
      samplesCleared: false,
      addBook: (input) => {
        const id = crypto.randomUUID();
        const stamp = nowISO();
        const book: Book = { ...input, id, sample: false, createdAt: stamp, updatedAt: stamp };
        set((s) => ({ books: [...s.books, book] }));
        return id;
      },
      updateBook: (id, patch) =>
        set((s) => ({
          books: s.books.map((book) =>
            book.id === id ? { ...book, ...patch, id, sample: false, updatedAt: nowISO() } : book,
          ),
        })),
      removeBook: (id) => set((s) => ({ books: s.books.filter((book) => book.id !== id) })),
      addShelf: (name) => {
        const id = crypto.randomUUID();
        const shelf: Shelf = { id, name: name.trim() || "Untitled shelf", sample: false, createdAt: nowISO() };
        set((s) => ({ shelves: [...s.shelves, shelf] }));
        return id;
      },
      renameShelf: (id, name) =>
        set((s) => ({
          shelves: s.shelves.map((shelf) =>
            shelf.id === id ? { ...shelf, name: name.trim() || shelf.name, sample: false } : shelf,
          ),
        })),
      removeShelf: (id) => {
        const { shelves, books } = get();
        if (shelves.length <= 1) return false;
        const fallback = shelves.find((shelf) => shelf.id !== id)?.id;
        if (!fallback) return false;
        set({
          shelves: shelves.filter((shelf) => shelf.id !== id),
          books: books.map((book) => (book.shelfId === id ? { ...book, shelfId: fallback } : book)),
        });
        return true;
      },
      clearSamples: () =>
        set((s) => {
          const books = s.books.filter((book) => !book.sample);
          let shelves = s.shelves.filter(
            (shelf) => !shelf.sample || books.some((book) => book.shelfId === shelf.id),
          );
          if (!shelves.length) {
            shelves = [{ id: crypto.randomUUID(), name: "Library", sample: false, createdAt: nowISO() }];
          }
          const ids = new Set(shelves.map((shelf) => shelf.id));
          const home = shelves[0]!.id;
          return {
            books: books.map((book) => (ids.has(book.shelfId) ? book : { ...book, shelfId: home })),
            shelves,
            samplesCleared: true,
          };
        }),
      setGoal: (goal) => set({ goal: Math.min(200, Math.max(1, Math.round(goal))) }),
      setSort: (sort) => set({ sort }),
      setView: (view) => set({ view }),
      replaceAll: (data) =>
        set((s) => ({
          books: data.books ?? s.books,
          shelves: data.shelves?.length ? data.shelves : s.shelves,
          goal: data.goal ?? s.goal,
          sort: data.sort ?? s.sort,
          view: data.view ?? s.view,
          samplesCleared: true,
        })),
    }),
    {
      name: "folio-library-v1",
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        books: s.books,
        shelves: s.shelves,
        goal: s.goal,
        sort: s.sort,
        view: s.view,
        samplesCleared: s.samplesCleared,
      }),
    },
  ),
);
