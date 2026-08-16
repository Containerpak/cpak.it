<script lang="ts">
	import { page } from '$app/stores';
	import { announcements } from '$lib/announcements';
	import { SITE_URL, jsonLd } from '$lib/store';

	$: announcement = announcements.find((item) => item.href === $page.url.pathname);
	$: title = announcement?.title ?? 'cpak announcements';
	$: description = announcement?.description ?? 'News and release notes from the cpak project.';
	$: canonical = `${SITE_URL}${$page.url.pathname}`;
	$: schema = announcement
		? jsonLd({
				'@context': 'https://schema.org',
				'@type': 'BlogPosting',
				headline: announcement.title,
				description: announcement.description,
				datePublished: announcement.published,
				dateModified: announcement.published,
				url: canonical,
				mainEntityOfPage: canonical,
				author: {
					'@type': 'Organization',
					name: 'Containerpak',
					url: SITE_URL,
				},
				publisher: {
					'@type': 'Organization',
					name: 'Containerpak',
					url: SITE_URL,
					logo: { '@type': 'ImageObject', url: `${SITE_URL}/cpak-icon.png` },
				},
			})
		: null;
</script>

<svelte:head>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={announcement ? 'article' : 'website'} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={`${SITE_URL}/presskit/full/cpak-brand-dark.png`} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	{#if schema}
		{@html `<script type="application/ld+json">${schema}</script>`}
	{/if}
</svelte:head>

<slot />
