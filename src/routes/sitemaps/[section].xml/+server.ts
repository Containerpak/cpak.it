import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { announcements } from "$lib/announcements";
import { articles } from "$lib/docs";
import { SITE_URL, fetchStore, packageSlug } from "$lib/store";

type SitemapEntry = { path: string; lastmod?: string; priority?: string };

function escapeXml(value: string) {
  return value.replace(
    /[<>&'\"]/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[character] ?? character,
  );
}

function render(entries: SitemapEntry[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map((entry) => `\n  <url><loc>${escapeXml(`${SITE_URL}${entry.path}`)}</loc>${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ""}${entry.priority ? `<priority>${entry.priority}</priority>` : ""}</url>`).join("")}\n</urlset>\n`;
}

export const GET: RequestHandler = async ({ fetch, params }) => {
  let entries: SitemapEntry[];
  switch (params.section) {
    case "pages":
      entries = [
        { path: "/", priority: "1.0" },
        { path: "/store", priority: "0.9" },
        { path: "/docs", priority: "0.9" },
        { path: "/announcements", priority: "0.8" },
        { path: "/support" },
        { path: "/branding" },
        { path: "/branding/presskit" },
        { path: "/branding/guidelines" },
        { path: "/branding/badges" },
        { path: "/legal/privacy", priority: "0.3" },
        { path: "/legal/terms", priority: "0.3" },
      ];
      break;
    case "docs":
      entries = articles.map((article) => ({ path: `/docs/${article.slug}` }));
      break;
    case "announcements":
      entries = announcements.map((announcement) => ({
        path: announcement.href,
        lastmod: announcement.published,
      }));
      break;
    case "categories": {
      const store = await fetchStore(fetch);
      if (!store) error(502, "The Store catalog is temporarily unavailable");
      entries = Object.keys(store.index).map((category) => ({
        path: `/store/${encodeURIComponent(category)}`,
        priority: "0.8",
      }));
      break;
    }
    case "apps": {
      const store = await fetchStore(fetch);
      if (!store) error(502, "The Store catalog is temporarily unavailable");
      entries = Object.values(store.index).flatMap((packages) =>
        Object.keys(packages).map((origin) => ({
          path: `/store/apps/${packageSlug(origin)}`,
          priority: "0.8",
        })),
      );
      break;
    }
    default:
      error(404, "Sitemap not found");
  }

  return new Response(render(entries), {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
    },
  });
};
