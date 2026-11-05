<script lang="ts">
	import type { PageData } from './$types';
	import CategoryCard from '$lib/components/CategoryCard.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import * as m from '$lib/paraglide/messages.js';

	export let data: PageData;
</script>

<Seo
	title="cpak Store - Linux applications distributed with OCI"
	description={`Browse ${data.packageCount} Linux applications, developer tools, games and complete desktop environments packaged for cpak.`}
	path="/store"
	structuredData={data.schema}
/>

<div class="mx-auto max-w-7xl px-6 py-16">
	<div class="mb-10 max-w-2xl">
		<h1 class="text-balance text-4xl font-extrabold text-gray-900">{m.store_title()}</h1>
		<p class="mt-3 text-pretty text-lg text-gray-600">
			{m.store_intro({ count: String(data.packageCount) })}
		</p>
	</div>

	<aside
		class="mb-10 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between"
	>
		<div class="max-w-2xl">
			<h2 class="text-xl font-bold text-gray-900">{m.store_flathub_title()}</h2>
			<p class="mt-1 text-pretty text-gray-600">{m.store_flathub_body()}</p>
		</div>
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
</div>
