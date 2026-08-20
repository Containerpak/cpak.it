import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import {
  CATEGORY_APPLICATION_TYPES,
  CATEGORY_DESCRIPTIONS,
  SITE_URL,
  fetchStore,
  findPackageByOrigin,
  findPackageBySlug,
  jsonLd,
  packageSlug,
  repositoryUrl,
  storeAssetBase,
} from "$lib/store";

type CpakSpec = {
  version: string;
  description?: string;
  image: string;
  binaries: string[];
  desktop_entries: string[];
  dependencies: Array<string | { origin: string }>;
  addons: string[];
  override: Record<string, unknown>;
};

export const load: PageLoad = async ({ fetch, params, setHeaders }) => {
  const store = await fetchStore(fetch);
  if (!store) error(502, "The Store catalog is temporarily unavailable");

  const match = findPackageBySlug(store.index, params.slug);
  if (!match) error(404, "Package not found");

  const manifestResponse = await fetch(match.entry.manifest);
  if (!manifestResponse.ok)
    error(502, "The package manifest is temporarily unavailable");
  const manifest = (await manifestResponse.json()) as {
    branch?: string;
    commit?: string;
    release?: string;
    description?: string;
  };

  const ref = manifest.branch ?? manifest.commit ?? manifest.release;
  const repoUrl = repositoryUrl(match.origin);
  if (!ref || !repoUrl) error(502, "The package source is incomplete");

  const cpakUrl = `${repoUrl.replace("https://github.com/", "https://raw.githubusercontent.com/")}/${ref}/cpak.json`;
  const cpakResponse = await fetch(cpakUrl);
  if (!cpakResponse.ok)
    error(502, "The package specification is temporarily unavailable");
  const cpak = (await cpakResponse.json()) as CpakSpec;
  cpak.binaries ??= [];
  cpak.desktop_entries ??= [];
  cpak.dependencies ??= [];
  cpak.addons ??= [];
  cpak.override ??= {};

  const storeReadmeUrl = manifest.release
    ? `${repoUrl.replace("https://github.com/", "https://raw.githubusercontent.com/")}/${manifest.release}/STORE-README.md`
    : null;
  let storeReadme: string | null = null;
  if (storeReadmeUrl) {
    try {
      const storeReadmeResponse = await fetch(storeReadmeUrl);
      if (storeReadmeResponse.ok)
        storeReadme = (await storeReadmeResponse.text()).slice(0, 100_000);
    } catch {
      storeReadme = null;
    }
  }

  const assetBase = storeAssetBase(match.entry.manifest);
  const media = await Promise.all([
    fetch(`${assetBase}/showcase.webm`, { method: "HEAD" }),
    ...Array.from({ length: 10 }, (_, index) =>
      fetch(`${assetBase}/screenshot-${index + 1}.webp`, { method: "HEAD" }),
    ),
  ]);
  const showcase = media[0].ok ? `${assetBase}/showcase.webm` : null;
  const screenshots = media
    .slice(1)
    .flatMap((response, index) =>
      response.ok ? [`${assetBase}/screenshot-${index + 1}.webp`] : [],
    );

  const description =
    manifest.description?.trim() ||
    match.entry.description?.trim() ||
    cpak.description?.trim() ||
    `Install ${match.entry.name} on Linux with cpak.`;
  const canonicalPath = `/store/apps/${params.slug}`;
  const categoryMeta = store.categories[match.category] ?? {
    icon: "inventory_2",
    color: "#64748b",
  };
  const related = Object.entries(store.index[match.category] ?? {})
    .filter(([origin]) => origin !== match.origin)
    .slice(0, 3)
    .map(([origin, entry]) => ({
      name: entry.name,
      description: entry.description ?? "",
      slug: packageSlug(origin),
      icon: `${storeAssetBase(entry.manifest)}/icon.svg`,
    }));
  const dependencyLinks = Object.fromEntries(
    cpak.dependencies.flatMap((dependency) => {
      const origin =
        typeof dependency === "string" ? dependency : dependency.origin;
      const dependencyMatch = findPackageByOrigin(store.index, origin);
      return dependencyMatch ? [[origin, packageSlug(origin)]] : [];
    }),
  );
  const canonical = `${SITE_URL}${canonicalPath}`;
  const icon = `${assetBase}/icon.svg`;
  const schema = jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${canonical}#application`,
        name: match.entry.name,
        description,
        url: canonical,
        image: icon,
        screenshot: screenshots,
        operatingSystem: "Linux",
        applicationCategory:
          CATEGORY_APPLICATION_TYPES[match.category] ?? "UtilitiesApplication",
        softwareVersion: cpak.version,
        downloadUrl: `${SITE_URL}/install/${match.origin}`,
        installUrl: canonical,
        codeRepository: repoUrl,
        softwareRequirements: "cpak on Linux",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0" },
        provider: {
          "@type": "Organization",
          name: "cpak",
          url: SITE_URL,
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
            name: match.category,
            item: `${SITE_URL}/store/${encodeURIComponent(match.category)}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: match.entry.name,
            item: canonical,
          },
        ],
      },
    ],
  });

  setHeaders({ "cache-control": "public, max-age=300, s-maxage=3600" });

  return {
    category: match.category,
    categoryDescription:
      CATEGORY_DESCRIPTIONS[match.category] ??
      "Linux applications packaged for cpak.",
    categoryMeta,
    canonicalPath,
    schema,
    related,
    dependencyLinks,
    pkg: {
      origin: match.origin,
      name: match.entry.name,
      description,
      version: cpak.version,
      manifest: match.entry.manifest,
      cpak,
      icon,
      screenshots,
      showcase,
      repository: repoUrl,
      rawCpakJson: cpakUrl,
      storeReadme,
      storeReadmeUrl: storeReadme ? storeReadmeUrl : null,
    },
  };
};
