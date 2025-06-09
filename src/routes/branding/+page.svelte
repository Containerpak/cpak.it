<script lang="ts">
</script>

<svelte:head>
	<title>Branding Overview – cpak</title>
</svelte:head>

<section class="mx-auto max-w-4xl space-y-12 px-6 py-16">
	<h1 class="font-outfit text-4xl font-extrabold text-gray-900">Branding Overview</h1>
	<p class="text-gray-700">
		cpak is the decentralized, ultra-lightweight, and portable software distribution format. Below
		you’ll find the core brand assets: logo, color palette, and typography.
	</p>

	<div>
		<h2 class="text-2xl font-semibold text-gray-900">Logo Variants</h2>
		<div class="mt-4 grid grid-cols-2 gap-6">
			<div class="space-y-2 rounded-lg border border-slate-200 bg-white p-6 shadow">
				<span class="block text-sm font-medium text-gray-700">Light version</span>
				<div class="flex items-center justify-center rounded-lg bg-gray-50 p-4">
					<img src="/cpak-brand.svg" alt="cpak logo light" class="h-16" />
				</div>
			</div>
			<div class="space-y-2 rounded-lg border border-slate-200 bg-white p-6 shadow">
				<span class="block text-sm font-medium text-gray-700">Dark version</span>
				<div class="flex items-center justify-center rounded-lg bg-gray-900 p-4">
					<img src="/cpak-brand-dark.svg" alt="cpak logo dark" class="h-16" />
				</div>
			</div>
		</div>
		<p class="mt-2 text-sm text-gray-600">
			Use the full-color logo on light backgrounds and the dark-version on dark backgrounds, always
			respecting the clear space.
		</p>
	</div>

	<div>
		<h2 class="text-2xl font-semibold text-gray-900">Color Palette</h2>
		<div class="mt-4 flex flex-wrap gap-6">
			<div class="flex flex-col items-center">
				<div class="h-12 w-12 rounded border border-slate-200 bg-[#4670EC]"></div>
				<span class="mt-1 text-sm text-gray-900">Primary Blue</span>
				<code class="text-xs text-gray-500">#4670EC</code>
			</div>
			<div class="flex flex-col items-center">
				<div class="h-12 w-12 rounded border border-slate-200 bg-[#1F2631]"></div>
				<span class="mt-1 text-sm text-gray-900">Dark Gray</span>
				<code class="text-xs text-gray-500">#1F2631</code>
			</div>
			<div class="flex flex-col items-center">
				<div class="h-12 w-12 rounded border border-slate-200 bg-[#DEE3F4]"></div>
				<span class="mt-1 text-sm text-gray-900">Off-White</span>
				<code class="text-xs text-gray-500">#DEE3F4</code>
			</div>
		</div>
		<p class="mt-2 text-sm text-gray-600">
			These three colors form the foundation of the cpak visual identity.
		</p>
	</div>

	<div>
		<h2 class="text-2xl font-semibold text-gray-900">Typography</h2>
		<p class="mt-4 text-gray-700">
			The brand typeface is <strong class="font-outfit">Outfit</strong>. It’s reserved for official
			cpak assets, see the
			<a href="/branding/guidelines" class="text-[#4670EC] underline">full guidelines</a> for detailed
			rules.
		</p>
		<div
			class="font-outfit mt-4 space-y-2 rounded-lg border border-slate-200 bg-white p-6 text-gray-900 shadow"
		>
			<p class="text-2xl font-semibold">Outfit Headline</p>
			<p class="text-base">The quick brown fox jumps over the lazy dog.</p>
			<p class="text-base italic">1234567890 &mdash; !@#$%^&*</p>
		</div>
	</div>
</section>
