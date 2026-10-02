import type { Book } from "./types";

export function libraryStats(books: Book[], goal: number) {
  const year = String(new Date().getFullYear());
  const finished = books.filter((b) => b.status === "read");
  const thisYear = finished.filter((b) => b.finishedOn?.startsWith(year));
  const rated = books.filter((b) => b.rating);
  const avg = rated.length
    ? rated.reduce((sum, b) => sum + (b.rating ?? 0), 0) / rated.length
    : null;
  const pages = finished.reduce((sum, b) => sum + (b.pages ?? 0), 0);
  const pagesYear = thisYear.reduce((sum, b) => sum + (b.pages ?? 0), 0);
  const dist = [1, 2, 3, 4, 5].map((n) => ({
    n,
    count: rated.filter((b) => b.rating === n).length,
  }));
  const counts = new Map<string, number>();
  for (const book of books) counts.set(book.author, (counts.get(book.author) ?? 0) + 1);
  const authors = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return {
    total: books.length,
    finished: finished.length,
    reading: books.filter((b) => b.status === "reading").length,
    want: books.filter((b) => b.status === "want").length,
    dnf: books.filter((b) => b.status === "dnf").length,
    loved: rated.filter((b) => b.rating === 5).length,
    thisYear: thisYear.length,
    goal,
    avg,
    pages,
    pagesYear,
    dist,
    authors,
    recent: [...finished]
      .filter((b) => b.finishedOn)
      .sort((a, b) => (b.finishedOn ?? "").localeCompare(a.finishedOn ?? ""))
      .slice(0, 5),
  };
}
