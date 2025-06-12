<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<Header />

<main class="min-h-screen bg-slate-50 dark:bg-slate-900">
	<slot />
</main>

<Footer />
