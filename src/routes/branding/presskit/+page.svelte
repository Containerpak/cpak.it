<script lang="ts">
	type Format = { label: string; file: string };

	const assets = [
		{
			id: 'logo',
			name: 'Logo',
			preview: '/presskit/full/cpak-brand.svg',
			isDarkBg: false,
			description: 'Full-color primary brand logo',
			formats: [
				{ label: 'SVG', file: 'full/cpak-brand.svg' },
				{ label: 'PNG', file: 'full/cpak-brand.png' },
				{ label: 'JPG', file: 'full/cpak-brand.jpg' },
				{ label: 'PDF', file: 'full/cpak-brand.pdf' }
			]
		},
		{
			id: 'logo-dark',
			name: 'Logo (Dark)',
			preview: '/presskit/full/cpak-brand-dark.svg',
			isDarkBg: true,
			description: 'Variant for dark backgrounds',
			formats: [
				{ label: 'SVG', file: 'full/cpak-brand-dark.svg' },
				{ label: 'PNG', file: 'full/cpak-brand-dark.png' },
				{ label: 'JPG', file: 'full/cpak-brand-dark.jpg' },
				{ label: 'PDF', file: 'full/cpak-brand-dark.pdf' }
			]
		},
		{
			id: 'icon',
			name: 'Icon',
			preview: '/presskit/icon/cpak-icon.svg',
			isDarkBg: false,
			description: 'Standalone app icon',
			formats: [
				{ label: 'SVG', file: 'icon/cpak-icon.svg' },
				{ label: 'PNG', file: 'icon/cpak-icon.png' },
				{ label: 'JPG', file: 'icon/cpak-icon.jpg' },
				{ label: 'PDF', file: 'icon/cpak-icon.pdf' }
			]
		},
		{
			id: 'icon-dark',
			name: 'Icon (Dark)',
			preview: '/presskit/icon/cpak-icon-dark.svg',
			isDarkBg: true,
			description: 'Icon variant for dark contexts',
			formats: [
				{ label: 'SVG', file: 'icon/cpak-icon-dark.svg' },
				{ label: 'PNG', file: 'icon/cpak-icon-dark.png' },
				{ label: 'JPG', file: 'icon/cpak-icon-dark.jpg' },
				{ label: 'PDF', file: 'icon/cpak-icon-dark.pdf' }
			]
		},
		{
			id: 'showcase',
			name: 'Brand Showcase',
			preview: '/presskit/brand-showcase.pdf',
			isDarkBg: false,
			description: 'Detailed PDF overview of cpak branding',
			formats: [{ label: 'PDF', file: 'brand-showcase.pdf' }]
		},
		{
			id: 'fonts',
			name: 'Outfit Fonts',
			preview: '/presskit/fonts/outfit-webfont.zip',
			isDarkBg: false,
			description: 'Webfont & desktop packages',
			formats: [
				{ label: 'Webfont ZIP', file: 'fonts/outfit-webfont.zip' },
				{ label: 'Desktop ZIP', file: 'fonts/outfit.zip' }
			]
		}
	];

	let openDropdown: string | null = null;
	function toggle(id: string) {
		openDropdown = openDropdown === id ? null : id;
	}
</script>

<svelte:head>
	<title>Press Kit – cpak</title>
</svelte:head>

<section class="mx-auto max-w-7xl px-6 py-16">
	<h1 class="mb-4 text-4xl font-extrabold text-gray-900">Press Kit</h1>
	<p class="mb-8 text-gray-700">
		Download all official cpak assets: logos, icons, fonts and full branding showcase.
	</p>

	<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
		{#each assets as asset}
			<div
				class={`relative rounded-xl border p-6 shadow-sm transition hover:shadow-md ${asset.isDarkBg ? 'border-gray-700 bg-gray-900 text-white' : 'border-slate-200 bg-white text-gray-900'}`}
			>
				<h2 class="mb-2 text-lg font-semibold">{asset.name}</h2>
				<div
					class={`flex items-center justify-center rounded-lg p-4 ${asset.isDarkBg ? 'bg-gray-800' : 'bg-gray-50'}`}
				>
					{#if /\.(svg|png|jpe?g)$/i.test(asset.preview)}
						<img src={asset.preview} alt={asset.name} class="max-h-24 w-auto" />
					{:else}
						<span class="text-sm underline">{asset.preview.split('/').pop()}</span>
					{/if}
				</div>
				<p class="mt-4 text-sm">{asset.description}</p>
				<div class="mt-4">
					<button
						on:click={() => toggle(asset.id)}
						class={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow ${asset.isDarkBg ? 'bg-white text-gray-900 hover:bg-gray-200' : 'bg-[#4670EC] text-white hover:bg-[#3568d1]'}`}
					>
						Formats
						<span class="material-symbols-outlined">keyboard_arrow_down</span>
					</button>
					{#if openDropdown === asset.id}
						<ul
							class={`absolute z-10 mt-2 w-40 rounded-lg shadow-lg ${asset.isDarkBg ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
						>
							{#each asset.formats as fmt}
								<li>
									<a
										href={`/presskit/${fmt.file}`}
										download
										class={`block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900 ${asset.isDarkBg ? 'hover:bg-gray-700' : ''}`}
									>
										{fmt.label}
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<section class="mt-12">
		<h2 class="mb-4 text-2xl font-semibold text-gray-900">Icon Set Preview</h2>
		<div class="flex flex-wrap items-end gap-6">
			{#each [16, 24, 32, 48, 64, 128] as size}
				<div class="flex flex-col items-center">
					<img
						src={`/presskit/iconset/svg/cpak-icon-${size}.svg`}
						alt={`Icon ${size}px`}
						style="height: {size}px; width: auto"
					/>
					<span class="mt-1 text-sm text-gray-500">{size} px</span>
				</div>
			{/each}
		</div>
	</section>

	<div class="mt-12 text-center">
		<a
			href="/presskit/cpak-brand.zip"
			download
			class="inline-block rounded-full bg-[#4670EC] px-8 py-3 font-semibold text-white shadow-sm transition hover:bg-[#3568d1]"
		>
			Download All Assets (ZIP)
		</a>
	</div>
</section>
