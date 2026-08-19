<script>
	import { page } from '$app/state';
	import '../app.css';
	import { SITE_URL } from '$lib/store';
	import { robotsFor } from '$lib/seo';

	let { children } = $props();
	let canonical = $derived(new URL(page.url.pathname, SITE_URL).toString());
	let robots = $derived(robotsFor(page.url.pathname));
</script>

<svelte:head>
	<link rel="canonical" href={canonical} />
	<meta name="robots" content={robots} />
	<meta property="og:site_name" content="cpak" />
</svelte:head>

{@render children()}
