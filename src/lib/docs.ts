export type DocArticle = {
	slug: string;
	title: string;
	description: string;
	tags: string[];
	body: string;
};

const sources = import.meta.glob('/src/content/docs/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

function parseList(value: string) {
	return value
		.replace(/^\[/, '')
		.replace(/\]$/, '')
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);
}

function parseArticle(path: string, source: string): DocArticle {
	const slug = path.split('/').pop()?.replace(/\.md$/, '') ?? '';
	const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	const frontmatter = match?.[1] ?? '';
	const body = match?.[2]?.trim() ?? source.trim();
	const fields = Object.fromEntries(
		frontmatter.split('\n').flatMap((line) => {
			const separator = line.indexOf(':');
			return separator === -1
				? []
				: [[line.slice(0, separator).trim(), line.slice(separator + 1).trim()]];
		})
	);

	return {
		slug,
		title: fields.title ?? slug,
		description: fields.description ?? '',
		tags: fields.tags ? parseList(fields.tags) : [],
		body
	};
}

export const articles = Object.entries(sources)
	.map(([path, source]) => parseArticle(path, source))
	.sort((left, right) => left.title.localeCompare(right.title));

export function getArticle(slug: string) {
	return articles.find((article) => article.slug === slug);
}

function escapeHtml(value: string) {
	return value.replace(/[&<>"']/g, (character) => {
		const entities: Record<string, string> = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;'
		};
		return entities[character];
	});
}

export function renderMarkdown(markdown: string) {
	const codeBlocks: string[] = [];
	let html = escapeHtml(markdown).replace(/```(?:bash|json|text)?\n([\s\S]*?)```/g, (_, code) => {
		codeBlocks.push(`<pre><code>${code.trim()}</code></pre>`);
		return `\n@@CODE_${codeBlocks.length - 1}@@\n`;
	});

	html = html
		.replace(/^### (.+)$/gm, '<h3>$1</h3>')
		.replace(/^## (.+)$/gm, '<h2>$1</h2>')
		.replace(/^# (.+)$/gm, '<h1>$1</h1>')
		.replace(/`([^`]+)`/g, '<code>$1</code>')
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		.split(/\n{2,}/)
		.map((block) => {
			const trimmed = block.trim();
			if (!trimmed) return '';
			if (/^<(h[1-3]|pre)/.test(trimmed)) return trimmed;
			return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
		})
		.join('');

	return html.replace(/@@CODE_(\d+)@@/g, (_, index) => codeBlocks[Number(index)]);
}
