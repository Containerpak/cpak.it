<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	export let status: number;
</script>

<Header />

<main class="bg-slate-50 dark:bg-slate-900">
	<section class="mx-auto flex max-w-7xl flex-col items-center gap-20 px-6 pt-28 pb-36 lg:flex-row">
		<img src="/cpak-isometric-cubes-red.svg" alt="Error illustration" class="w-96 lg:w-[28rem]" />

		<div class="text-center lg:text-left">
			<h1 class="text-6xl leading-tight font-extrabold tracking-tight text-gray-900 dark:text-gray-100 lg:text-7xl">
				{status === 404 ? 'Page Not Found' : 'Something Went Wrong'}
			</h1>
			<p class="mx-auto mt-8 max-w-md text-xl text-gray-600 dark:text-gray-400 lg:mx-0">
				{status === 404
					? 'Sorry, we couldn’t find the page you’re looking for.'
					: 'An unexpected error occurred.'}
			</p>

			<div class="mt-12 flex justify-center gap-4 lg:justify-start">
				<a
					href="/"
					class="rounded-full bg-red-600 text-white px-8 py-3 font-semibold transition hover:brightness-110 dark:bg-red-500 dark:hover:brightness-125"
				>
					Go Home
				</a>
				<a
					href="/store"
					class="rounded-full border border-red-200 bg-white text-red-600 px-8 py-3 transition hover:bg-red-100 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
				>
					Browse Store
				</a>
			</div>
		</div>
	</section>
</main>

<Footer />
