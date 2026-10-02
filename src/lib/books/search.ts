import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SearchHit } from "./types";

type RawDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  number_of_pages_median?: number;
  isbn?: string[];
  subject?: string[];
};

export const searchCatalog = createServerFn({ method: "GET" })
  .validator(z.object({ q: z.string().trim().min(1).max(140) }))
  .handler(async ({ data }): Promise<SearchHit[]> => {
    const url = new URL("https://openlibrary.org/search.json");
    url.searchParams.set("q", data.q);
    url.searchParams.set("limit", "8");
    url.searchParams.set(
      "fields",
      "key,title,author_name,first_publish_year,cover_i,number_of_pages_median,isbn,subject",
    );
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error("The catalog didn't respond.");
    const json = (await res.json()) as { docs?: RawDoc[] };
    return (json.docs ?? [])
      .map((doc) => {
        const isbns = doc.isbn ?? [];
        const isbn13 = isbns.find((isbn) => isbn.replace(/-/g, "").length === 13) ?? isbns[0] ?? null;
        const pages = doc.number_of_pages_median ? Math.round(doc.number_of_pages_median) : null;
        return {
          key: doc.key ?? "",
          title: (doc.title ?? "").trim(),
          author: doc.author_name?.[0]?.trim() || "Unknown",
          year: doc.first_publish_year ?? null,
          pages: pages && pages > 0 && pages < 10000 ? pages : null,
          isbn: isbn13,
          coverId: doc.cover_i ?? null,
          subjects: (doc.subject ?? []).filter((subject) => subject.length < 28).slice(0, 3),
        };
      })
      .filter((hit) => hit.title.length > 0);
  });
