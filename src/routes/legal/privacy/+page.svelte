<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>Privacy | cpak</title>
	<meta name="description" content="How the Cpak website handles data and external services." />
</svelte:head>

<Header />

<main>
	<section class="border-b border-slate-200 bg-slate-50">
		<div class="mx-auto max-w-4xl px-6 py-20">
			<p class="text-sm font-semibold tracking-[0.16em] text-[#4670EC] uppercase">Legal</p>
			<h1 class="mt-4 text-5xl font-extrabold tracking-tight text-gray-950">Privacy</h1>
			<p class="mt-5 text-lg text-gray-600">Effective August 11, 2026.</p>
		</div>
	</section>

	<article class="mx-auto max-w-4xl space-y-10 px-6 py-16 text-lg leading-8 text-gray-700">
		<section>
			<h2 class="text-3xl font-bold tracking-tight text-gray-950">What this site collects</h2>
			<p class="mt-4">
				cpak.it does not offer user accounts, accept payments directly, or use first-party analytics and
				advertising cookies. The site does not ask for personal information unless you choose to contact
				the project by email.
			</p>
		</section>

		<section>
			<h2 class="text-3xl font-bold tracking-tight text-gray-950">Infrastructure and external requests</h2>
			<p class="mt-4">
				The site is delivered through Cloudflare, which may process request data such as IP addresses,
				browser headers, and timestamps to provide and protect the service. Fonts and Material Symbols are
				loaded from Google. Store metadata is retrieved from public GitHub repositories, including a
				client-side request used by search.
			</p>
			<p class="mt-4">
				These providers handle data under their own policies:
				<a class="font-medium text-[#4670EC] hover:underline" href="https://www.cloudflare.com/policies/privacy/" target="_blank" rel="noopener noreferrer">Cloudflare Privacy Policy</a>,
				<a class="font-medium text-[#4670EC] hover:underline" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>, and
				<a class="font-medium text-[#4670EC] hover:underline" href="https://docs.github.com/en/site-policy/privacy-policies" target="_blank" rel="noopener noreferrer">GitHub Privacy Policies</a>.
			</p>
		</section>

		<section>
			<h2 class="text-3xl font-bold tracking-tight text-gray-950">Funding and external links</h2>
			<p class="mt-4">
				The funding page links to GitHub Sponsors, PayPal, Patreon, and other external services. They receive
				data only when you follow those links, and Cpak does not receive your payment credentials.
			</p>
		</section>

		<section>
			<h2 class="text-3xl font-bold tracking-tight text-gray-950">Contact and retention</h2>
			<p class="mt-4">
				Messages sent by email are used to reply and kept only as long as needed for the conversation or a
				legitimate project record. For privacy questions or requests, contact
				<a class="font-medium text-[#4670EC] hover:underline" href="mailto:brombin94@gmail.com">brombin94@gmail.com</a>.
			</p>
		</section>
	</article>
</main>

<Footer />
