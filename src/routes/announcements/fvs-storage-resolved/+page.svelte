<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>FVS Storage startup regression resolved - cpak</title>
	<meta
		name="description"
		content="cpak v2.2.0 resolves the FVS Storage startup regression with persistent native layer checkouts."
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
			cpak v2.2.0 is now available and resolves the startup regression introduced with FVS Storage
			in v2.1.x. The update works with stores already migrated to FVS and systems that stayed on the
			v2.0.1 fallback.
		</p>

		<div class="mt-16 space-y-7 text-lg leading-8 text-gray-700">
			<p>
				The regression was not in the FVS block store. It was in the path between stored content and
				a running application. cpak v2.1.x asked FVS2d to assemble a FUSE view before every launch.
				Starting the service, preparing the mount and building that view could add several seconds
				before the application process existed, especially with a cold cache or a large set of
				layers.
			</p>
			<p>
				The first launch warmed enough state to hide part of the delay, which made the regression
				look inconsistent across applications and machines. The reports were real: the storage path
				had moved work into application startup that did not belong there.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
				FVS stays, the launch path changes
			</h2>
			<p>
				cpak v2.2.0 keeps FVS as the authoritative source for immutable layer content. Each layer is
				prepared once as a persistent native checkout, verified against its FVS repository and
				published with an atomic rename. Whole files reuse storage through reflinks or hard links
				when the filesystem supports them, while the shared FVS block store keeps content-level
				deduplication available on every supported local filesystem.
			</p>
			<p>
				A prepared application now starts from an atomic runtime index. cpak reads the ordered
				application, dependency and addon directories and passes them directly to rootless
				OverlayFS. No FUSE view is created during launch and no layer is materialized for each
				application. `cpak-storaged` handles preparation, verification and collection during
				maintenance, then exits.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
				Existing installations move in place
			</h2>
			<p>
				Updating to v2.2.0 does not require reinstalling applications. cpak detects legacy expanded
				layers and existing FVS layers, prepares the missing native checkouts and publishes the new
				runtime index only after every path has been validated. Completed layers survive an
				interrupted migration, so the next attempt resumes instead of starting again.
			</p>
			<p>
				Desktop launches show a progress window when preparation lasts longer than 400 milliseconds.
				Terminal launches report the same operation in place. Once the index is ready, later
				launches read it directly and skip storage maintenance.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
				A storage contract outside cpak
			</h2>
			<p>
				The release also introduces the versioned
				<a
					href="https://github.com/Containerpak/storage"
					class="font-semibold text-[#3158c7] underline underline-offset-4"
					>Containerpak Storage protocol</a
				>. The built-in FVS driver is the default, while DaBaDee implements the same contract for
				compatible deployments. External drivers can use the Unix socket protocol without sharing
				cpak's implementation language or entering the application launch path.
			</p>
			<p>
				The new layout preserves what FVS brought to cpak: content-defined deduplication below OCI
				layer boundaries, verified immutable content and resumable storage operations. v2.2.0
				keeps that preparation outside every application start.
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
				href="/docs/storage-drivers"
				class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 font-semibold text-gray-800 transition hover:border-[#3E7BFF] hover:text-[#3158c7]"
			>
				Read the storage documentation
				<span class="material-symbols-outlined">arrow_forward</span>
			</a>
		</div>
	</article>
</main>

<Footer />
