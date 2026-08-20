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

export const load: PageLoad = async ({ fetch, params, setHeaders }) => {
  const store = await fetchStore(fetch);
  if (!store) error(502, "The Store catalog is temporarily unavailable");

  const categoryMap = store.index[params.category];
  if (!categoryMap) error(404, "Category not found");
  const categoryMeta = store.categories[params.category] ?? {
    icon: "inventory_2",
    color: "#64748b",
  };

  const packages = Object.entries(categoryMap).map(([origin, entry]) => {
    const storeBase = storeAssetBase(entry.manifest);
    const icon = `${storeBase}/icon.svg`;

    return {
      origin,
      slug: packageSlug(origin),
      name: entry.name,
      description: entry.description?.trim() ?? "",
      version: entry.version ?? "",
      icon,
    };
  });

  const description =
    CATEGORY_DESCRIPTIONS[params.category] ??
    `Browse ${params.category} applications packaged for cpak.`;
  const path = `/store/${encodeURIComponent(params.category)}`;
  const schema = jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${params.category} applications for Linux`,
        description,
        url: `${SITE_URL}${path}`,
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
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Store",
            item: `${SITE_URL}/store`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: params.category,
            item: `${SITE_URL}${path}`,
          },
        ],
      },
    ],
  });

  setHeaders({ "cache-control": "public, max-age=300, s-maxage=3600" });
  return {
    category: params.category,
    categoryMeta,
    description,
    packages,
    path,
    schema,
  };
};
