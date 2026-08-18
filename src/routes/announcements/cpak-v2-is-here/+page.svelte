<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>cpak v2 is here - cpak</title>
	<meta
		name="description"
		content="cpak v2 is available with signed installers, OCI packages, shared storage and direct Linux desktop integration."
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
			Release / August 12, 2026
		</p>
		<h1 class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
			cpak v2 is here
		</h1>
		<p class="mt-6 max-w-3xl text-xl leading-8 text-gray-600">
			Three years after the
			<a
				href="/announcements/the-first-cpak-sketches"
				class="font-semibold text-[#3158c7] underline underline-offset-4"
				>first sketches</a
			>
			and one year after its
			<a
				href="/announcements/cpak-at-guadec-2025"
				class="font-semibold text-[#3158c7] underline underline-offset-4"
				>first public presentation at GUADEC</a
			>, cpak has a stable v2 runtime, a Store and an installer that can carry a Linux desktop
			application directly to the user.
		</p>
		<iframe
			class="mt-10 aspect-video w-full rounded-2xl"
			src="https://www.youtube-nocookie.com/embed/fDXPD4R85Ds?start=3603"
			title="cpak at GUADEC 2025"
			loading="lazy"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			allowfullscreen
		></iframe>

		<div class="mt-16 space-y-7 text-lg leading-8 text-gray-700">
			<p>
				I started cpak in September 2023 because distributing a Linux application had become a choice
				between rebuilding it around someone else's runtime or asking users to assemble the right
				pieces themselves. OCI already had a mature way to publish content-addressed images, but the
				desktop needed its own package identity, update model and direct access to the Linux services
				applications already know how to use.
			</p>
			<p>
				The result is a single Go binary which installs an application from its real Git repository,
				resolves its OCI image and applies a manifest that can be read before anything runs. The same
				manifest describes desktop entries, dependencies, devices and the host operations the
				application may request. There is no daemon keeping a second container stack alive behind it.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
				Packages that keep their origin
			</h2>
			<p>
				A cpak package is still a Git repository. It may follow a branch, a release or one immutable
				commit, while the OCI digest records the exact image installed on the machine. Updates are
				staged before they become active and the previous installation remains available for rollback.
				The Store does not replace that origin. It makes those repositories discoverable and shows what
				they contain.
			</p>
			<p>
				Storage follows the same rule. Equal OCI layers are downloaded once and shared by every package
				that uses them. FVS stores equal content blocks once even when files arrived through different
				layer layouts, so reuse is no longer limited to complete layers or files. Applications keep
				their writable data separate, but they do not each need a private copy of the same operating
				system base. The
				<a
					href="/announcements/fvs-storage"
					class="font-semibold text-[#3158c7] underline underline-offset-4">storage migration</a
				>
				is automatic for existing installations.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
				One click without hiding the package
			</h2>
			<p>
				Every application page in the Store can now produce a signed cpak installer. The installer shows
				the application, its origin and its requested permissions before downloading the image. It also
				contains the matching cpak binary, so the first application does not begin with a terminal guide
				or a distribution-specific bootstrap package.
			</p>
			<p>
				This does not turn cpak into a central repository. Package manifests and images remain in the
				publisher's repositories, releases stay connected to their source and the command used by the
				installer can be inspected or copied from the Store.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">
				Bottles is the first real test
			</h2>
			<p>
				Bottles 66 is the first large project to publish cpak as an official package alongside Flatpak.
				That matters because Bottles is not a convenient demo. It needs graphics drivers, Wine runners,
				UMU, nested packages, desktop entries and persistent application data to agree with each other.
				If cpak can carry Bottles without asking it to impersonate another package format, the runtime is
				being tested where its design actually matters.
			</p>
			<p>
				Less than 24 hours after the release, that test already produced the first external bug report.
				<a
					href="https://github.com/Containerpak/cpak/issues/20"
					class="font-semibold text-[#3158c7] underline underline-offset-4"
					>Issue #20</a
				>
				found that a valid Landlock ABI on NixOS could still reject a filesystem rule for a device node.
				The report included a complete reproduction, the host checks and the exact point where Firefox
				stopped before startup. This is exactly why cpak is public now: real machines find assumptions
				that a development environment cannot.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">The work starts here</h2>
			<p>
				v2 gives cpak a stable manifest, signed installers and enough runtime surface to package real
				applications. The Store already carries browsers, editors, creative tools, games and development
				SDKs, but the next useful result will come from running them across more distributions, desktop
				sessions and hardware.
			</p>
			<p>
				Install an application, read the permissions before accepting them and report what the runtime
				gets wrong on your machine. Bottles and Firefox are good places to start. A clean bug report is
				more valuable right now than pretending every Linux configuration has already been covered.
			</p>
		</div>

		<div class="mt-14 flex flex-wrap gap-3">
			<a
				href="/store"
				class="inline-flex items-center gap-2 rounded-full bg-[#3E7BFF] px-6 py-3 font-semibold text-white transition hover:brightness-110"
			>
				Open the Store
				<span class="material-symbols-outlined">arrow_forward</span>
			</a>
			<a
				href="/docs"
				class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 font-semibold text-gray-800 transition hover:border-[#3E7BFF] hover:text-[#3158c7]"
			>
				Read the documentation
				<span class="material-symbols-outlined">arrow_forward</span>
			</a>
		</div>
	</article>
</main>

<Footer />
