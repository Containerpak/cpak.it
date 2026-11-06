export const FLATHUB_API = "https://flathub.org/api/v2";
export const FLATHUB_PAGE_SIZE = 48;

export type FlathubSource = { category: string; subcategory?: string };

export const FLATHUB_SOURCES: Record<string, FlathubSource> = {
  Development: { category: "Development" },
  Education: { category: "Education" },
  Games: { category: "Game" },
  Graphics: { category: "Graphics" },
  Multimedia: { category: "AudioVideo" },
  Networking: { category: "Network" },
  Productivity: { category: "Office" },
  Science: { category: "Science" },
  System: { category: "System" },
  Utilities: { category: "Utility" },
  Web: { category: "Network", subcategory: "WebBrowser" },
};

export const FLATHUB_ONLY_CATEGORIES: Record<
  string,
  { icon: string; color: string; description: string }
> = {
  Education: {
    icon: "school",
    color: "#0ea5e9",
    description: "Learning tools, languages, maths and classroom software.",
  },
  Science: {
    icon: "science",
    color: "#14b8a6",
    description: "Research, astronomy, chemistry and data analysis tools.",
  },
};

export type FlathubApp = {
  id: string;
  name: string;
  summary: string;
  icon: string;
  developer: string;
  verified: boolean;
  installs: number;
};

export type FlathubPage = {
  apps: FlathubApp[];
  total: number;
  page: number;
  pages: number;
};

type FlathubHit = {
  app_id: string;
  name: string;
  summary?: string;
  icon?: string | null;
  developer_name?: string | null;
  verification_verified?: boolean;
  installs_last_month?: number;
};

const APP_ID = /^[A-Za-z][A-Za-z0-9_-]*(\.[A-Za-z0-9_-]+){2,}$/;

export function isFlathubAppId(id: string) {
  return id.length <= 255 && APP_ID.test(id);
}

export function flathubAppUrl(id: string) {
  return `/store/flathub/${id}`;
}

export function flathubInstallCommand(id: string) {
  return `cpak install --flatpak https://dl.flathub.org/repo/appstream/${id}.flatpakref`;
}

async function getJson(fetcher: typeof fetch, url: string) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetcher(url, {
        headers: { accept: "application/json" },
      });
      if (response.ok) return await response.json();
      if (response.status === 404) return null;
    } catch {}
  }
  return null;
}

export async function fetchFlathubCategory(
  fetcher: typeof fetch,
  source: FlathubSource,
  page = 1,
  perPage = FLATHUB_PAGE_SIZE,
): Promise<FlathubPage | null> {
  const base = `${FLATHUB_API}/collection/category/${encodeURIComponent(source.category)}`;
  const query = `page=${page}&per_page=${perPage}`;
  const url = source.subcategory
    ? `${base}/subcategories?subcategory=${encodeURIComponent(source.subcategory)}&${query}`
    : `${base}?${query}`;
  const body = await getJson(fetcher, url);
  if (!body || !Array.isArray(body.hits)) return null;
  return {
    apps: (body.hits as FlathubHit[])
      .filter((hit) => hit.app_id && isFlathubAppId(hit.app_id) && hit.icon)
      .map((hit) => ({
        id: hit.app_id,
        name: hit.name,
        summary: hit.summary ?? "",
        icon: hit.icon ?? "",
        developer: hit.developer_name ?? "",
        verified: Boolean(hit.verification_verified),
        installs: hit.installs_last_month ?? 0,
      })),
    total: body.totalHits ?? 0,
    page: body.page ?? page,
    pages: body.totalPages ?? 1,
  };
}

export async function fetchFlathubAppstream(fetcher: typeof fetch, id: string) {
  if (!isFlathubAppId(id)) return null;
  return getJson(fetcher, `${FLATHUB_API}/appstream/${encodeURIComponent(id)}`);
}

export function normalizeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export type TextBlock =
  | { kind: "p"; text: string }
  | { kind: "ul" | "ol"; items: string[] };

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function plain(html: string) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x?[0-9a-fA-F]+|[a-z]+);/g, (whole, name: string) => {
      if (name.startsWith("#x")) return String.fromCodePoint(parseInt(name.slice(2), 16));
      if (name.startsWith("#")) return String.fromCodePoint(parseInt(name.slice(1), 10));
      return ENTITIES[name] ?? whole;
    })
    .replace(/\s+/g, " ")
    .trim();
}

export function descriptionBlocks(html: string | null | undefined): TextBlock[] {
  if (!html) return [];
  const blocks: TextBlock[] = [];
  const pattern = /<(p|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  for (const match of html.matchAll(pattern)) {
    const tag = match[1].toLowerCase();
    if (tag === "p") {
      const text = plain(match[2]);
      if (text) blocks.push({ kind: "p", text });
      continue;
    }
    const items = [...match[2].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((item) => plain(item[1]))
      .filter(Boolean);
    if (items.length) blocks.push({ kind: tag as "ul" | "ol", items });
  }
  if (!blocks.length) {
    const text = plain(html);
    if (text) blocks.push({ kind: "p", text });
  }
  return blocks;
}

export function categoryForFlathub(categories: string[] | undefined) {
  for (const [name, source] of Object.entries(FLATHUB_SOURCES)) {
    if (source.subcategory) continue;
    if (categories?.includes(source.category)) return name;
  }
  return null;
}
