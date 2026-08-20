export type DocArticle = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  section: string;
  order: number;
  body: string;
};

type DocSection = {
  id: string;
  title: string;
  description: string;
};

const ENGLISH_SECTIONS = [
  {
    id: "start",
    title: "Start here",
    description:
      "Install cpak, understand its model, and run your first application.",
  },
  {
    id: "packages",
    title: "Build packages",
    description:
      "Create manifests, images, dependencies, SDKs, and reproducible releases.",
  },
  {
    id: "runtime",
    title: "Runtime and security",
    description:
      "Learn how isolation, permissions, brokers, and nested packages work.",
  },
  {
    id: "operations",
    title: "Operate cpak",
    description:
      "Manage updates, storage, diagnostics, recovery, and automation.",
  },
  {
    id: "project",
    title: "Contribute",
    description:
      "Find the right repository, test a change, and send it to the project.",
  },
] as const;

const SECTION_TRANSLATIONS = {
  es: [
    {
      id: "start",
      title: "Empieza aquí",
      description:
        "Instala cpak, comprende su modelo y ejecuta tu primera aplicación.",
    },
    {
      id: "packages",
      title: "Crear paquetes",
      description:
        "Crea manifests, imágenes, dependencias, SDK y versiones reproducibles.",
    },
    {
      id: "runtime",
      title: "Runtime y seguridad",
      description:
        "Descubre cómo funcionan el aislamiento, los permisos, los brokers y los paquetes anidados.",
    },
    {
      id: "operations",
      title: "Administrar cpak",
      description:
        "Gestiona actualizaciones, almacenamiento, diagnósticos, recuperación y automatización.",
    },
    {
      id: "project",
      title: "Contribuir",
      description:
        "Encuentra el repositorio adecuado, prueba un cambio y envíalo al proyecto.",
    },
  ],
  it: [
    {
      id: "start",
      title: "Inizia qui",
      description:
        "Installa cpak, comprendi il suo modello e avvia la tua prima applicazione.",
    },
    {
      id: "packages",
      title: "Crea pacchetti",
      description:
        "Crea manifest, immagini, dipendenze, SDK e release riproducibili.",
    },
    {
      id: "runtime",
      title: "Runtime e sicurezza",
      description:
        "Scopri come funzionano isolamento, permessi, broker e pacchetti annidati.",
    },
    {
      id: "operations",
      title: "Gestisci cpak",
      description:
        "Gestisci aggiornamenti, storage, diagnostica, ripristino e automazione.",
    },
    {
      id: "project",
      title: "Contribuisci",
      description:
        "Trova il repository corretto, verifica una modifica e inviala al progetto.",
    },
  ],
} as const;

export const docSections = ENGLISH_SECTIONS;

const sources = import.meta.glob("/src/content/docs/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const localizedSources = import.meta.glob(
  "/src/content/docs-localized/{es,it}/*.md",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
) as Record<string, string>;

function parseList(value: string) {
  return value
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseArticle(path: string, source: string): DocArticle {
  const slug = path.split("/").pop()?.replace(/\.md$/, "") ?? "";
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const frontmatter = match?.[1] ?? "";
  const body = match?.[2]?.trim() ?? source.trim();
  const fields = Object.fromEntries(
    frontmatter.split("\n").flatMap((line) => {
      const separator = line.indexOf(":");
      return separator === -1
        ? []
        : [[line.slice(0, separator).trim(), line.slice(separator + 1).trim()]];
    }),
  );

  return {
    slug,
    title: fields.title ?? slug,
    description: fields.description ?? "",
    tags: fields.tags ? parseList(fields.tags) : [],
    section: fields.section ?? "project",
    order: Number.parseInt(fields.order ?? "999", 10),
    body,
  };
}

function sortedArticles(
  entries: [string, string][],
  sections: readonly DocSection[] = ENGLISH_SECTIONS,
) {
  return entries
  .map(([path, source]) => parseArticle(path, source))
  .sort((left, right) => {
    const leftSection = sections.findIndex(
      (section) => section.id === left.section,
    );
    const rightSection = sections.findIndex(
      (section) => section.id === right.section,
    );
    return (
      leftSection - rightSection ||
      left.order - right.order ||
      left.title.localeCompare(right.title)
    );
  });
}

export const articles = sortedArticles(Object.entries(sources));

export const groupedArticles = docSections.map((section) => ({
  ...section,
  articles: articles.filter((article) => article.section === section.id),
}));

export function getLocalizedArticles(locale: "en" | "es" | "it") {
  if (locale === "en") return articles;
  return sortedArticles(
    Object.entries(localizedSources).filter(([path]) =>
      path.includes(`/docs-localized/${locale}/`),
    ),
    SECTION_TRANSLATIONS[locale],
  );
}

export function getGroupedArticles(locale: "en" | "es" | "it") {
  const localizedArticles = getLocalizedArticles(locale);
  const sections =
    locale === "en" ? ENGLISH_SECTIONS : SECTION_TRANSLATIONS[locale];
  return sections.map((section) => ({
    ...section,
    articles: localizedArticles.filter(
      (article) => article.section === section.id,
    ),
  }));
}

export function getArticle(slug: string, locale: "en" | "es" | "it" = "en") {
  return getLocalizedArticles(locale).find((article) => article.slug === slug);
}

export function getArticleNeighbors(
  slug: string,
  locale: "en" | "es" | "it" = "en",
) {
  const localizedArticles = getLocalizedArticles(locale);
  const index = localizedArticles.findIndex((article) => article.slug === slug);
  return {
    previous: index > 0 ? localizedArticles[index - 1] : null,
    next:
      index >= 0 && index < localizedArticles.length - 1
        ? localizedArticles[index + 1]
        : null,
  };
}

export { extractHeadings, renderMarkdown } from "./markdown";
