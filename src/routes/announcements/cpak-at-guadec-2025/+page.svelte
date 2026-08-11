<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>cpak at GUADEC 2025 - cpak</title>
	<meta
		name="description"
		content="Watch the first public presentation of cpak at GUADEC 2025."
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
			GUADEC 2025 / July 24, 2025
		</p>
		<h1 class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
			cpak at GUADEC 2025
		</h1>
		<p class="mt-6 max-w-3xl text-xl leading-8 text-gray-600">
			Two years after the first commit, cpak reached the GUADEC stage in Brescia with a direct question:
			can the same OCI ecosystem used to ship services also become a good home for Linux desktop apps?
		</p>

		<div class="mt-12 aspect-video overflow-hidden rounded-2xl bg-slate-950 shadow-xl">
			<iframe
				src="https://www.youtube-nocookie.com/embed/fDXPD4R85Ds?start=3603"
				title="cpak at GUADEC 2025"
				class="h-full w-full"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				referrerpolicy="strict-origin-when-cross-origin"
				allowfullscreen
			></iframe>
		</div>

		<div class="mt-14 space-y-7 text-lg leading-8 text-gray-700">
			<p>
				The talk introduced cpak as an OCI-compliant package format for devices, servers and graphical
				Linux applications. Existing image tooling remained useful, but the runtime did not need a
				container daemon and applications did not have to be rewritten around a portal API before they
				could reach the desktop.
			</p>
			<p>
				The implementation has changed since that presentation. cpak v2 now has a versioned manifest,
				transactional updates, rollback, per-package permission overrides, a content-addressed store and
				a broker for narrow host operations. The principle discussed on stage remains the same: package
				the application as it exists, then make host integration an explicit runtime contract.
			</p>
			<p>
				Bottles 66 is the first large desktop release to put that contract in front of users. It is also a
				useful checkpoint between the presentation and the work still ahead as cpak moves through its
				experimental release.
			</p>
		</div>

		<div class="mt-14 flex flex-wrap gap-3">
			<a
				href="https://www.youtube.com/live/fDXPD4R85Ds?t=3603&si=E_L6D9jvl6KfS7dn"
				class="inline-flex items-center gap-2 rounded-full bg-[#3E7BFF] px-6 py-3 font-semibold text-white transition hover:brightness-110"
			>
				Watch on YouTube
				<span class="material-symbols-outlined">open_in_new</span>
			</a>
			<a
				href="https://events.gnome.org/event/259/timetable/"
				class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 font-semibold text-gray-800 transition hover:border-[#3E7BFF] hover:text-[#3158c7]"
			>
				GUADEC 2025 schedule
				<span class="material-symbols-outlined">open_in_new</span>
			</a>
		</div>
	</article>
</main>

<Footer />
