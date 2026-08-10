<script lang="ts">
	import type { PageData } from './$types';
	import { renderMarkdown } from '$lib/docs';

	let { data }: { data: PageData } = $props();
	let article = $derived(data.article);
	let body = $derived(renderMarkdown(article.body));
</script>

<svelte:head>
	<title>{article.title} - Documentation - cpak</title>
	<meta name="description" content={article.description} />
</svelte:head>

<div class="mx-auto max-w-4xl px-6 py-16">
	<a href="/docs" class="text-sm font-medium text-[#4670EC] hover:underline">Documentation</a>
	<h1 class="mt-5 text-4xl font-extrabold text-gray-900">{article.title}</h1>
	<p class="mt-4 text-lg text-gray-600">{article.description}</p>
	<div class="mt-10 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mb-5 [&_p]:leading-7 [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-950 [&_pre]:p-5 [&_pre]:text-sm [&_pre]:text-slate-100">
		{@html body}
	</div>
	<div class="mt-8 flex flex-wrap gap-2">
		{#each article.tags as tag}
			<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{tag}</span>
		{/each}
	</div>
</div>
