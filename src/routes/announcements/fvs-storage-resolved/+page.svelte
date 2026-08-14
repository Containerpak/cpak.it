<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>FVS Storage startup regression resolved - cpak</title>
	<meta
		name="description"
		content="cpak v2.2.0 restores normal application startup after the FVS Storage regression in v2.1.x."
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
			Resolved / August 14, 2026
		</p>
		<h1 class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
			FVS Storage startup regression resolved
		</h1>
		<p class="mt-6 max-w-3xl text-xl leading-8 text-gray-600">
			cpak v2.2.0 fixes the slow application startup reported with v2.1.x. Existing
			applications and user data remain in place, and any required storage migration is handled
			automatically after the update.
		</p>

		<div class="mt-16 space-y-7 text-lg leading-8 text-gray-700">
			<p>
				The regression delayed applications before their windows appeared. The first launch was
				usually the slowest, while later launches could be much faster. This made the problem seem
				inconsistent even though the delay was inside cpak and affected unrelated applications.
			</p>
			<p>
				No application data was damaged. The delay came from filesystem preparation that had been
				placed in the launch path when FVS Storage became the default in v2.1.0.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
				Application startup is direct again
			</h2>
			<p>
				cpak v2.2.0 prepares each immutable layer once and reuses the result. Applications can then
				start directly through rootless OverlayFS without waiting for a new FUSE view on every
				launch. FVS still provides content-level deduplication and verified storage, but its
				maintenance work no longer sits between a click and the application process.
			</p>
			<p>
				Warm launches return to the normal direct path, including links that open an application
				already running. Storage checks run only when there is actual work to complete.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
				Existing installations update in place
			</h2>
			<p>
				Users on cpak v2.1.x can update directly to v2.2.0. Applications do not need to be
				reinstalled, and their settings and files are not moved. If an existing store needs an
				update, cpak shows its progress once and resumes safely if the operation is interrupted.
			</p>
			<p>
				The temporary v2.0.1 fallback is no longer needed. Anyone who stayed on that version can
				also update directly to v2.2.0.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
				If an application is still slow
			</h2>
			<p>
				A launch that remains slow after the migration may have a different cause. Reports should
				include the cpak version, package name, filesystem and separate timings for the first and
				second launch. That is enough to distinguish storage preparation from application startup.
			</p>
		</div>

		<div class="mt-14 flex flex-wrap gap-3">
			<a
				href="https://github.com/Containerpak/cpak/releases/tag/v2.2.0"
				class="inline-flex items-center gap-2 rounded-full bg-[#3E7BFF] px-6 py-3 font-semibold text-white transition hover:brightness-110"
			>
				Download cpak v2.2.0
				<span class="material-symbols-outlined">open_in_new</span>
			</a>
			<a
				href="https://github.com/Containerpak/cpak/issues"
				class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 font-semibold text-gray-800 transition hover:border-[#3E7BFF] hover:text-[#3158c7]"
			>
				Report a remaining issue
				<span class="material-symbols-outlined">open_in_new</span>
			</a>
		</div>
	</article>
</main>

<Footer />
