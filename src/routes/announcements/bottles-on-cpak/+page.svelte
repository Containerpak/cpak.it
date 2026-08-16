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
			Bottles 66 is the first large project to publish cpak alongside Flatpak. The experimental cpak
			package becomes the second official package for Bottles after years in which Flatpak was the only
			supported distribution.
		</p>

		<div class="mt-16 space-y-7 text-lg leading-8 text-gray-700">
			<p>
				Bottles has always treated distribution as part of the product. A package needs to keep the
				application working, receive updates cleanly and give people a predictable place for their data.
				That is why Flatpak has been the official route for so long.
			</p>
			<p>
				The cpak package is built and published by the Bottles project from the same release source. It is
				recognized by Bottles as an official package, including the package-specific storage and UMU
				integration required by the application. It does not ask Bottles to pretend it is a Flatpak or
				rewrite its desktop integration around a portal model.
			</p>
			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">Two official choices</h2>
			<p>
				Flatpak remains the recommended and most tested package for Bottles. cpak gives early users an
				official alternative with OCI images and a package manifest that can be read before installation,
				but the cpak package is experimental while the runtime reaches its stable release.
			</p>
			<p>
				This matters beyond Bottles. A real desktop application is a better test than a demo. Wine,
				graphics drivers, launchers, updates and user data all have to work together. Bottles 66 is the
				first public release that lets cpak prove that work outside its own development environment.
			</p>
			<h2 class="pt-8 text-3xl font-bold tracking-tight text-gray-900">Install Bottles with cpak</h2>
			<pre class="overflow-x-auto rounded-xl bg-slate-950 p-5 text-base text-slate-100"><code>cpak install github.com/bottlesdevs/bottles</code></pre>
			<p>
				The package is available in the cpak Store with its manifest and permission choices visible. If
				you already use Bottles through Flatpak, there is no reason to move unless you want to test cpak.
				Experimental means bug reports are useful and a Flatpak installation should remain the fallback
				for work you cannot interrupt yet.
			</p>
		</div>

		<a
			href="/store/apps/bottles"
			class="mt-14 inline-flex items-center gap-2 rounded-full bg-[#3E7BFF] px-6 py-3 font-semibold text-white transition hover:brightness-110"
		>
			View Bottles in the Store
			<span class="material-symbols-outlined">arrow_forward</span>
		</a>
	</article>
</main>

<Footer />
