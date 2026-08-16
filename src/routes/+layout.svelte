<script>
	import { page } from '$app/state';
	import '../app.css';
	import { SITE_URL } from '$lib/store';

	let { children } = $props();
	let canonical = $derived(new URL(page.url.pathname, SITE_URL).toString());
</script>

<svelte:head>
	<link rel="canonical" href={canonical} />
	<meta
		name="robots"
		content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
	/>
	<meta property="og:site_name" content="cpak" />
</svelte:head>

{@render children()}
