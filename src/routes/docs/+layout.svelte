<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<div class="flex min-h-screen flex-col">
	<Header />

	<main class="flex-1 overflow-auto bg-gray-50">
		<slot />
	</main>

	<Footer />
</div>
