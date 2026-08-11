<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
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
		<a href="/announcements/bottles-on-cpak" class="group block border-b border-slate-200 pb-12">
			<p class="text-sm font-semibold text-[#3E7BFF]">Bottles</p>
			<div class="mt-4 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
				<div class="max-w-3xl">
					<h2 class="text-3xl font-bold tracking-tight text-gray-900 group-hover:text-[#3E7BFF]">
						Bottles arrives on cpak
					</h2>
					<p class="mt-3 text-lg leading-8 text-gray-600">
						Bottles 66 becomes the first major project to ship cpak alongside Flatpak.
					</p>
				</div>
				<span class="inline-flex items-center gap-1 font-semibold text-[#3E7BFF]">
					Read announcement
					<span class="material-symbols-outlined">arrow_forward</span>
				</span>
			</div>
		</a>
	</section>
</main>

<Footer />
