<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { announcements } from '$lib/announcements';
</script>

<svelte:head>
	<title>Announcements - cpak</title>
	<meta name="description" content="News and release notes from the cpak project." />
</svelte:head>

<Header />

<main>
	<section class="border-b border-slate-200 bg-slate-50">
		<div class="mx-auto max-w-7xl px-6 py-24">
			<p class="text-sm font-semibold tracking-[0.16em] text-[#3E7BFF] uppercase">News</p>
			<h1 class="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
				Announcements
			</h1>
			<p class="mt-6 max-w-2xl text-xl leading-8 text-gray-600">
				Notes on new packages, runtime changes and the projects that choose to ship with cpak.
			</p>
		</div>
	</section>

	<section class="mx-auto max-w-7xl px-6 py-20">
		{#each announcements as announcement}
			<a href={announcement.href} class="group block border-b border-slate-200 py-12 first:pt-0">
				<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold">
					<p class="text-[#3E7BFF]">{announcement.section}</p>
					<span class="text-gray-400" aria-hidden="true">/</span>
					<time class="text-gray-500">{announcement.date}</time>
				</div>
				<div class="mt-4 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
					<div class="max-w-3xl">
						<h2 class="text-3xl font-bold tracking-tight text-gray-900 group-hover:text-[#3E7BFF]">
							{announcement.title}
						</h2>
						<p class="mt-3 text-lg leading-8 text-gray-600">
							{announcement.description}
						</p>
					</div>
					<span class="inline-flex items-center gap-1 font-semibold text-[#3E7BFF]">
						Read announcement
						<span class="material-symbols-outlined">arrow_forward</span>
					</span>
				</div>
			</a>
		{/each}
	</section>
</main>

<Footer />
