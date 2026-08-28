<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { renderMarkdown } from '$lib/markdown';
	export let data: any;

	type PermissionObject = Record<string, boolean | string | string[]>;
	type PermissionValue =
		| boolean
		| number
		| string
		| string[]
		| PermissionObject
		| PermissionObject[];
	type PermissionInfo = {
		label: string;
		description: string;
		icon: string;
		broad?: boolean;
	};

	const permissions: Record<string, PermissionInfo> = {
		displayX11: {
			label: 'Isolated X11 display',
			description: 'Shows application windows through a private X11 compatibility display.',
			icon: 'desktop_windows',
		},
		socketX11: {
			label: 'X11 display',
			description: 'Shows application windows through X11.',
			icon: 'desktop_windows',
		},
		socketWayland: {
			label: 'Wayland display',
			description: 'Shows application windows through Wayland.',
			icon: 'desktop_windows',
		},
		socketPulseAudio: {
			label: 'Audio',
			description: 'Plays and records audio through the desktop sound service.',
			icon: 'volume_up',
		},
		socketSessionBus: {
			label: 'Desktop services',
			description: 'Communicates with services in the current desktop session.',
			icon: 'hub',
		},
		socketSystemBus: {
			label: 'System services',
			description: 'Communicates with services available to the whole system.',
			icon: 'dns',
			broad: true,
		},
		socketSshAgent: {
			label: 'SSH agent',
			description: 'Uses SSH credentials managed by the current session.',
			icon: 'key',
		},
		socketCups: {
			label: 'Printing',
			description: 'Sends documents to printers configured on the host.',
			icon: 'print',
		},
		socketGpgAgent: {
			label: 'GPG agent',
			description: 'Uses GPG keys managed by the current session.',
			icon: 'encrypted',
		},
		socketAtSpiBus: {
			label: 'Accessibility',
			description: 'Works with desktop accessibility services.',
			icon: 'accessibility_new',
		},
		socketBluetooth: {
			label: 'Bluetooth',
			description: 'Communicates with the host Bluetooth service.',
			icon: 'bluetooth',
		},
		bluetooth: {
			label: 'Bluetooth',
			description: 'Communicates only with BlueZ through a private proxy.',
			icon: 'bluetooth',
		},
		deviceDri: {
			label: 'Graphics devices',
			description: 'Uses hardware accelerated graphics.',
			icon: 'videogame_asset',
		},
		deviceKvm: {
			label: 'Virtualization',
			description: 'Uses hardware virtualization through KVM.',
			icon: 'memory',
		},
		deviceShm: {
			label: 'Shared memory',
			description: 'Uses the host shared memory device.',
			icon: 'memory_alt',
		},
		deviceAlsa: {
			label: 'ALSA devices',
			description: 'Accesses audio devices directly.',
			icon: 'speaker',
		},
		deviceVideo: {
			label: 'Video devices',
			description: 'Accesses cameras and video capture devices.',
			icon: 'videocam',
		},
		deviceFuse: {
			label: 'FUSE',
			description: 'Creates userspace filesystems.',
			icon: 'account_tree',
		},
		deviceTun: {
			label: 'TUN/TAP',
			description: 'Creates virtual network interfaces.',
			icon: 'lan',
		},
		deviceUsb: {
			label: 'USB devices',
			description: 'Accesses USB devices connected to the host.',
			icon: 'usb',
		},
		deviceSerial: {
			label: 'Serial ports',
			description: 'Talks to boards and instruments on a serial port.',
			icon: 'cable',
		},
		deviceAll: {
			label: 'Host devices',
			description: 'Accesses host devices required by hardware and gaming features.',
			icon: 'devices',
			broad: true,
		},
		notification: {
			label: 'Notifications',
			description: 'Shows desktop notifications.',
			icon: 'notifications',
		},
		openURI: {
			label: 'Open links',
			description: 'Opens web and application links on the host.',
			icon: 'open_in_new',
		},
		filePicker: {
			label: 'Selected files',
			description: 'Opens the native file chooser and grants only the items selected by the user.',
			icon: 'file_open',
		},
		filesystem: {
			label: 'Files',
			description: 'Reads or writes selected host folders.',
			icon: 'folder_open',
		},
		network: {
			label: 'Network',
			description: 'Connects to local networks and the internet.',
			icon: 'language',
		},
		process: {
			label: 'Host processes',
			description: 'Shares the host process namespace.',
			icon: 'account_tree',
			broad: true,
		},
		userNamespaces: {
			label: 'Nested sandboxes',
			description: 'Creates user namespaces for nested application sandboxes.',
			icon: 'deployed_code',
		},
		asRoot: {
			label: 'Container root',
			description: 'Runs the application as root inside its container.',
			icon: 'admin_panel_settings',
			broad: true,
		},
		hostActions: {
			label: 'Host services',
			description: 'Uses the listed capabilities from a built-in cpak provider.',
			icon: 'shield_lock',
		},
		allowedHostCommands: {
			label: 'Legacy host integration',
			description: 'Uses an older manifest field converted to typed permissions during install.',
			icon: 'history',
		},
	};
	const overrides = data.pkg.cpak.override as Record<string, PermissionValue>;
	const permissionEntries = Object.entries(overrides).filter(([key]) => permissions[key]);
	const isGranted = (value: PermissionValue) => {
		if (Array.isArray(value)) return value.length > 0;
		if (typeof value === 'boolean') return value;
		if (typeof value === 'number') return value > 0;
		if (typeof value === 'object') return Object.values(value).some(Boolean);
		return Boolean(value);
	};
	const permissionDetail = (key: string, value: PermissionValue) => {
		if (key === 'filesystem' && Array.isArray(value)) {
			return value
				.map((entry) => {
					if (typeof entry === 'string') return entry;
					const path = Array.isArray(entry.path) ? entry.path.join(', ') : entry.path;
					const access = Array.isArray(entry.access)
						? entry.access.join(', ')
						: typeof entry.access === 'string'
							? entry.access.replace('-', ' ')
							: '';
					return `${path} (${access})`;
				})
				.join(', ');
		}
		if (key === 'hostActions' && Array.isArray(value)) {
			return value
				.map((entry) => {
					if (typeof entry === 'string') return entry;
					const capabilities = Array.isArray(entry.capabilities)
						? entry.capabilities.join(', ')
						: entry.capabilities;
					return `${entry.provider}: ${capabilities}`;
				})
				.join('; ');
		}
		if (key === 'filePicker' && !Array.isArray(value) && typeof value === 'object') {
			const labels: Record<string, string> = {
				openFile: 'open files',
				openFolder: 'open folders',
				saveFile: 'save files',
				persistent: 'persistent access',
				containingFolder: 'optional folder context',
			};
			return Object.entries(value)
				.filter(([key, enabled]) => labels[key] && enabled === true)
				.map(([key]) => labels[key])
				.join(', ');
		}
		if (key === 'allowedHostCommands' && Array.isArray(value)) return value.join(', ');
		return '';
	};

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
		copied = false,
		directCopied = false,
		installerArch = 'amd64';
	$: installerPath = `/install/${data.pkg.origin}?arch=${installerArch}`;
	onMount(() => {
		const agent = navigator.userAgent.toLowerCase();
		if (agent.includes('aarch64') || agent.includes('arm64')) installerArch = 'arm64';
	});
	async function copyInstall() {
		await navigator.clipboard.writeText(cmd);
		copied = true;
		await tick();
		setTimeout(() => (copied = false), 3000);
	}
	async function copyInstallerURL() {
		await navigator.clipboard.writeText(new URL(installerPath, window.location.origin).toString());
		directCopied = true;
		await tick();
		setTimeout(() => (directCopied = false), 3000);
	}
	function toggleDropdown() {
		showTooltip = !showTooltip;
	}
	function dependencyName(dependency: string | { origin: string }) {
		return typeof dependency === 'string' ? dependency : dependency.origin;
	}

	let showDisabled = false;
	$: storeReadme = data.pkg.storeReadme ? renderMarkdown(data.pkg.storeReadme) : '';
</script>

<Seo
	title={`${data.pkg.name} for Linux - Install with cpak`}
	description={`Install ${data.pkg.name} ${data.pkg.version} on Linux with cpak. ${data.pkg.description}`}
	path={data.canonicalPath}
	image={data.pkg.icon}
	type="product"
	structuredData={data.schema}
/>

<div
	class="package-page mx-auto max-w-5xl space-y-14 px-6 py-16"
	style="--category-color: {data.categoryMeta.color}; --category-soft: {data.categoryMeta.color}1a;"
>
	<nav class="flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
		<a href="/store" class="hover:text-[#3E7BFF]">Store</a>
		<span class="material-symbols-outlined text-base">chevron_right</span>
		<a href={`/store/${encodeURIComponent(data.category)}`} class="hover:text-[#3E7BFF]">
			{data.category}
		</a>
		<span class="material-symbols-outlined text-base">chevron_right</span>
		<span>{data.pkg.name}</span>
	</nav>
	<section
		class="package-hero relative flex flex-col items-start justify-between gap-10 py-6 md:flex-row md:items-center md:py-10"
	>
		<div class="pointer-events-none absolute inset-0 overflow-hidden">
			<img
				src={data.pkg.icon}
				alt=""
				aria-hidden="true"
				class="absolute -top-20 -right-8 h-72 w-72 rotate-12 object-contain opacity-[0.055] grayscale"
			/>
			<div class="package-hero-fade absolute inset-0"></div>
		</div>

		<div class="relative z-10 flex items-center gap-6">
			<img
				src={data.pkg.icon}
				alt={`${data.pkg.name} icon`}
				class="h-24 w-24 shrink-0 object-contain"
			/>
			<div class="min-w-0">
				<p class="mb-2 text-sm font-semibold" style="color: {data.categoryMeta.color}">
					{data.category}
				</p>
				<h1 class="text-4xl font-extrabold text-gray-900">
					{data.pkg.name}
					<span class="ml-2 align-middle text-sm font-semibold text-gray-500"
						>v{data.pkg.version}</span
					>
				</h1>
				<p class="mt-3 max-w-2xl text-lg leading-7 text-gray-600">
					{data.pkg.description}
				</p>
			</div>
		</div>
		<div class="relative z-20 flex shrink-0 items-stretch">
			<a
				href={installerPath}
				class="rounded-l-2xl px-5 py-3 font-semibold text-white shadow-lg transition hover:brightness-110"
				style="background-color: {data.categoryMeta.color}"
			>
				Download installer
			</a>
			<button
				on:click={toggleDropdown}
				class="flex items-center justify-center rounded-r-2xl border-l border-white/20 px-3 py-3 text-white shadow-lg transition hover:brightness-110"
				style="background-color: {data.categoryMeta.color}"
				aria-label="Installation options"
			>
				<span class="material-symbols-outlined text-sm">keyboard_arrow_down</span>
			</button>
			{#if showTooltip}
				<div
					class="absolute top-12 left-1/2 z-10 mb-2 w-[calc(100vw-3rem)] max-w-80 -translate-x-1/2 overflow-hidden rounded-xl border border-gray-700 bg-gray-800 text-gray-100 shadow-xl sm:right-0 sm:left-auto sm:w-80 sm:translate-x-0"
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
					<button
						on:click={copyInstall}
						class="flex w-full items-center justify-between gap-4 border-b border-gray-700 px-4 py-3 text-left hover:bg-gray-700"
					>
						<span>
							<strong class="block text-sm"
								>{copied ? 'Command copied' : 'Copy install command'}</strong
							>
							<code class="block truncate text-xs text-gray-400">{cmd}</code>
						</span>
						<span class="material-symbols-outlined text-base">content_copy</span>
					</button>
					<button
						on:click={copyInstallerURL}
						class="flex w-full items-center justify-between gap-4 border-b border-gray-700 px-4 py-3 text-left hover:bg-gray-700"
					>
						<span>
							<strong class="block text-sm"
								>{directCopied ? 'URL copied' : 'Copy direct installer URL'}</strong
							>
						</span>
						<span class="material-symbols-outlined text-base">link</span>
					</button>
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
		<section class="relative mx-auto max-w-5xl">
			<div class="overflow-hidden rounded-3xl">
				<div
					class="flex transition-transform duration-500 ease-in-out"
					style="transform: translateX(calc(-100% * {idx}));"
				>
					{#each slides as src}
						<div class="flex aspect-video w-full flex-shrink-0 items-center justify-center p-3">
							<!-- svelte-ignore a11y_media_has_caption -->
							<!-- svelte-ignore element_invalid_self_closing_tag -->
							{#if src.endsWith('.webm')}
								<!-- svelte-ignore a11y_media_has_caption -->
								<video {src} controls class="h-full w-full rounded-2xl object-contain" />
							{:else}
								<img
									{src}
									alt={`${data.pkg.name} screenshot ${idx + 1}`}
									class="h-full w-full rounded-2xl object-contain"
								/>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<button
				on:click={prev}
				class="carousel-control absolute top-1/2 left-3 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 p-2 shadow-lg backdrop-blur transition hover:bg-white"
			>
				<span class="material-symbols-outlined">chevron_left</span>
			</button>
			<button
				on:click={next}
				class="carousel-control absolute top-1/2 right-3 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 p-2 shadow-lg backdrop-blur transition hover:bg-white"
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
						class="h-2.5 w-2.5 cursor-pointer rounded-full bg-gray-300 transition"
						style={i === idx ? `background-color: ${data.categoryMeta.color}` : ''}
						on:click={() => go(i)}
					/>
				{/each}
			</div>
		</section>
	{/if}

	{#if storeReadme}
		<section class="doc-body store-readme">
			{@html storeReadme}
		</section>
	{/if}

	<section>
		<div class="mb-5">
			<h2 class="text-2xl font-semibold text-gray-900">Permissions</h2>
			<p class="mt-1 text-sm text-gray-500">What this package can access on your system.</p>
		</div>
		<div class="mb-4 grid auto-rows-fr gap-4 sm:grid-cols-2">
			{#each permissionEntries.filter(([_, value]) => isGranted(value)) as [key, value]}
				<div
					class="package-surface flex h-full min-w-0 items-start gap-4 rounded-2xl border border-slate-200 p-4 shadow-sm"
				>
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100"
						style="color: {data.categoryMeta.color}"
					>
						<span class="material-symbols-outlined text-xl">{permissions[key].icon}</span>
					</div>
					<div class="min-w-0 flex-1">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<h3 class="font-semibold text-gray-900">
								{permissions[key].label}
							</h3>
							<span
								class={permissions[key].broad
									? 'rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800'
									: 'rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-[#3158c7]'}
							>
								{permissions[key].broad ? 'Broad access' : 'Allowed'}
							</span>
						</div>
						<p class="mt-1 text-sm leading-5 text-gray-500">
							{permissions[key].description}
						</p>
						{#if permissionDetail(key, value)}
							<p class="mt-2 text-xs font-medium break-words text-gray-700">
								{permissionDetail(key, value)}
							</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
		{#if permissionEntries.some(([_, value]) => !isGranted(value))}
			<button
				on:click={() => (showDisabled = !showDisabled)}
				class="mb-3 flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-medium text-gray-700"
			>
				<span class="material-symbols-outlined">{showDisabled ? 'expand_less' : 'expand_more'}</span
				>
				{showDisabled ? 'Hide disabled permissions' : 'Show disabled permissions'}
			</button>
			{#if showDisabled}
				<div class="grid gap-3 sm:grid-cols-2">
					{#each permissionEntries.filter(([_, value]) => !isGranted(value)) as [key]}
						<div
							class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
						>
							<span class="flex min-w-0 items-center gap-3 text-sm text-gray-500">
								<span class="material-symbols-outlined text-lg">{permissions[key].icon}</span>
								{permissions[key].label}
							</span>
							<span class="text-xs font-medium text-gray-500">Not allowed</span>
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</section>

	<section class="package-surface rounded-3xl border border-slate-200 p-6 shadow-sm">
		<h2 class="mb-5 text-xl font-semibold text-gray-900">Package details</h2>
		<dl class="grid grid-cols-1 gap-x-10 gap-y-6 text-sm text-gray-700 sm:grid-cols-2">
			<div class="min-w-0">
				<dt class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Origin</dt>
				<dd class="mt-1 min-w-0 break-words">{data.pkg.origin}</dd>
			</div>
			<div class="min-w-0">
				<dt class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Image</dt>
				<dd class="mt-1 min-w-0 break-words">{data.pkg.cpak.image}</dd>
			</div>
			<div class="min-w-0">
				<dt class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Binaries</dt>
				<dd class="mt-1 min-w-0 space-y-1 break-words">
					{#each data.pkg.cpak.binaries as b}<div>{b}</div>{/each}
				</dd>
			</div>
			<div class="min-w-0">
				<dt class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Desktop entries</dt>
				<dd class="mt-1 min-w-0 space-y-1 break-words">
					{#each data.pkg.cpak.desktop_entries as d}<div>{d}</div>{/each}
				</dd>
			</div>
		</dl>
	</section>

	<section class="space-y-3">
		<details class="package-surface group rounded-2xl border border-slate-200 shadow-sm">
			<summary class="flex cursor-pointer list-none items-center gap-4 p-5">
				<span
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100"
					style="color: {data.categoryMeta.color}"
				>
					<span class="material-symbols-outlined">account_tree</span>
				</span>
				<span class="min-w-0 flex-1">
					<strong class="block text-gray-900">Dependencies</strong>
					<span class="text-sm text-gray-500">
						{data.pkg.cpak.dependencies.length} required package{data.pkg.cpak.dependencies
							.length === 1
							? ''
							: 's'}
					</span>
				</span>
				<span class="material-symbols-outlined text-gray-500 transition group-open:rotate-180"
					>expand_more</span
				>
			</summary>
			<div class="border-t border-slate-200 px-5 py-3">
				{#if data.pkg.cpak.dependencies.length}
					{#each data.pkg.cpak.dependencies as dependency}
						<div class="flex items-center gap-3 py-2 text-sm text-gray-700">
							<span class="material-symbols-outlined text-lg text-gray-500">deployed_code</span>
							<span class="min-w-0 break-words">{dependencyName(dependency)}</span>
						</div>
					{/each}
				{:else}
					<p class="py-2 text-sm text-gray-500">This package has no dependencies.</p>
				{/if}
			</div>
		</details>

		<details class="package-surface group rounded-2xl border border-slate-200 shadow-sm">
			<summary class="flex cursor-pointer list-none items-center gap-4 p-5">
				<span
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100"
					style="color: {data.categoryMeta.color}"
				>
					<span class="material-symbols-outlined">extension</span>
				</span>
				<span class="min-w-0 flex-1">
					<strong class="block text-gray-900">Add-ons</strong>
					<span class="text-sm text-gray-500">
						{data.pkg.cpak.addons.length} optional package{data.pkg.cpak.addons.length === 1
							? ''
							: 's'}
					</span>
				</span>
				<span class="material-symbols-outlined text-gray-500 transition group-open:rotate-180"
					>expand_more</span
				>
			</summary>
			<div class="border-t border-slate-200 px-5 py-3">
				{#if data.pkg.cpak.addons.length}
					{#each data.pkg.cpak.addons as addon}
						<div class="flex items-center gap-3 py-2 text-sm text-gray-700">
							<span class="material-symbols-outlined text-lg text-gray-500">extension</span>
							<span class="min-w-0 break-words">{addon}</span>
						</div>
					{/each}
				{:else}
					<p class="py-2 text-sm text-gray-500">This package has no add-ons.</p>
				{/if}
			</div>
		</details>
	</section>

	<section class="text-sm text-gray-500">
		<h2 class="mb-2 text-lg font-medium text-gray-900">Raw links</h2>
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
			{#if data.pkg.storeReadmeUrl}
				<li>
					<a
						href={data.pkg.storeReadmeUrl}
						class="underline hover:text-[#3E7BFF]"
						target="_blank"
						rel="noopener">STORE-README.md</a
					>
				</li>
			{/if}
		</ul>
	</section>

	{#if data.related.length}
		<section>
			<h2 class="text-2xl font-semibold text-gray-900">
				More from {data.category}
			</h2>
			<div class="mt-5 grid gap-4 sm:grid-cols-3">
				{#each data.related as related}
					<a
						href={`/store/apps/${related.slug}`}
						class="package-surface rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
					>
						<img src={related.icon} alt={`${related.name} icon`} class="h-12 w-12 object-contain" />
						<h3 class="mt-4 font-semibold text-gray-900">{related.name}</h3>
						<p class="mt-1 line-clamp-2 text-sm text-gray-500">
							{related.description}
						</p>
					</a>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.package-hero {
		background: radial-gradient(circle at 82% 42%, var(--category-soft), transparent 38%);
	}

	.package-hero-fade {
		background: linear-gradient(90deg, transparent 56%, rgb(255 255 255 / 0.78));
	}

	.package-surface {
		background: linear-gradient(145deg, var(--category-soft), transparent 60%), #fff;
	}

	.carousel-control {
		color: #111827;
	}

	:global(html[data-theme='dark']) .package-hero-fade {
		background: linear-gradient(90deg, transparent 56%, rgb(17 24 39 / 0.76));
	}

	:global(html[data-theme='dark']) .package-surface {
		background: linear-gradient(145deg, var(--category-soft), transparent 60%), #111827;
	}
</style>
