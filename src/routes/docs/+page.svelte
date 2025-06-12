<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	const { articles } = data;

	function excerpt(article: any) {
		const text = (article.Description ?? article.Body ?? '').replace(/<[^>]+>/g, '').trim();
		return text.length > 150 ? text.slice(0, 147) + '…' : text;
	}

	function formatDate(dateString: string) {
		const d = new Date(dateString);
		return d.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Documentation – cpak</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-16">
	<h1 class="mb-8 text-4xl font-extrabold text-gray-900 dark:text-gray-100">Documentation</h1>

	{#if articles.length === 0}
		<p class="text-gray-600 dark:text-gray-400">No articles found.</p>
	{:else}
		<ul class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each articles as art}
				<li>
					<a
						href={`/docs/${art.Slug}`}
						class="block h-full overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:shadow-lg"
					>
						<h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{art.Title}</h2>

						<p class="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
							{excerpt(art)}
						</p>

						{#if art.Tags?.length}
							<div class="mt-4 flex flex-wrap gap-2">
								{#each art.Tags.slice(0, 3) as tag}
									<span
										class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
									>
										{tag}
									</span>
								{/each}
								{#if art.Tags.length > 3}
									<span class="text-xs text-gray-500 dark:text-gray-400">+{art.Tags.length - 3} more</span>
								{/if}
							</div>
						{/if}

						<div class="mt-6 text-xs text-gray-500 dark:text-gray-400">
							{formatDate(art.PublicationDate)} — by {art.Authors.join(', ')}
						</div>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>
