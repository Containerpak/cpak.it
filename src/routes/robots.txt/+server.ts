import type { RequestHandler } from "./$types";
import { SITE_URL } from "$lib/store";

export const GET: RequestHandler = () =>
  new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
    { headers: { "content-type": "text/plain; charset=utf-8" } },
  );
