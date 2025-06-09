<script lang="ts">
</script>

<svelte:head>
	<title>Brand Guidelines – cpak</title>
</svelte:head>

<section class="mx-auto max-w-4xl space-y-12 px-6 py-16">
	<h1 class="text-4xl font-extrabold text-gray-900">Brand Guidelines</h1>

	<div class="space-y-6">
		<h2 class="text-2xl font-semibold text-gray-900">Logo Usage</h2>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
				<div class="flex items-center gap-2">
					<span class="material-symbols-outlined text-green-600">check_circle</span>
					<h3 class="text-lg font-semibold">Correct</h3>
				</div>
				<div
					class="flex items-center justify-center rounded-lg border border-slate-200 bg-gray-50 p-4"
				>
					<img src="/cpak-brand.svg" alt="Correct logo usage" class="h-16" />
				</div>
				<p class="text-sm text-gray-600">
					Use the full-color logo on a light background, always respecting the clear space.
				</p>
			</div>
			<div class="space-y-4 rounded-lg border border-red-200 bg-white p-6 shadow-sm">
				<div class="flex items-center gap-2">
					<span class="material-symbols-outlined text-red-600">cancel</span>
					<h3 class="text-lg font-semibold">Filtered</h3>
				</div>
				<div
					class="flex items-center justify-center rounded-lg border border-red-200 bg-gray-50 p-4"
				>
					<img
						src="/cpak-brand.svg"
						alt="Incorrect: filtered logo"
						class="h-16 contrast-50 grayscale filter"
					/>
				</div>
				<p class="text-sm text-gray-600">
					Don’t apply filters, opacity or color shifts—always use the logo’s original colors.
				</p>
			</div>
			<div class="space-y-4 rounded-lg border border-red-200 bg-white p-6 shadow-sm">
				<div class="flex items-center gap-2">
					<span class="material-symbols-outlined text-red-600">cancel</span>
					<h3 class="text-lg font-semibold">Cropped</h3>
				</div>
				<div
					class="flex items-center justify-center overflow-hidden rounded-lg border border-red-200 bg-gray-50 p-4"
					style="height:4rem"
				>
					<img
						src="/cpak-brand.svg"
						alt="Incorrect: cropped logo"
						class="h-16 w-auto -translate-x-4"
					/>
				</div>
				<p class="text-sm text-gray-600">
					Don’t crop or cut off any part of the logo—always show it in full.
				</p>
			</div>
			<div class="space-y-4 rounded-lg border border-red-200 bg-white p-6 shadow-sm">
				<div class="flex items-center gap-2">
					<span class="material-symbols-outlined text-red-600">cancel</span>
					<h3 class="text-lg font-semibold">Wrong background</h3>
				</div>
				<div
					class="flex items-center justify-center rounded-lg border border-red-200 p-4"
					style="background-color:#FFCDD2"
				>
					<img src="/cpak-brand.svg" alt="Incorrect: wrong bg" class="h-16" />
				</div>
				<p class="text-sm text-gray-600">
					Don’t place the logo on clashing or unreadable backgrounds—stick to approved light or dark
					contexts.
				</p>
			</div>
		</div>
	</div>

	<div class="space-y-6">
		<h2 class="text-2xl font-semibold text-gray-900">Typography Usage</h2>
		<p class="text-gray-700">
			The brand typeface is <strong>Outfit</strong>. Use it only when creating official cpak-branded
			assets (logos, badges, UI elements, presentations). Do <em>not</em> use Outfit for general body
			text, blog posts, or third-party materials.
		</p>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
				<div class="flex items-center gap-2">
					<span class="material-symbols-outlined text-green-600">check_circle</span>
					<h3 class="text-lg font-semibold">Correct</h3>
				</div>
				<div class="space-y-2 rounded-lg border border-slate-200 bg-gray-50 p-4">
					<p class="text-3xl font-extrabold" style="font-family: 'Outfit', sans-serif">cpak</p>
					<p class="text-2xl font-bold" style="font-family: 'Outfit', sans-serif">Heading Style</p>
					<p class="text-base" style="font-family: 'Outfit', sans-serif; line-height:1.5">
						Body text sample in Outfit. Ideal for brand collateral and UI elements.
					</p>
				</div>
			</div>
			<div class="space-y-4 rounded-lg border border-red-200 bg-white p-6 shadow-sm">
				<div class="flex items-center gap-2">
					<span class="material-symbols-outlined text-red-600">cancel</span>
					<h3 class="text-lg font-semibold">Incorrect</h3>
				</div>
				<div class="space-y-2 rounded-lg border border-red-200 bg-gray-50 p-4">
					<p class="text-3xl font-extrabold" style="font-family: 'Arial', sans-serif">
						Wrong Typeface
					</p>
					<p class="text-base" style="font-family: 'Times New Roman', serif">
						Never substitute Outfit with other fonts for branded materials.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>
