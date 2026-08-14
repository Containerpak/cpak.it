<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>cpak moves to LGPLv2.1 - cpak</title>
	<meta
		name="description"
		content="cpak v2.3.1 adopts LGPL-2.1-only for the runtime and all future contributions."
	/>
</svelte:head>

<Header />

<main>
	<article class="mx-auto max-w-4xl px-6 py-20">
		<a
			href="/announcements"
			class="inline-flex items-center gap-1 text-sm font-semibold text-[#3E7BFF] hover:text-[#3158c7]"
		>
			<span class="material-symbols-outlined text-base">arrow_back</span>
			Announcements
		</a>
		<p class="mt-12 text-sm font-semibold tracking-[0.16em] text-[#3E7BFF] uppercase">
			Project / August 14, 2026
		</p>
		<h1 class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
			cpak moves to LGPLv2.1
		</h1>
		<p class="mt-6 max-w-3xl text-xl leading-8 text-gray-600">
			cpak v2.3.1 is now licensed under LGPL-2.1-only. The runtime stays free software,
			changes to cpak remain public and applications distributed through it keep their own
			licenses.
		</p>

		<div class="mt-16 space-y-7 text-lg leading-8 text-gray-700">
			<p>
				The LGPL keeps cpak and changes made to its runtime open, while allowing distributions,
				products and desktop applications to use it under their own license terms.
			</p>
			<p>
				LGPL-2.1-only applies to the cpak source and binaries. OCI images, package manifests and
				software installed through the Store continue to use the licenses chosen by their own
				publishers. Packaging an application with cpak does not change that application's license.
			</p>
			<p>
				cpak v2.3.1 is the first release published under LGPL-2.1-only. New development and
				future contributions will follow the same license.
			</p>
		</div>

		<div class="mt-14 flex flex-wrap gap-3">
			<a
				href="https://github.com/Containerpak/cpak/releases/tag/v2.3.1"
				class="inline-flex items-center gap-2 rounded-full bg-[#3E7BFF] px-6 py-3 font-semibold text-white transition hover:brightness-110"
			>
				Download cpak v2.3.1
				<span class="material-symbols-outlined">open_in_new</span>
			</a>
			<a
				href="https://github.com/Containerpak/cpak/blob/v2/LICENSE"
				class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 font-semibold text-gray-800 transition hover:border-[#3E7BFF] hover:text-[#3158c7]"
			>
				Read the license
				<span class="material-symbols-outlined">open_in_new</span>
			</a>
		</div>
	</article>
</main>

<Footer />
