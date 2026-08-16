<script lang="ts">
	import type { PageData } from './$types';
	import CategoryCard from '$lib/components/CategoryCard.svelte';
	import Seo from '$lib/components/Seo.svelte';

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
		<h1 class="text-4xl font-extrabold text-gray-900">Browse the Store</h1>
		<p class="mt-3 text-lg text-gray-600">
			Find {data.packageCount} desktop applications, development tools and complete environments packaged
			for cpak.
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
