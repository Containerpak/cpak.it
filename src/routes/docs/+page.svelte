<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Documentation - cpak</title>
	<meta name="description" content="Learn how cpak packages, installs, and runs applications." />
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-16">
	<h1 class="text-4xl font-extrabold text-gray-900">Documentation</h1>
	<p class="mt-4 max-w-2xl text-lg text-gray-600">The cpak documentation follows the tool itself: a small set of concepts, explicit permissions, and commands that are easy to inspect.</p>
	<ul class="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.articles as article}
			<li>
				<a href={`/docs/${article.slug}`} class="block h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
					<h2 class="text-2xl font-semibold text-gray-900">{article.title}</h2>
					<p class="mt-3 text-sm leading-relaxed text-gray-600">{article.description}</p>
					<div class="mt-5 flex flex-wrap gap-2">
						{#each article.tags as tag}
							<span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{tag}</span>
						{/each}
					</div>
				</a>
			</li>
		{/each}
	</ul>
</div>
