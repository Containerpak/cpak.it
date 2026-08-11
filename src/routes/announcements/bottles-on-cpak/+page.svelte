<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>Bottles arrives on cpak - cpak</title>
	<meta
		name="description"
		content="Bottles 66 is the first large project to ship cpak alongside Flatpak."
	/>
</svelte:head>

<Header />

<main>
	<article class="mx-auto max-w-3xl px-6 py-20">
		<a href="/announcements" class="inline-flex items-center gap-1 text-sm font-semibold text-[#3E7BFF] hover:text-[#3158c7]">
			<span class="material-symbols-outlined text-base">arrow_back</span>
			Announcements
		</a>
		<p class="mt-12 text-sm font-semibold tracking-[0.16em] text-[#3E7BFF] uppercase">Bottles</p>
		<h1 class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
			Bottles arrives on cpak
		</h1>
		<p class="mt-6 text-xl leading-8 text-gray-600">
			Bottles 66 is the first large project to publish cpak alongside Flatpak. It becomes the second
			official package for Bottles after years in which Flatpak was the only supported distribution.
		</p>

		<div class="mt-16 space-y-7 text-lg leading-8 text-gray-700">
			<p>
				Bottles has always treated distribution as part of the product. A package needs to keep the
				application working, receive updates cleanly and give people a predictable place for their data.
				That is why Flatpak has been the official route for so long.
			</p>
			<p>
				cpak is now ready to stand beside it. The cpak package is built and published by the Bottles
				project, uses the same application release and is supported as an official install. It does not
				ask Bottles to become a different application or rewrite its integration around a portal model.
			</p>
			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">Two official choices</h2>
			<p>
				Flatpak remains available and remains a good way to install Bottles. cpak gives users another
				choice with a small runtime, OCI images and a package manifest that can be read before it is
				installed. Both packages are maintained by the project and both are intended for daily use.
			</p>
			<p>
				This matters beyond Bottles. A real desktop application is a better test than a demo: Wine,
				graphics drivers, application launchers, desktop entries, updates and user data all have to work
				together. Bottles 66 is the first public proof that cpak can carry that responsibility.
			</p>
			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">Install Bottles with cpak</h2>
			<pre class="overflow-x-auto rounded-xl bg-slate-950 p-5 text-base text-slate-100"><code>cpak install github.com/bottlesdevs/bottles</code></pre>
			<p>
				The package is available in the cpak Store with its manifest and permission choices visible. If
				you already use Bottles through Flatpak, there is no need to move. Pick the package that fits
				your system and keep making bottles.
			</p>
		</div>

		<a
			href="/store/Utilities/github.com/bottlesdevs/bottles"
			class="mt-14 inline-flex items-center gap-2 rounded-full bg-[#3E7BFF] px-6 py-3 font-semibold text-white transition hover:brightness-110"
		>
			View Bottles in the Store
			<span class="material-symbols-outlined">arrow_forward</span>
		</a>
	</article>
</main>

<Footer />
