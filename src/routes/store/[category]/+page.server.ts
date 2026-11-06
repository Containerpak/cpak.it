import type { PageServerLoad } from "./$types";
import { FLATHUB_SOURCES, fetchFlathubCategory } from "$lib/flathub";

export const load: PageServerLoad = async ({ fetch, params, url }) => {
  const source = FLATHUB_SOURCES[params.category];
  if (!source) return { flathub: null };
  const requested = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(requested) && requested > 0 ? Math.min(requested, 500) : 1;
  return { flathub: await fetchFlathubCategory(fetch, source, page) };
};
