import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import {
  CATEGORY_DESCRIPTIONS,
  SITE_URL,
  fetchStore,
  jsonLd,
  packageSlug,
  storeAssetBase,
} from "$lib/store";
import { FLATHUB_ONLY_CATEGORIES } from "$lib/flathub";

export const load: PageLoad = async ({ data, fetch, setHeaders }) => {
  const store = await fetchStore(fetch);
  if (!store) error(502, "The Store catalog is temporarily unavailable");

  const flathub = data.flathub ?? {};
  const metas = {
    ...Object.fromEntries(
      Object.entries(FLATHUB_ONLY_CATEGORIES).map(([name, meta]) => [
        name,
        { icon: meta.icon, color: meta.color },
      ]),
    ),
    ...store.categories,
  };
  const categories = Object.entries(metas)
    .map(([name, meta]) => {
      const entries = store.index[name] ?? {};
      const origins = Object.keys(entries);
      const cpakIcons = origins.map(
        (origin) => `${storeAssetBase(entries[origin].manifest)}/icon.svg`,
      );
      return {
        name,
        icon: meta.icon,
        color: meta.color,
        count: origins.length,
        flathubCount: flathub[name]?.count ?? 0,
        appIcons: [...cpakIcons, ...(flathub[name]?.icons ?? [])].slice(0, 8),
        description:
          CATEGORY_DESCRIPTIONS[name] ??
          FLATHUB_ONLY_CATEGORIES[name]?.description ??
          "Browse packages in this category.",
      };
    })
    .filter((category) => category.count + category.flathubCount > 0)
    .sort((left, right) => right.count - left.count || right.flathubCount - left.flathubCount)
    .map((category, index) => ({ ...category, featured: index === 0 }));

  const packages = Object.entries(store.index).flatMap(([category, entries]) =>
    Object.entries(entries).map(([origin, entry]) => ({
      category,
      name: entry.name,
      slug: packageSlug(origin),
    })),
  );
  const schema = jsonLd({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "cpak Store",
    description:
      "Browse Linux desktop applications, developer tools, games and complete environments distributed with cpak.",
    url: `${SITE_URL}/store`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: packages.length,
      itemListElement: packages.map((pkg, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: pkg.name,
        url: `${SITE_URL}/store/apps/${pkg.slug}`,
      })),
    },
  });

  setHeaders({ "cache-control": "public, max-age=300, s-maxage=3600" });
  const flathubCount = Object.values(flathub).reduce((sum, item) => sum + item.count, 0);
  return { categories, packageCount: packages.length, flathubCount, schema };
};
