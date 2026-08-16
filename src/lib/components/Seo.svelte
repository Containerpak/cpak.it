<script lang="ts">
	import { SITE_URL } from '$lib/store';

	export let title: string;
	export let description: string;
	export let path: string;
	export let image = '/presskit/full/cpak-brand-dark.png';
	export let type = 'website';
	export let structuredData: string | null = null;

	$: canonical = new URL(path, SITE_URL).toString();
	$: socialImage = new URL(image, SITE_URL).toString();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={type} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={socialImage} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={socialImage} />
	{#if structuredData}
		{@html `<script type="application/ld+json">${structuredData}</script>`}
	{/if}
</svelte:head>
