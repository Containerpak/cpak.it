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

export const load: PageLoad = async ({ fetch, setHeaders }) => {
  const store = await fetchStore(fetch);
  if (!store) error(502, "The Store catalog is temporarily unavailable");

  const categories = Object.entries(store.categories)
    .map(([name, meta]) => {
      const entries = store.index[name] ?? {};
      const origins = Object.keys(entries);
      return {
        name,
        icon: meta.icon,
        color: meta.color,
        count: origins.length,
        appIcons: origins
          .slice(0, 8)
          .map(
            (origin) => `${storeAssetBase(entries[origin].manifest)}/icon.svg`,
          ),
        description:
          CATEGORY_DESCRIPTIONS[name] ?? "Browse packages in this category.",
      };
    })
    .sort((left, right) => right.count - left.count)
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
  return { categories, packageCount: packages.length, schema };
};
