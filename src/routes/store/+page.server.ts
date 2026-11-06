import type { PageServerLoad } from "./$types";
import { FLATHUB_SOURCES, fetchFlathubCategory } from "$lib/flathub";

export const load: PageServerLoad = async ({ fetch }) => {
  const entries = await Promise.all(
    Object.entries(FLATHUB_SOURCES).map(async ([name, source]) => {
      const page = await fetchFlathubCategory(fetch, source, 1, 8);
      return [
        name,
        page ? { count: page.total, icons: page.apps.map((app) => app.icon) } : null,
      ] as const;
    }),
  );
  return {
    flathub: Object.fromEntries(entries.filter(([, value]) => value)) as Record<
      string,
      { count: number; icons: string[] }
    >,
  };
};
