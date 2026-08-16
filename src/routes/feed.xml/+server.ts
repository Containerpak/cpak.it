import type { RequestHandler } from "./$types";
import { announcements } from "$lib/announcements";
import { SITE_URL } from "$lib/store";

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

export const GET: RequestHandler = () => {
  const items = announcements
    .map(
      (announcement) => `
    <item>
      <title>${escapeXml(announcement.title)}</title>
      <link>${SITE_URL}${announcement.href}</link>
      <guid>${SITE_URL}${announcement.href}</guid>
      <pubDate>${new Date(`${announcement.published}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(announcement.description)}</description>
    </item>`,
    )
    .join("");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>cpak announcements</title>
  <link>${SITE_URL}/announcements</link>
  <description>News and release notes from the cpak project.</description>${items}
</channel></rss>\n`;
  return new Response(body, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
    },
  });
};
