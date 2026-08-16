import type { RequestHandler } from "./$types";
import { SITE_URL } from "$lib/store";

export const GET: RequestHandler = () => {
  const sections = ["pages", "docs", "announcements", "categories", "apps"];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sections.map((section) => `\n  <sitemap><loc>${SITE_URL}/sitemaps/${section}.xml</loc></sitemap>`).join("")}\n</sitemapindex>\n`;
  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
    },
  });
};
