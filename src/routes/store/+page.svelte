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
