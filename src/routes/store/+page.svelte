<script lang="ts">
	import type { PageData } from './$types';
	import CategoryCard from '$lib/components/CategoryCard.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>Store | cpak</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-16">
	<h1 class="mb-8 text-center text-4xl font-extrabold text-gray-900">Browse the Store</h1>

	<ul class="grid auto-rows-[12rem] grid-flow-row-dense grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
		{#each data.categories as cat}
			<li class={cat.layoutClass}>
				<CategoryCard {cat} />
			</li>
		{/each}
	</ul>
</div>
