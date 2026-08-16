<script lang="ts">
	import type { PageData } from './$types';
	import PackageCard from '$lib/components/PackageCard.svelte';
	export let data: PageData;
</script>

<svelte:head>
	<title>{data.category} | Store | cpak</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-16">
	<div class="mb-10 flex items-center gap-4">
		<div
			class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm"
			style="background-color: {data.categoryMeta.color}"
		>
			<span class="material-symbols-outlined text-3xl text-white">
				{data.categoryMeta.icon}
			</span>
		</div>
		<div>
			<h1 class="text-4xl font-extrabold text-gray-900">{data.category}</h1>
			<p class="mt-1 text-lg text-gray-600">
				{data.packages.length} package{data.packages.length !== 1 ? 's' : ''}
			</p>
		</div>
	</div>

	<ul class="grid auto-rows-[19rem] gap-5 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.packages as pkg}
			<li class="h-full">
				<PackageCard {pkg} category={data.category} color={data.categoryMeta.color} />
			</li>
		{/each}
	</ul>
</div>
