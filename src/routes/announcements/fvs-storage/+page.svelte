<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>FVS Storage incident notice - cpak</title>
	<meta
		name="description"
		content="An active investigation into slow application startup with FVS Storage."
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
			We are investigating an FVS Storage regression that can make applications slow to start under
			certain conditions. The issue affects cpak v2.1.x and is under active investigation.
		</p>

		<div class="mt-16 space-y-7 text-lg leading-8 text-gray-700">
			<div class="rounded-lg border border-amber-300 bg-amber-50 p-6 text-amber-950">
				<h2 class="text-2xl font-bold tracking-tight">Temporary fallback</h2>
				<p class="mt-3">
					If you have not yet started an application with cpak v2.1.x, you can use the last DaBaDee
					release, <a
						href="https://github.com/Containerpak/cpak/releases/tag/v2.0.1"
						class="font-semibold underline underline-offset-4">v2.0.1</a
					>. Do not downgrade an installation that has already migrated a layer to FVS: v2.0.1
					expects the old expanded layer directories, which the FVS migration removes after it
					publishes the FVS layer.
				</p>
				<p class="mt-3">
					To use v2.0.1 after migration, reinstall the affected applications and packages. Application
					user data in the exposed home and XDG paths is not a package layer and should remain, but
					back it up before changing versions.
				</p>
			</div>
			<p>
				OCI already gives cpak its first level of deduplication. A layer is identified by its
				digest, so two packages built on the same unchanged base download and store that layer once.
				The limit appears as soon as two images contain much of the same data but arrange it
				differently. Different layer digests mean different downloads, even when both images carry
				the same libraries, fonts or assets.
			</p>
			<p>
				The first cpak store handled this with
				<a
					href="https://github.com/mirkobrombin/DaBaDee"
					class="font-semibold text-[#3158c7] underline underline-offset-4">DaBaDee</a
				>. Layers were expanded into normal directories, then DaBaDee found equal files and reused
				them through hard links or reflinks when the filesystem supported them. It saved real space,
				but the complete layer still had to be downloaded and expanded before the second pass could
				begin. Partial matches inside different files were also outside that storage model.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
				Deduplication below the image layout
			</h2>
			<p>
				<a
					href="https://github.com/fvs-lab"
					class="font-semibold text-[#3158c7] underline underline-offset-4">FVS</a
				>
				splits file content into content-defined blocks and keeps those blocks in one shared
				content-addressed store. Equal byte ranges refer to the same block even when they came from
				different files, packages or OCI layers. A library changed by a small region can share the
				unchanged blocks instead of storing a second complete copy.
			</p>
			<p>
				A new OCI layer now moves through digest verification and decompression directly into FVS.
				cpak does not retain a compressed cache copy and does not create an expanded layer directory.
				The OCI digest still handles complete layer reuse, while FVS finds repeated content below
				those layer boundaries. Both levels are automatic and neither asks package authors to design
				a cpak-specific image format.
			</p>
			<p>
				This also prepares the download path for `zstd:chunked` images. When a registry preserves
				byte-range responses, cpak can read the layer table first and avoid compressed ranges whose
				file content already exists in FVS. A cold store still uses one complete stream, and normal
				gzip or zstd layers remain the fallback on any conforming OCI registry.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
				The application sees a filesystem, not a restored tree
			</h2>
			<p>
				Stored blocks are only one half of the change. At launch, `cpak-storaged` asks FVS to expose
				the application, dependency and enabled addon layers as one ordered, read-only FUSE view.
				That view becomes the lower filesystem for rootless OverlayFS. Application writes still land
				in their private writable layer, while immutable package content remains shared.
			</p>
			<p>
				`cpak-storaged` is the second static binary shipped in every release and signed installer. It
				starts on demand, owns mounts only inside its current mount namespace and exits when no view
				needs it. There is no image daemon waiting in the background and no restored copy of every
				layer behind each application. The host does need `/dev/fuse`, which is now part of the
				<a
					href="/docs/host-compatibility"
					class="font-semibold text-[#3158c7] underline underline-offset-4"
					>documented runtime contract</a
				>.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
				Existing stores move when an application needs them
			</h2>
			<p>
				Updating cpak does not convert the complete store at once. When an application first needs a
				legacy layer, cpak imports it into a temporary FVS repository, verifies every entry and
				publishes the result atomically. The expanded copy is removed only after the FVS layer is
				complete. An interrupted import leaves the old data readable and the next launch can try
				again.
			</p>
			<p>
				The terminal reports layer and byte progress. A desktop launch shows the same work in a
				progress window when it lasts longer than the normal startup threshold. Packages, user data,
				overrides and rollback records stay in place. A cpak build that predates FVS cannot read a
				migrated FVS layer, so its affected packages must be reinstalled after a downgrade.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
				What deprecating DaBaDee means
			</h2>
			<p>
				DaBaDee is deprecated as the storage engine for cpak application layers. Newly downloaded
				layers never enter its store. It remains in cpak for two bounded jobs while the transition is
				active: reading and collecting old store content, and powering `cpak dedup` when a user asks
				cpak to deduplicate an external path explicitly.
			</p>
			<p>
				This is a cpak deprecation, not a DaBaDee deprecation. DaBaDee remains an independent Go
				library for generic file-tree deduplication and has its own v2 API. Once legacy cpak layers no
				longer need compatibility handling, the package store can drop that dependency without
				changing DaBaDee's release or use outside cpak.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
				Nothing new to put in a package manifest
			</h2>
			<p>
				Package authors keep publishing standard OCI images. Shared base layers still matter because
				they avoid a download completely, but they are no longer the only way to share bytes on disk.
				FVS can reuse repeated blocks across independently built images, and registries can add
				`zstd:chunked` later without making packages incompatible with the complete download path.
			</p>
			<p>
				The practical result is less temporary data during pulls, finer reuse across unrelated images
				and immutable layer views that do not need to be restored before an application can start.
				The full operational details are in the
				<a
					href="/docs/storage"
					class="font-semibold text-[#3158c7] underline underline-offset-4">storage guide</a
				>
				and the
				<a
					href="/docs/images"
					class="font-semibold text-[#3158c7] underline underline-offset-4">OCI image guide</a
				>.
			</p>
		</div>
	</article>
</main>

<Footer />
