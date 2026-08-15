<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	const logicalBars = [
		{ label: 'Before', value: '69.2 GiB', width: 100, color: 'bg-slate-400' },
		{ label: 'After', value: '27.8 GiB', width: 40.2, color: 'bg-[#3E7BFF]' }
	];

	const uniqueBars = [
		{ label: 'Before', value: '17.5 GiB', width: 100, color: 'bg-slate-400' },
		{ label: 'After', value: '13.2 GiB', width: 75.5, color: 'bg-[#3E7BFF]' }
	];

	const physicalBars = [
		{ label: 'Previous images', value: '3.19 GiB', width: 100, color: 'bg-slate-400' },
		{ label: 'Current images', value: '1.56 GiB', width: 48.8, color: 'bg-[#3E7BFF]' }
	];
</script>

<svelte:head>
	<title>81 cpak images, 41 GiB lighter - cpak</title>
	<meta
		name="description"
		content="I ran a full diagnosis across 81 official cpak images and rebuilt the catalogue, cutting the data required to download it by 59.8%."
	/>
</svelte:head>

<Header />

<main>
	<article class="mx-auto max-w-5xl px-6 py-20">
		<a
			href="/announcements"
			class="inline-flex items-center gap-1 text-sm font-semibold text-[#3E7BFF] hover:text-[#3158c7]"
		>
			<span class="material-symbols-outlined text-base">arrow_back</span>
			Announcements
		</a>
		<p class="mt-12 text-sm font-semibold tracking-[0.16em] text-[#3E7BFF] uppercase">
			Engineering / August 14, 2026
		</p>
		<h1 class="mt-4 max-w-4xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
			81 cpak images, 41 GiB lighter
		</h1>
		<p class="mt-6 max-w-3xl text-xl leading-8 text-gray-600">
			I ran a full diagnosis across all 81 cpak images in the official catalogue and what I found
			was hard to ignore: on a machine with no cached layers, downloading them meant transferring
			69.2 GiB, while after rebuilding the base images and every affected package the same catalogue
			is down to 27.8 GiB. That is a 59.8% reduction, with 4.3 GiB less unique data stored across
			those images.
		</p>

		<div class="mt-14 grid gap-5 sm:grid-cols-3">
			<div class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
				<p class="text-sm font-semibold text-gray-500">Applications measured</p>
				<p class="mt-2 text-4xl font-extrabold text-gray-900">81</p>
			</div>
			<div class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
				<p class="text-sm font-semibold text-gray-500">Download reduction</p>
				<p class="mt-2 text-4xl font-extrabold text-gray-900">59.8%</p>
			</div>
			<div class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
				<p class="text-sm font-semibold text-gray-500">Unique data removed</p>
				<p class="mt-2 text-4xl font-extrabold text-gray-900">4.3 GiB</p>
			</div>
		</div>

		<div class="mt-16 space-y-7 text-lg leading-8 text-gray-700">
			<h2 class="pt-4 text-3xl font-bold tracking-tight text-gray-900">
				Where the space was going
			</h2>
			<p>
				To understand where that space went, we first need to look at how a cpak image is built.
				cpak uses OCI images, which can be thought of as a stack of immutable snapshots called
				layers. Each build step adds a layer; deleting a file in a later one hides it from the final
				filesystem, but does not rewrite the snapshot where that file was created.
			</p>
			<p>
				This is where I found the first problem. Some packages downloaded an installer in one layer,
				unpacked it, then deleted it in the next one. The archive looked gone inside the
				application, but the layer containing it still had to be downloaded at every new
				installation.
			</p>
			<p>
				I moved the download and extraction work into separate build stages, then copied only the
				finished application into the image people install. Installers and temporary build files now
				stay outside the final image instead of being hidden in an earlier layer.
			</p>

			<section
				class="my-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8"
				aria-labelledby="logical-chart-title"
			>
				<div class="flex flex-wrap items-end justify-between gap-3">
					<div>
						<p class="text-sm font-semibold tracking-[0.12em] text-[#3E7BFF] uppercase">
							First download, no cache
						</p>
						<h3 id="logical-chart-title" class="mt-2 text-2xl font-bold text-gray-900">
							All 81 applications
						</h3>
					</div>
					<p class="text-sm font-semibold text-gray-500">59.8% smaller</p>
				</div>
				<div class="mt-8 space-y-6">
					{#each logicalBars as bar}
						<div>
							<div class="mb-2 flex items-center justify-between gap-4 text-sm font-semibold">
								<span>{bar.label}</span>
								<span>{bar.value}</span>
							</div>
							<div class="h-5 overflow-hidden rounded-full bg-slate-200">
								<div
									class={`h-full rounded-full ${bar.color}`}
									style={`width: ${bar.width}%`}
								></div>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">Cleaning the base images</h2>
			<p>
				The base images had their own share of unused data: package caches, indexes, manuals,
				development documentation and distribution reports. None of these files helps an application
				run, so I changed the build process to discard them before a layer is created rather than
				trying to delete them afterwards.
			</p>
			<p>
				Runtime data remains untouched, so icons, translations, settings schemas, certificates,
				fonts, MIME definitions and licences continue to work as before. Package maintainers also
				keep the same build commands because the cleanup happens inside the base itself.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
				A base for what the application actually uses
			</h2>
			<p>
				Some bases had grown large enough to cover almost any desktop application, which meant a GTK
				3 program could also receive GTK 4, libadwaita, WebKitGTK and a complete 32-bit graphics
				stack it never used.
			</p>
			<p>
				I split them by toolkit and graphics requirements, so each application receives the base it
				actually needs. The shared parts still use identical OCI layers, which means cpak downloads
				a common layer once and reuses it for every application built on top of it.
			</p>
			<p>
				When every shared layer is counted only once, the 81 applications fall from 17.5 GiB to 13.2
				GiB of unique registry data. In other words, the catalogue now stores 4.3 GiB less before
				cpak starts deduplicating individual files on the machine.
			</p>

			<section
				class="my-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8"
				aria-labelledby="unique-chart-title"
			>
				<div class="flex flex-wrap items-end justify-between gap-3">
					<div>
						<p class="text-sm font-semibold tracking-[0.12em] text-[#3E7BFF] uppercase">
							Shared layers counted once
						</p>
						<h3 id="unique-chart-title" class="mt-2 text-2xl font-bold text-gray-900">
							Registry storage for all 81 applications
						</h3>
					</div>
					<p class="text-sm font-semibold text-gray-500">24.5% smaller</p>
				</div>
				<div class="mt-8 space-y-6">
					{#each uniqueBars as bar}
						<div>
							<div class="mb-2 flex items-center justify-between gap-4 text-sm font-semibold">
								<span>{bar.label}</span>
								<span>{bar.value}</span>
							</div>
							<div class="h-5 overflow-hidden rounded-full bg-slate-200">
								<div
									class={`h-full rounded-full ${bar.color}`}
									style={`width: ${bar.width}%`}
								></div>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
				Then I measured the result on disk
			</h2>
			<p>
				The registry comparison tells us how much data is downloaded, but not how much space it will
				occupy after installation. Once OCI has shared identical layers, cpak's FVS storage engine
				goes deeper and shares equal file blocks even when they arrived through different layers.
			</p>
			<p>
				To measure the final result, I imported Chrome, Firefox and Telegram into two empty cpak
				stores with cpak v2.3.1, once with the previous images and once with the rebuilt ones.
			</p>
			<p>
				The previous images occupied 3.19 GiB after deduplication. The rebuilt images occupy 1.56
				GiB, a reduction of 51.2%. The number of stored content blocks also fell from 21,694 to
				10,807.
			</p>

			<section
				class="my-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8"
				aria-labelledby="physical-chart-title"
			>
				<div class="flex flex-wrap items-end justify-between gap-3">
					<div>
						<p class="text-sm font-semibold tracking-[0.12em] text-[#3E7BFF] uppercase">
							Installed on disk
						</p>
						<h3 id="physical-chart-title" class="mt-2 text-2xl font-bold text-gray-900">
							Chrome, Firefox and Telegram
						</h3>
					</div>
					<p class="text-sm font-semibold text-gray-500">51.2% smaller</p>
				</div>
				<div class="mt-8 space-y-6">
					{#each physicalBars as bar}
						<div>
							<div class="mb-2 flex items-center justify-between gap-4 text-sm font-semibold">
								<span>{bar.label}</span>
								<span>{bar.value}</span>
							</div>
							<div class="h-5 overflow-hidden rounded-full bg-slate-200">
								<div
									class={`h-full rounded-full ${bar.color}`}
									style={`width: ${bar.width}%`}
								></div>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
				The same work on SDKs and Bottles
			</h2>
			<p>
				The catalogue also contains 14 official SDK images, so I applied the same work to their
				development bases. Their combined download falls from 5.2 GiB to 4.1 GiB, while unique OCI
				data falls from 1.94 GiB to 1.71 GiB. Qt and Vulkan no longer inherit the complete multilib
				SDK, while Vala now uses the GTK 4 SDK instead of the old all-toolkit image.
			</p>
			<p>
				Go and Node received the same cleanup while keeping their amd64 and arm64 builds. Packages
				built with those SDKs now start from the smaller base without requiring any recipe changes.
			</p>
			<p>
				Bottles is built from its own repository, so I measured it separately. Rebuilding its cpak
				against the new Wine base reduced the official image from 1054.4 MiB to 568.3 MiB without
				changing Bottles or removing any declared dependency.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
				How I measured these numbers
			</h2>
			<p>
				Each number comes from the published Linux amd64 manifests on GHCR rather than an estimate.
				The total download adds every compressed layer used by all 81 applications, while the unique
				size groups layers by their SHA-256 digest and counts shared data only once. Previous
				measurements use immutable manifests or commit tags and the new ones use the images produced
				after the rebuild.
			</p>
			<p>
				The complete 81-image comparison measures downloads and registry storage before local FVS
				deduplication. The separate Chrome, Firefox and Telegram sample measures the space allocated
				on disk after FVS has done its work. Every new image completed its GitHub Actions build
				before entering either result.
			</p>
		</div>

		<div class="mt-14 flex flex-wrap gap-3">
			<a
				href="/docs/images"
				class="inline-flex items-center gap-2 rounded-full bg-[#3E7BFF] px-6 py-3 font-semibold text-white transition hover:brightness-110"
			>
				Build smaller images
				<span class="material-symbols-outlined">arrow_forward</span>
			</a>
			<a
				href="/docs/comparison"
				class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 font-semibold text-gray-800 transition hover:border-[#3E7BFF] hover:text-[#3158c7]"
			>
				Compare package models
				<span class="material-symbols-outlined">arrow_forward</span>
			</a>
		</div>
	</article>
</main>

<Footer />
