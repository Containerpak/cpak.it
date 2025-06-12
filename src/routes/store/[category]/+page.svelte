<script lang="ts">
	import type { PageData } from './$types';
	import PackageCard from '$lib/components/PackageCard.svelte';
	export let data: PageData;
</script>

<svelte:head>
	<title>{data.category} – Store – cpak</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-16">
	<h1 class="mb-8 text-4xl font-extrabold text-gray-900 dark:text-gray-100">{data.category}</h1>
	<ul class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.packages as pkg}
			<li>
				<PackageCard {pkg} category={data.category} />
			</li>
		{/each}
	</ul>
</div>
