<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>FVS Storage incident notice - cpak</title>
	<meta
		name="description"
		content="The resolved incident notice for slow application startup under cpak v2.1.x."
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
			Incident / August 14, 2026
		</p>
		<h1 class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
			FVS Storage incident notice
		</h1>
		<p class="mt-6 max-w-3xl text-xl leading-8 text-gray-600">
			The application startup regression affecting cpak v2.1.x was resolved on August 14, 2026
			with the release of cpak v2.2.0.
		</p>

		<div class="mt-16 space-y-7 text-lg leading-8 text-gray-700">
			<div class="rounded-lg border border-emerald-300 bg-emerald-50 p-6 text-emerald-950">
				<h2 class="text-2xl font-bold tracking-tight">Resolved in cpak v2.2.0</h2>
				<p class="mt-3">
					Update directly to
					<a
						href="https://github.com/Containerpak/cpak/releases/tag/v2.2.0"
						class="font-semibold underline underline-offset-4">v2.2.0</a
					>. Existing applications, settings and user data remain in place.
				</p>
			</div>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">Impact</h2>
			<p>
				Applications launched with cpak v2.1.x could take several seconds to appear. The delay was
				most visible on the first launch and affected browsers, communication clients, development
				tools and other desktop applications. Applications that had already started continued to run
				normally.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">Cause</h2>
			<p>
				FVS Storage preparation was running as part of every application launch. Systems with a cold
				cache or several package layers paid that cost before the application process could start.
				No package or user data was corrupted.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">Resolution</h2>
			<p>
				cpak v2.2.0 moves storage preparation outside the normal launch path and reuses a prepared
				filesystem view. Existing stores are updated in place, with visible progress when a migration
				is required. The operation can resume after an interruption.
			</p>
			<p>
				The
				<a
					href="/announcements/fvs-storage-resolved"
					class="font-semibold text-[#3158c7] underline underline-offset-4"
					>resolution announcement</a
				>
				describes the update and the information needed for any remaining startup report.
			</p>
		</div>
	</article>
</main>

<Footer />
