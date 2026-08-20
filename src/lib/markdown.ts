export type MarkdownHeading = {
  id: string;
  title: string;
  level: number;
};

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
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/(^|[^\w])_([^_]+)_(?=$|[^\w])/g, "$1<em>$2</em>");

  return html.replace(
    /@@INLINE_(\d+)@@/g,
    (_, index) => inlineCode[Number(index)],
  );
}

export function extractHeadings(markdown: string): MarkdownHeading[] {
  let inCodeBlock = false;
  const headings: MarkdownHeading[] = [];
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
