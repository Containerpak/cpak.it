<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>Terms | cpak</title>
	<meta name="description" content="Terms for using the cpak website and its public resources." />
</svelte:head>

<Header />

<main>
	<section class="border-b border-slate-200 bg-slate-50">
		<div class="mx-auto max-w-4xl px-6 py-20">
			<p class="text-sm font-semibold tracking-[0.16em] text-[#4670EC] uppercase">Legal</p>
			<h1 class="mt-4 text-5xl font-extrabold tracking-tight text-gray-950">Terms of use</h1>
			<p class="mt-5 text-lg text-gray-600">Effective August 11, 2026.</p>
		</div>
	</section>

	<article class="mx-auto max-w-4xl space-y-10 px-6 py-16 text-lg leading-8 text-gray-700">
		<section>
			<h2 class="text-3xl font-bold tracking-tight text-gray-950">The website</h2>
			<p class="mt-4">
				cpak.it provides project information, documentation, package metadata, and links to public
				repositories. You may use the site for lawful purposes and must not interfere with its operation or
				attempt to abuse its infrastructure.
			</p>
		</section>

		<section>
			<h2 class="text-3xl font-bold tracking-tight text-gray-950">Software and package content</h2>
			<p class="mt-4">
				The cpak runtime is available under
				<a class="font-medium text-[#4670EC] hover:underline" href="https://github.com/Containerpak/cpak/blob/v2/LICENSE" target="_blank" rel="noopener noreferrer">GPL-3.0-only</a>.
				Non-exclusive commercial licenses can be granted independently by
				<a class="font-medium text-[#4670EC] hover:underline" href="https://bromb.in/" target="_blank" rel="noopener noreferrer">Mirko Brombin</a>
				or FABRICATORS S.R.L.
				Store entries, package recipes, and linked applications remain governed by the licenses shown in
				their respective repositories or distributions. A Store listing does not transfer ownership of an
				application or replace its license.
			</p>
		</section>

		<section>
			<h2 class="text-3xl font-bold tracking-tight text-gray-950">No warranty</h2>
			<p class="mt-4">
				The website and its public information are provided as available. Package details can change when an
				upstream project publishes a new build. Review a package manifest and its source before installing
				or running it.
			</p>
		</section>

		<section>
			<h2 class="text-3xl font-bold tracking-tight text-gray-950">External services</h2>
			<p class="mt-4">
				Links to GitHub, payment providers, and other websites are provided for convenience. Their own terms
				and policies apply when you leave cpak.it.
			</p>
		</section>

		<section>
			<h2 class="text-3xl font-bold tracking-tight text-gray-950">Changes and contact</h2>
			<p class="mt-4">
				These terms may be updated when the website or its services change. The effective date above will be
				updated with them. Questions can be sent to
				<a class="font-medium text-[#4670EC] hover:underline" href="mailto:brombin94@gmail.com">brombin94@gmail.com</a>.
			</p>
		</section>
	</article>
</main>

<Footer />
