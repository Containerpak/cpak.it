<script lang="ts">
	import type { PageData } from './$types';
	import { onMount, tick } from 'svelte';
	export let data: PageData;

	const highRisk = [
		'fsHost',
		'fsHostHome',
		'deviceAll',
		'asRoot',
		'socketSystemBus',
		'allowedHostCommands'
	];
	const overrides = data.pkg.cpak.override as Record<string, boolean>;
	const risky = Object.entries(overrides)
		.filter(([k, v]) => v && highRisk.includes(k))
		.map(([k]) => k);

	let idx = 0;
	let slides: string[] = [];
	onMount(() => {
		slides = [];
		if (data.pkg.showcase) slides.push(data.pkg.showcase);
		slides.push(...data.pkg.screenshots);
	});
	const prev = () => (idx = (idx || slides.length) - 1);
	const next = () => (idx = (idx + 1) % slides.length);
	const go = (i: number) => (idx = i);

	const cmd = `cpak install ${data.pkg.origin}`;
	let showTooltip = false,
		copied = false;
	async function copyInstall() {
		await navigator.clipboard.writeText(cmd);
		copied = true;
		await tick();
		setTimeout(() => (copied = false), 3000);
	}
	function toggleDropdown() {
		showTooltip = !showTooltip;
	}

	let showDisabled = false;
</script>

<svelte:head>
	<title>{data.pkg.name} – v{data.pkg.version} – cpak Store</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-12 px-6 py-16">
	<section class="flex flex-col items-center justify-between gap-6 md:flex-row">
		<div class="flex items-center gap-6">
			<img src={data.pkg.icon} alt="Icon" class="h-24 w-24 rounded-xl shadow" />
			<div>
				<h1 class="text-3xl font-extrabold text-gray-900">
					{data.pkg.name}
					<span class="ml-2 text-lg text-gray-500">v{data.pkg.version}</span>
				</h1>
				<p class="mt-1 text-gray-700">{data.pkg.description}</p>
			</div>
		</div>
		<div class="relative flex items-stretch">
			<button
				on:click={copyInstall}
				class={`rounded-l-full bg-[#3E7BFF] px-4 py-2 text-white shadow transition hover:bg-[#356fdb] ${
					copied ? 'bg-green-500' : ''
				}`}
			>
				{copied ? 'Copied!' : 'Install'}
			</button>
			<button
				on:click={toggleDropdown}
				class="flex items-center justify-center rounded-r-full bg-[#3E7BFF]/90 px-3 py-2 text-white shadow transition hover:bg-[#356fdb]/90"
			>
				<span class="material-symbols-outlined text-sm">keyboard_arrow_down</span>
			</button>
			{#if showTooltip}
				<div
					class="absolute top-12 right-0 z-10 mb-2 rounded-lg bg-gray-800 text-gray-100 shadow-lg"
				>
					<div class="flex items-center justify-between border-b border-gray-700 px-3 py-2">
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined text-gray-400">terminal</span>
							<span class="text-sm font-medium">Install Command</span>
						</div>
						<button
							on:click={() => (showTooltip = false)}
							class="p-1 text-gray-400 hover:text-gray-200"
							aria-label="Close"
						>
							<span class="material-symbols-outlined">close</span>
						</button>
					</div>
					<pre class="mx-3 mb-0 rounded-t-lg bg-gray-800 p-3 font-mono text-sm">{cmd}</pre>
					<a
						href="/docs/quick-start"
						class="block w-full rounded-b-lg bg-gray-700 py-2 text-center text-white transition hover:bg-gray-900"
					>
						View documentation
					</a>
				</div>
			{/if}
		</div>
	</section>

	{#if slides.length}
		<section class="relative mx-auto max-w-4xl overflow-visible">
			<div
				class="flex transition-transform duration-500 ease-in-out"
				style="transform: translateX(calc(-100% * {idx}));"
			>
				{#each slides as src}
					<div class="w-full max-w-4xl flex-shrink-0 px-2">
						<!-- svelte-ignore a11y_media_has_caption -->
						<!-- svelte-ignore element_invalid_self_closing_tag -->
						{#if src.endsWith('.webm')}
							<!-- svelte-ignore a11y_media_has_caption -->
							<video {src} controls class="w-full rounded-xl shadow" />
						{:else}
							<img {src} alt="Slide {idx + 1}" class="w-full rounded-xl object-contain shadow" />
						{/if}
					</div>
				{/each}
			</div>

			<button
				on:click={prev}
				class="absolute top-1/2 -left-3 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white p-2 shadow transition hover:shadow-lg"
			>
				<span class="material-symbols-outlined">chevron_left</span>
			</button>
			<button
				on:click={next}
				class="absolute top-1/2 -right-3 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white p-2 shadow transition hover:shadow-lg"
			>
				<span class="material-symbols-outlined">chevron_right</span>
			</button>

			<div class="mt-4 flex justify-center gap-2">
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				{#each slides as _, i}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<!-- svelte-ignore element_invalid_self_closing_tag -->
					<div
						class="h-3 w-3 cursor-pointer rounded-full bg-gray-300"
						class:bg-gray-700={i === idx}
						on:click={() => go(i)}
					/>
				{/each}
			</div>
		</section>
	{/if}

	{#if risky.length}
		<div class="flex items-start gap-3 rounded-xl bg-red-100 p-4 shadow-sm">
			<span class="material-symbols-outlined text-red-700">warning</span>
			<div>
				<p class="font-semibold text-red-700">High-risk permissions: {risky.join(', ')}</p>
				<p class="text-sm text-red-600">Review carefully before running untrusted packages.</p>
			</div>
		</div>
	{/if}

	<section>
		<h2 class="mb-4 text-2xl font-semibold text-gray-900">Permissions & Overrides</h2>
		<div class="mb-4 grid gap-6 sm:grid-cols-2">
			{#each Object.entries(overrides).filter(([_, v]) => v) as [key]}
				<div
					class="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
				>
					<span class="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
					<span class="rounded-full bg-yellow-100 px-2 py-1 text-sm font-medium text-yellow-800"
						>Enabled</span
					>
				</div>
			{/each}
		</div>
		{#if Object.entries(overrides).some(([_, v]) => !v)}
			<button
				on:click={() => (showDisabled = !showDisabled)}
				class="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
			>
				<span class="material-symbols-outlined">{showDisabled ? 'expand_less' : 'expand_more'}</span
				>
				{showDisabled ? 'Hide disabled permissions' : 'Show disabled permissions'}
			</button>
			{#if showDisabled}
				<div class="grid gap-6 sm:grid-cols-2">
					{#each Object.entries(overrides).filter(([_, v]) => !v) as [key]}
						<div
							class="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
						>
							<span class="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
							<span class="rounded-full bg-gray-100 px-2 py-1 text-sm font-medium text-gray-500"
								>Disabled</span
							>
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</section>

	<section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
		<dl class="grid grid-cols-1 gap-x-8 gap-y-4 text-sm text-gray-700 sm:grid-cols-2">
			<div class="flex">
				<dt class="w-32 font-medium">Origin</dt>
				<dd>{data.pkg.origin}</dd>
			</div>
			<div class="flex">
				<dt class="w-32 font-medium">Image</dt>
				<dd>{data.pkg.cpak.image}</dd>
			</div>
			<div class="flex">
				<dt class="w-32 font-medium">Binaries</dt>
				<dd class="space-y-1">
					{#each data.pkg.cpak.binaries as b}<div>{b}</div>{/each}
				</dd>
			</div>
			<div class="flex">
				<dt class="w-32 font-medium">Desktop entries</dt>
				<dd class="space-y-1">
					{#each data.pkg.cpak.desktop_entries as d}<div>{d}</div>{/each}
				</dd>
			</div>
			<div class="flex">
				<dt class="w-32 font-medium">Dependencies</dt>
				<dd>
					{#if !data.pkg.cpak.dependencies.length}<em class="text-gray-500">none</em
						>{:else}{data.pkg.cpak.dependencies.join(', ')}{/if}
				</dd>
			</div>
			<div class="flex">
				<dt class="w-32 font-medium">Add-ons</dt>
				<dd>
					{#if !data.pkg.cpak.addons.length}<em class="text-gray-500">none</em
						>{:else}{data.pkg.cpak.addons.join(', ')}{/if}
				</dd>
			</div>
		</dl>
	</section>

	<section class="text-sm text-gray-500">
		<h2 class="mb-2 text-lg font-medium text-gray-900">Raw Links</h2>
		<ul class="list-inside list-disc space-y-1">
			<li>
				<a
					href={data.pkg.manifest}
					class="underline hover:text-[#3E7BFF]"
					target="_blank"
					rel="noopener">manifest.json</a
				>
			</li>
			<li>
				<a
					href={data.pkg.rawCpakJson}
					class="underline hover:text-[#3E7BFF]"
					target="_blank"
					rel="noopener">cpak.json</a
				>
			</li>
		</ul>
	</section>
</div>
