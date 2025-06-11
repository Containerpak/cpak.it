<script lang="ts">
	import type { PageData } from './$types';
	import { onMount, tick } from 'svelte';
	import { error } from '@sveltejs/kit';

	export let data: PageData;
	const art = data.art;
	if (!art.Body) throw error(404, 'Article not found');

	// genera TOC dinamico
	let contentEl: HTMLDivElement;
	type TocEntry = { id: string; text: string; level: number };
	let toc: TocEntry[] = [];

	function slugify(str: string) {
		return str
			.toLowerCase()
			.trim()
			.replace(/\s+/g, '-')
			.replace(/[^\w-]/g, '');
	}

	onMount(async () => {
		await tick();
		const hs = Array.from(contentEl.querySelectorAll('h2, h3'));
		toc = hs.map((h) => {
			if (!h.id) h.id = slugify(h.textContent || '');
			return { id: h.id, text: h.textContent || '', level: h.tagName === 'H2' ? 2 : 3 };
		});
	});
</script>

<svelte:head>
	<title>{art.Title} – Documentation – cpak</title>
</svelte:head>

<div class="mx-auto flex max-w-7xl gap-8 px-6 py-16">
	<aside class="hidden w-64 shrink-0 space-y-4 lg:block">
		<nav class="sticky top-6 space-y-2">
			<h2 class="text-lg font-semibold text-gray-800">On this page</h2>
			<ul class="space-y-1 text-sm text-gray-600">
				{#each toc as { id, text, level }}
					<li class={level === 3 ? 'ml-4' : ''}>
						<a href={`#${id}`} class="hover:underline">{text}</a>
					</li>
				{/each}
			</ul>
		</nav>
	</aside>

	<article class="prose prose-lg prose-slate max-w-full lg:max-w-none flex-1">
		<header class="mb-8">
			<h1>{art.Title}</h1>
			<p class="text-sm text-gray-500">
				{new Date(art.PublicationDate).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric'
				})} — by {art.Authors.join(', ')}
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each art.Tags as tag}
					<span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
						{tag}
					</span>
				{/each}
			</div>
		</header>

		<div bind:this={contentEl}>
			{@html art.Body}
		</div>

		<nav class="mt-16 flex justify-between text-sm text-blue-600">
			{#if art.Previous}
				<a href={`/docs/${art.Previous}`} class="hover:underline">← Previous</a>
			{/if}
			{#if art.Next}
				<a href={`/docs/${art.Next}`} class="ml-auto hover:underline">Next →</a>
			{/if}
		</nav>
	</article>
</div>
