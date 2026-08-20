export type DocArticle = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  section: string;
  order: number;
  body: string;
};

export const docSections = [
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

const sources = import.meta.glob("/src/content/docs/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

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

export const articles = Object.entries(sources)
  .map(([path, source]) => parseArticle(path, source))
  .sort((left, right) => {
    const leftSection = docSections.findIndex(
      (section) => section.id === left.section,
    );
    const rightSection = docSections.findIndex(
      (section) => section.id === right.section,
    );
    return (
      leftSection - rightSection ||
      left.order - right.order ||
      left.title.localeCompare(right.title)
    );
  });

export const groupedArticles = docSections.map((section) => ({
  ...section,
  articles: articles.filter((article) => article.section === section.id),
}));

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getArticleNeighbors(slug: string) {
  const index = articles.findIndex((article) => article.slug === slug);
  return {
    previous: index > 0 ? articles[index - 1] : null,
    next:
      index >= 0 && index < articles.length - 1 ? articles[index + 1] : null,
  };
}

export { extractHeadings, renderMarkdown } from "./markdown";
