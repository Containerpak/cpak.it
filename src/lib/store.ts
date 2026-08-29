export const SITE_URL = "https://cpak.it";
export const RAW_STORE_INDEX =
  "https://raw.githubusercontent.com/Containerpak/store/main/index.json";
export const RAW_CATEGORIES_META =
  "https://raw.githubusercontent.com/Containerpak/store/main/categories.json";

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "AI-ML": "Local assistants, model tools and AI workspaces.",
  Database: "Database clients, query tools and data explorers.",
  "Desktop Environments":
    "Complete desktop sessions installed and managed as cpak packages.",
  Distributions:
    "Complete Linux distributions for persistent development environments.",
  Development: "Editors, IDEs, SDKs and tools for building software.",
  DevOps: "Infrastructure and operations tools for local and remote systems.",
  Games: "Games, launchers, emulators and gaming utilities.",
  Graphics: "Creative tools for images, 3D work and digital production.",
  Multimedia: "Audio, video, recording and media playback.",
  Networking: "Communication, remote access, syncing and network tools.",
  Productivity: "Writing, notes, office work and everyday organization.",
  Security: "Password managers and tools that protect your data.",
  System: "Hardware, virtualization and desktop system utilities.",
  Utilities: "Useful tools that do one job well.",
  Web: "Browsers and applications built around the web.",
};

export const CATEGORY_APPLICATION_TYPES: Record<string, string> = {
  "AI-ML": "UtilitiesApplication",
  Database: "DeveloperApplication",
  "Desktop Environments": "DesktopEnhancementApplication",
  Distributions: "UtilitiesApplication",
  Development: "DeveloperApplication",
  DevOps: "DeveloperApplication",
  Games: "GameApplication",
  Graphics: "DesignApplication",
  Multimedia: "MultimediaApplication",
  Networking: "CommunicationApplication",
  Productivity: "BusinessApplication",
  Security: "SecurityApplication",
  System: "UtilitiesApplication",
  Utilities: "UtilitiesApplication",
  Web: "BrowserApplication",
};

export type StoreEntry = {
  name: string;
  description?: string;
  branch?: string;
  ref?: string;
  version?: string;
  commit?: string;
  release?: string;
  architectures?: Array<"amd64" | "arm64">;
  manifest: string;
};

export type StoreIndex = Record<string, Record<string, StoreEntry>>;

export type CategoryMeta = {
  icon: string;
  color: string;
};

export type CategoriesMeta = Record<string, CategoryMeta>;

export function packageSlug(origin: string) {
  return (
    origin
      .split("/")
      .at(-1)
      ?.replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() ?? ""
  );
}

export function parseOrigin(origin: string) {
  const [host, owner, repo] = origin.split("/");
  return { host, owner, repo };
}

export function repositoryUrl(origin: string) {
  const { host, owner, repo } = parseOrigin(origin);
  return host && owner && repo ? `https://${host}/${owner}/${repo}` : null;
}

export function storeAssetBase(manifest: string) {
  return manifest.replace(/\/[^/]+$/, "");
}

async function fetchStoreFile(fetcher: typeof fetch, url: string) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetcher(url);
      if (response.ok) return response;
    } catch {}
  }
  return null;
}

export async function fetchStore(fetcher: typeof fetch) {
  const [indexResponse, categoriesResponse] = await Promise.all([
    fetchStoreFile(fetcher, RAW_STORE_INDEX),
    fetchStoreFile(fetcher, RAW_CATEGORIES_META),
  ]);
  if (!indexResponse || !categoriesResponse) return null;
  return {
    index: (await indexResponse.json()) as StoreIndex,
    categories: (await categoriesResponse.json()) as CategoriesMeta,
  };
}

export function findPackageBySlug(index: StoreIndex, slug: string) {
  const matches = Object.entries(index).flatMap(([category, entries]) =>
    Object.entries(entries)
      .filter(([origin]) => packageSlug(origin) === slug)
      .map(([origin, entry]) => ({ category, origin, entry })),
  );
  return matches.length === 1 ? matches[0] : null;
}

export function findPackageByOrigin(index: StoreIndex, origin: string) {
  for (const [category, entries] of Object.entries(index)) {
    const entry = entries[origin];
    if (entry) return { category, origin, entry };
  }
  return null;
}

export function packageUrl(origin: string) {
  return `/store/apps/${packageSlug(origin)}`;
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
