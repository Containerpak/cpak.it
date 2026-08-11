export type DocArticle = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  section: string;
  order: number;
  body: string;
};

export type DocHeading = {
  id: string;
  title: string;
  level: number;
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

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isSafeLink(value: string) {
  return (
    value.startsWith("/") || value.startsWith("#") || /^https:\/\//.test(value)
  );
}

function renderInline(value: string) {
  const inlineCode: string[] = [];
  let html = escapeHtml(value).replace(/`([^`]+)`/g, (_, code) => {
    inlineCode.push(`<code>${code}</code>`);
    return `@@INLINE_${inlineCode.length - 1}@@`;
  });

  html = html
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
      const normalized = href.replaceAll("&amp;", "&");
      if (!isSafeLink(normalized)) return `${label} (${href})`;
      const external = normalized.startsWith("https://");
      return `<a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  return html.replace(
    /@@INLINE_(\d+)@@/g,
    (_, index) => inlineCode[Number(index)],
  );
}

export function extractHeadings(markdown: string): DocHeading[] {
  let inCodeBlock = false;
  const headings: DocHeading[] = [];
  for (const line of markdown.split("\n")) {
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) continue;
    headings.push({
      id: slugify(match[2]),
      title: match[2],
      level: match[1].length,
    });
  }
  return headings;
}

function isTableDivider(line: string) {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
}

function tableCells(line: string) {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function renderMarkdown(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const output: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^```([A-Za-z0-9_-]*)\s*$/);
    if (fence) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      const language = fence[1]
        ? ` data-language="${escapeHtml(fence[1])}"`
        : "";
      output.push(
        `<pre${language}><code>${escapeHtml(code.join("\n").trim())}</code></pre>`,
      );
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const content = renderInline(heading[2]);
      output.push(
        `<h${level} id="${slugify(heading[2])}">${content}</h${level}>`,
      );
      index += 1;
      continue;
    }

    if (
      index + 1 < lines.length &&
      line.includes("|") &&
      isTableDivider(lines[index + 1])
    ) {
      const header = tableCells(line);
      index += 2;
      const rows: string[][] = [];
      while (
        index < lines.length &&
        lines[index].includes("|") &&
        lines[index].trim()
      ) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      output.push(
        `<div class="table-wrap"><table><thead><tr>${header.map((cell) => `<th>${renderInline(cell)}</th>`).join("")}</tr></thead><tbody>${rows
          .map(
            (row) =>
              `<tr>${header.map((_, cellIndex) => `<td>${renderInline(row[cellIndex] ?? "")}</td>`).join("")}</tr>`,
          )
          .join("")}</tbody></table></div>`,
      );
      continue;
    }

    const unordered = /^[-*]\s+/.test(line);
    const ordered = /^\d+\.\s+/.test(line);
    if (unordered || ordered) {
      const tag = ordered ? "ol" : "ul";
      const matcher = ordered ? /^\d+\.\s+(.+)$/ : /^[-*]\s+(.+)$/;
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].match(matcher);
        if (!item) break;
        items.push(`<li>${renderInline(item[1])}</li>`);
        index += 1;
      }
      output.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }

    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].startsWith("> ")) {
        quote.push(lines[index].slice(2));
        index += 1;
      }
      const callout = quote[0]?.match(/^\[!(NOTE|TIP|WARNING)\]\s*(.*)$/);
      if (callout) {
        const title =
          callout[2] || callout[1][0] + callout[1].slice(1).toLowerCase();
        output.push(
          `<aside class="callout callout-${callout[1].toLowerCase()}"><strong>${renderInline(title)}</strong>${quote
            .slice(1)
            .map((part) => `<p>${renderInline(part)}</p>`)
            .join("")}</aside>`,
        );
      } else {
        output.push(
          `<blockquote>${quote.map(renderInline).join(" ")}</blockquote>`,
        );
      }
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      output.push("<hr />");
      index += 1;
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^```/.test(lines[index]) &&
      !/^#{1,3}\s+/.test(lines[index]) &&
      !/^[-*]\s+/.test(lines[index]) &&
      !/^\d+\.\s+/.test(lines[index]) &&
      !/^>\s+/.test(lines[index]) &&
      !/^---+$/.test(lines[index].trim())
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    output.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
  }

  return output.join("");
}
