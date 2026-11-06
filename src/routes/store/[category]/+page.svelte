<script lang="ts">
	import type { PageData } from './$types';
	import PackageCard from '$lib/components/PackageCard.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { flathubAppUrl } from '$lib/flathub';
	import * as m from '$lib/paraglide/messages.js';
	export let data: PageData;

	$: total = data.packages.length + (data.flathub?.total ?? 0);
</script>

<Seo
	title={`${data.category} applications for Linux | cpak Store`}
	description={data.description}
	path={data.path}
	structuredData={data.schema}
/>

<div class="mx-auto max-w-7xl px-6 py-16">
	<nav class="mb-8 flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
		<a href="/store" class="hover:text-[#3E7BFF]">Store</a>
		<span class="material-symbols-outlined text-base">chevron_right</span>
		<span>{data.category}</span>
	</nav>
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
			<p class="mt-2 max-w-2xl text-base text-gray-600">{data.description}</p>
			<p class="mt-1 text-lg text-gray-600">
				{total} package{total !== 1 ? 's' : ''}{data.flathub?.total ? '*' : ''}
			</p>
		</div>
	</div>

	{#if data.packages.length && (!data.flathub || data.flathub.page === 1)}
		<ul class="grid auto-rows-[19rem] gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.packages as pkg}
				<li class="h-full">
					<PackageCard {pkg} color={data.categoryMeta.color} />
				</li>
			{/each}
		</ul>
	{/if}

	{#if data.flathub?.apps.length}
		<section class={data.packages.length && data.flathub.page === 1 ? 'mt-16' : ''}>
			<div class="mb-6 flex flex-wrap items-end justify-between gap-4">
				<div>
					<h2 class="text-2xl font-bold text-gray-900">From Flathub</h2>
					<p class="mt-1 text-gray-600">
						cpak installs these into its own sandbox, without Flatpak on the system.
						<a href="/docs/flathub" class="font-semibold text-[#3E7BFF] hover:underline">How it works</a>
					</p>
				</div>
				{#if data.flathub.pages > 1}
					<p class="text-sm text-gray-500">Page {data.flathub.page} of {data.flathub.pages}</p>
				{/if}
			</div>
			<ul class="grid auto-rows-[19rem] gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.flathub.apps as app (app.id)}
					<li class="h-full">
						<PackageCard
							pkg={{
								origin: app.id,
								slug: app.id,
								name: app.name,
								description: app.summary,
								icon: app.icon
							}}
							href={flathubAppUrl(app.id)}
							source="Flathub"
							color={data.categoryMeta.color}
						/>
					</li>
				{/each}
			</ul>
			{#if data.flathub.pages > 1}
				<nav class="mt-10 flex items-center justify-center gap-3" aria-label="Flathub pages">
					{#if data.flathub.page > 1}
						<a
							href={`${data.path}?page=${data.flathub.page - 1}`}
							class="rounded-full border border-slate-200 bg-white px-5 py-2 font-semibold text-gray-700 hover:border-[#3E7BFF] hover:text-[#3E7BFF]"
							>Previous</a
						>
					{/if}
					{#if data.flathub.page < data.flathub.pages}
						<a
							href={`${data.path}?page=${data.flathub.page + 1}`}
							class="rounded-full bg-[#3E7BFF] px-5 py-2 font-semibold text-white hover:brightness-110"
							>More from Flathub</a
						>
					{/if}
				</nav>
			{/if}
		</section>
	{/if}

	{#if data.flathub?.total}
		<p class="mt-12 text-sm text-gray-500">{m.store_disclaimer()}</p>
	{/if}
</div>
