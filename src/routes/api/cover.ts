import { createFileRoute } from "@tanstack/react-router";

function targetFor(url: URL) {
  const size = url.searchParams.get("size") === "M" ? "M" : "L";
  const id = (url.searchParams.get("id") ?? "").replace(/\D/g, "");
  const isbn = (url.searchParams.get("isbn") ?? "").replace(/[^0-9Xx]/g, "");
  if (id) return `https://covers.openlibrary.org/b/id/${id}-${size}.jpg`;
  if (isbn) return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
  return null;
}

export const Route = createFileRoute("/api/cover")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const target = targetFor(new URL(request.url));
        if (!target) return new Response("Missing cover", { status: 400 });
        try {
          const res = await fetch(target);
          if (!res.ok) return new Response("No cover", { status: 404 });
          const bytes = await res.arrayBuffer();
          if (bytes.byteLength < 800) return new Response("No cover", { status: 404 });
          return new Response(bytes, {
            headers: {
              "content-type": res.headers.get("content-type") || "image/jpeg",
              "cache-control": "public, max-age=86400",
            },
          });
        } catch {
          return new Response("Cover failed", { status: 502 });
        }
      },
    },
  },
});
