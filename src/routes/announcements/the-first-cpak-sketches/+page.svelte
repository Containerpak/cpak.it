<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>The first cpak sketches - cpak</title>
	<meta
		name="description"
		content="The first cpak update and nested package diagrams, revisited against the cpak v2 runtime."
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
			Project history / September 2023
		</p>
		<h1 class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
			The first cpak sketches
		</h1>
		<p class="mt-6 max-w-3xl text-xl leading-8 text-gray-600">
			cpak started on September 10, 2023. Before the runtime had a stable manifest or a Store,
			two issue threads already described the ideas that would define it: packages that remember
			where they came from, and packages that can use other packages without absorbing them.
		</p>

		<div class="mt-16 space-y-7 text-lg leading-8 text-gray-700">
			<p>
				These diagrams were drawn while the first implementation was still moving quickly. They are
				part of the project's history, not a current runtime specification. cpak v2 kept the intent,
				but the machinery underneath it is stricter than the first drawings suggest.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">Packages keep their origin</h2>
			<p>
				The first update design separated installs that follow a branch or release from installs pinned
				to one commit. That rule still exists. The origin is now the stable identity of a package, while
				the selected Git reference tells cpak how it should move when an update is requested.
			</p>
			<figure class="py-5">
				<img
					src="/announcements/cpak-origin-sources.png"
					alt="Original cpak origin sources diagram showing commit, branch and release sources"
					class="w-full rounded-2xl border border-slate-200 bg-white"
				/>
				<figcaption class="mt-3 text-sm leading-6 text-gray-500">
					The source model drawn for <a
						href="https://github.com/Containerpak/cpak/issues/2"
						class="font-semibold text-[#3158c7] underline underline-offset-4"
						>issue #2</a
					> in September 2023.
				</figcaption>
			</figure>
			<figure class="py-5">
				<img
					src="/announcements/cpak-install-update.png"
					alt="Original cpak installation and update decision diagram"
					class="w-full rounded-2xl border border-slate-200 bg-white"
				/>
			</figure>
			<p>
				Today the manifest is validated first, the OCI image is resolved to an immutable digest and the
				new package is staged before it becomes active. A failed update leaves the previous installation
				available. A manifest change is applied even when the image itself did not change, including new
				permission defaults and desktop metadata. The simple source decision in the sketch became a
				transaction that can be inspected, rolled back and reproduced with a lock file.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">A package can call another package</h2>
			<p>
				The second design used VS Code and Git as its example. Instead of putting every SDK and tool in
				the editor image, VS Code could request a Git package at runtime. The first sketch proposed a
				host service because an isolated application could not enter or start another package by itself.
			</p>
			<figure class="py-5">
				<img
					src="/announcements/cpak-nested-flow.png"
					alt="Original nested cpak diagram showing VS Code asking the host to run Git"
					class="w-full rounded-2xl border border-slate-200 bg-white"
				/>
				<figcaption class="mt-3 text-sm leading-6 text-gray-500">
					The first nested package flow from <a
						href="https://github.com/Containerpak/cpak/issues/3"
						class="font-semibold text-[#3158c7] underline underline-offset-4"
						>issue #3</a
					>. The private bridge survived, but the permission model changed.
				</figcaption>
			</figure>
			<p>
				In cpak v2 the parent declares the dependency in its manifest and receives a narrow request path
				for that package. It does not see the host package database or the general cpak control socket.
				The dependency runs with its own manifest and user overrides, so the parent cannot inherit extra
				host access simply by asking another package to run. Its layers and writable state also remain
				separate from the parent.
			</p>
			<p>
				This is now used by Bottles and UMU. Bottles owns its interface and game library, while the UMU
				package owns the environment used to launch a game. The same model lets an editor gain an SDK as
				an optional addon without rebuilding the editor image around every possible toolchain.
			</p>

			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">What the sketches did not show</h2>
			<p>
				The current runtime stores OCI layers by digest, shares equal layers across packages and can use
				DaBaDee to remove duplicate files that arrived through different layer layouts. Package content,
				writable application data and transaction state are kept apart. The sandbox is assembled directly
				with Linux namespaces, OverlayFS, seccomp and Landlock where the host supports them, without a
				Docker or Podman daemon behind every application.
			</p>
			<p>
				The drawings captured the two decisions that mattered most: an application should remain tied to
				its real source, and composition should not require copying the same runtime into every package.
				The last three years have been spent turning those decisions into a runtime that can carry desktop
				applications for real.
			</p>
		</div>
	</article>
</main>

<Footer />
