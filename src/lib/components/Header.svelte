<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { searchQuery } from '$lib/stores/search';

	let query = '';
	let showDropdown = false;
	let showMobileMenu = false;

	interface DocItem {
		title: string;
		url: string;
	}
	interface AppItem {
		name: string;
		url: string;
		icon: string;
	}

	let docsIndex: DocItem[] = [];
	let appIndex: AppItem[] = [];
	let results = { docs: [] as DocItem[], apps: [] as AppItem[] };

	function debounce<T extends (...args: any[]) => void>(fn: T, ms = 200) {
		let t: ReturnType<typeof setTimeout>;
		return (...args: Parameters<T>) => {
			clearTimeout(t);
			t = setTimeout(() => fn(...args), ms);
		};
	}

	onMount(async () => {
		const storeRes = await fetch(
			'https://raw.githubusercontent.com/Containerpak/store/main/index.json'
		);
		if (storeRes.ok) {
			const storeIndex = (await storeRes.json()) as Record<
				string,
				Record<string, { name: string; manifest: string }>
			>;
			const apps: AppItem[] = [];
			for (const [cat, entries] of Object.entries(storeIndex)) {
				for (const [origin, entry] of Object.entries(entries)) {
					const base = entry.manifest.replace(/\/[^/]+$/, '');
					apps.push({ name: entry.name, url: `/store/${cat}/${origin}`, icon: `${base}/icon.svg` });
				}
			}
			appIndex = apps;
		}

		const CHRONOS_BASE = 'https://chronos.vanillaos.org/vos-docs';
		const LANG = 'en';
		const docsRes = await fetch(`${CHRONOS_BASE}/articles/${LANG}`);
		if (docsRes.ok) {
			const data = (await docsRes.json()) as {
				articles: { Slug: string; Title: string; Listed: boolean }[];
			};
			docsIndex = data.articles
				.filter((a) => a.Listed)
				.map((a) => ({ title: a.Title, url: `/docs/${a.Slug}` }));
		}
	});

	const doSearch = () => {
		const q = query.trim().toLowerCase();
		if (!q) {
			showDropdown = false;
			results = { docs: [], apps: [] };
			searchQuery.set('');
			return;
		}
		showDropdown = true;
		searchQuery.set(q);
		results.docs = docsIndex.filter((d) => d.title.toLowerCase().includes(q));
		results.apps = appIndex.filter((a) => a.name.toLowerCase().includes(q));
	};
	const handleInput = debounce(doSearch, 150);

	function select(item: DocItem | AppItem) {
		window.location.href = item.url;
		showDropdown = false;
	}

	$: current = $page.url.pathname;
</script>

<nav class="relative w-full bg-slate-50 max-w-full">
	<div class="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
		{#if current !== '/'}
			<button
				on:click={() => history.back()}
				class="flex cursor-pointer items-center rounded-full bg-transparent p-2 text-gray-700 shadow-none transition duration-200 hover:bg-white hover:shadow-sm"
			>
				<span class="material-symbols-outlined">arrow_back</span>
			</button>
		{/if}
		<a href="/" class="flex shrink-0 items-center gap-2">
			<img src="/cpak-brand.svg" alt="cpak logo" />
		</a>
		<div class="flex flex-grow justify-end lg:justify-center">
			<input
				type="search"
				bind:value={query}
				on:input={handleInput}
				placeholder="Search docs & apps"
				class="hidden lg:block h-12 w-full max-w-[640px] rounded-full border border-slate-200 bg-white px-5 text-sm placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
			/>
			{#if showDropdown}
				<div
					class="absolute top-full z-20 mt-2 max-h-96 w-[640px] overflow-auto rounded-lg bg-white shadow-lg"
				>
					{#if results.docs.length}
						<div class="border-b px-4 py-2">
							<h4 class="text-sm font-semibold text-gray-700">Documentation</h4>
							{#each results.docs as d}
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									class="mt-2 flex cursor-pointer items-center gap-3 px-2 py-1 hover:bg-slate-100"
									on:click={() => select(d)}
								>
									<span class="material-symbols-outlined text-gray-500">menu_book</span>
									<span class="text-sm text-gray-800">{d.title}</span>
								</div>
							{/each}
						</div>
					{/if}
					{#if results.apps.length}
						<div class="px-4 py-2">
							<h4 class="text-sm font-semibold text-gray-700">Apps</h4>
							{#each results.apps as a}
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									class="mt-2 flex cursor-pointer items-center gap-3 px-2 py-1 hover:bg-slate-100"
									on:click={() => select(a)}
								>
									<img src={a.icon} alt="" class="h-5 w-5 rounded-sm" />
									<span class="text-sm text-gray-800">{a.name}</span>
								</div>
							{/each}
						</div>
					{/if}
					{#if !results.docs.length && !results.apps.length}
						<div class="p-4 text-center text-sm text-gray-500">No results found</div>
					{/if}
				</div>
			{/if}
		</div>
		<div class="flex shrink-0 items-center gap-6">
			<button
				class="lg:hidden flex items-center justify-center rounded-full bg-transparent p-2 text-gray-700 shadow-none transition duration-200 hover:bg-white hover:shadow-sm"
				on:click={() => (showMobileMenu = !showMobileMenu)}
			>
				<span class="material-symbols-outlined">menu</span>
			</button>
			<div class="hidden lg:flex items-center gap-6">
				<a href="/docs" class="text-sm font-medium text-gray-900 hover:underline">Docs</a>
				<a
					href="https://github.com/containerpak/cpak"
					class="text-sm font-medium text-gray-900 hover:underline">GitHub</a
				>
				<a
					href="/docs/quick-start"
					class="rounded-full bg-[#3E7BFF]/20 px-4 py-2 text-sm font-semibold text-[#3E7BFF] transition hover:bg-[#3E7BFF]/30"
				>
					Get started
				</a>
			</div>
		</div>
	</div>
	{#if showMobileMenu}
		<div class="lg:hidden absolute top-full left-0 w-full bg-white shadow-md">
			<a href="/docs" class="block px-6 py-4 text-sm font-medium text-gray-900 hover:bg-slate-100">Docs</a>
			<a
				href="https://github.com/containerpak/cpak"
				class="block px-6 py-4 text-sm font-medium text-gray-900 hover:bg-slate-100">GitHub</a
			>
			<a
				href="/docs/quick-start"
				class="block px-6 py-4 text-sm font-medium text-[#3E7BFF] hover:bg-slate-100"
			>
				Get started
			</a>
			<input
				type="search"
				bind:value={query}
				on:input={handleInput}
				placeholder="Search docs & apps"
				class="block w-full px-6 py-4 text-sm border-t border-slate-200 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
			/>
		</div>
	{/if}
</nav>
