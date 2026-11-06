<script lang="ts">
	import type { PageData } from './$types';
	import CategoryCard from '$lib/components/CategoryCard.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import * as m from '$lib/paraglide/messages.js';

	export let data: PageData;

	$: total = `${data.packageCount + data.flathubCount}${data.flathubCount ? '*' : ''}`;
</script>

<Seo
	title="cpak Store - Linux applications distributed with OCI"
	description={`Browse ${data.packageCount + data.flathubCount} Linux applications, developer tools, games and complete desktop environments packaged for cpak.`}
	path="/store"
	structuredData={data.schema}
/>

<div class="mx-auto max-w-7xl px-6 py-16">
	<div class="mb-10 max-w-2xl">
		<h1 class="text-balance text-4xl font-extrabold text-gray-900">{m.store_title()}</h1>
		<p class="mt-3 text-pretty text-lg text-gray-600">
			{m.store_intro({ count: total })}
		</p>
	</div>

	<aside
		class="mb-10 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between"
	>
		<h2 class="min-w-0 flex-1 text-xl font-bold text-pretty text-gray-900">
			{m.store_flathub_title()}
		</h2>
		<a
			href="/docs/flathub"
			class="shrink-0 self-start rounded-full bg-[#3E7BFF] px-6 py-2.5 font-semibold text-white transition hover:brightness-110 sm:self-auto"
			>{m.store_flathub_cta()}</a
		>
	</aside>

	<ul
		class="grid grid-flow-row-dense auto-rows-[17rem] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
	>
		{#each data.categories as cat}
			<li class={cat.featured ? 'sm:col-span-2 sm:row-span-2' : ''}>
				<CategoryCard {cat} />
			</li>
		{/each}
	</ul>

	{#if data.flathubCount}
		<p class="mt-12 text-sm text-gray-500">{m.store_disclaimer()}</p>
	{/if}
</div>
