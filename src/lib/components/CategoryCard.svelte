<script lang="ts">
	export let cat: {
		name: string;
		icon: string;
		color: string;
		count: number;
		description: string;
		featured: boolean;
		appIcons: string[];
	};

	$: visibleIcons = cat.appIcons.slice(0, cat.featured ? 5 : 3);
</script>

<a
	href={`/store/${cat.name}`}
	class="category-card group relative flex h-full min-h-[15rem] w-full overflow-hidden rounded-3xl border border-slate-200 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
	style="--category-color: {cat.color}; --category-soft: {cat.color}20; --category-faint: {cat.color}08;"
>
	{#if cat.appIcons.length}
		<div
			class="category-pattern pointer-events-none absolute -inset-12 grid rotate-[-9deg] grid-cols-4 gap-7 opacity-[0.13] transition duration-500 group-hover:scale-105 group-hover:opacity-[0.18]"
			aria-hidden="true"
		>
			{#each [...cat.appIcons, ...cat.appIcons] as url}
				<img src={url} alt="" class="h-16 w-16 object-contain grayscale" />
			{/each}
		</div>
	{/if}
	<div class="category-fade pointer-events-none absolute inset-0"></div>

	<div class="relative z-10 flex h-full min-w-0 flex-1 flex-col">
		<div class="flex items-center justify-between gap-4">
			<div
				class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm"
				style="background-color: {cat.color}"
			>
				<span class="material-symbols-outlined text-2xl text-white">
					{cat.icon}
				</span>
			</div>

			{#if !cat.featured}
				<p class="text-sm font-semibold" style="color: {cat.color}">
					{cat.count} package{cat.count !== 1 ? 's' : ''}
				</p>
			{/if}
		</div>

		<div class={cat.featured ? 'mt-auto max-w-md' : 'mt-auto'}>
			{#if cat.featured}
				<p class="mb-2 text-sm font-semibold" style="color: {cat.color}">
					{cat.count} package{cat.count !== 1 ? 's' : ''}
				</p>
			{/if}
			<h2
				class={cat.featured
					? 'text-4xl font-bold text-gray-900'
					: 'text-2xl font-semibold text-gray-900'}
			>
				{cat.name}
			</h2>
			<p
				class={cat.featured
					? 'mt-3 text-lg leading-7 text-gray-600'
					: 'mt-2 leading-6 text-gray-600'}
			>
				{cat.description}
			</p>
		</div>

		{#if visibleIcons.length}
			<div class="mt-5 flex shrink-0 items-center -space-x-2 pr-10 pb-1">
				{#each visibleIcons as url}
					<img
						src={url}
						alt=""
						class={cat.featured
							? 'h-12 w-12 rounded-full border-2 border-white bg-white object-contain p-1 shadow-sm'
							: 'h-10 w-10 rounded-full border-2 border-white bg-white object-contain p-1 shadow-sm'}
					/>
				{/each}
				{#if cat.count > visibleIcons.length}
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-600"
					>
						+{cat.count - visibleIcons.length}
					</div>
				{/if}
			</div>
		{:else}
			<div class="mt-5 flex items-center gap-2 text-sm font-medium text-gray-500">
				<span class="material-symbols-outlined text-lg">inventory_2</span>
				Packages coming soon
			</div>
		{/if}

		<span
			class="material-symbols-outlined absolute right-0 bottom-0 text-gray-500 transition duration-300 group-hover:translate-x-1 group-hover:text-gray-900"
		>
			arrow_forward
		</span>
	</div>

	{#if cat.featured}
		<div class="relative z-10 hidden flex-1 items-center justify-end sm:flex">
			{#if visibleIcons.length}
				<div
					class="grid grid-cols-2 gap-4 rounded-[2rem] border border-white/60 bg-white/55 p-5 shadow-xl backdrop-blur-sm"
				>
					{#each visibleIcons.slice(0, 4) as url}
						<img
							src={url}
							alt=""
							class="h-20 w-20 rounded-full bg-white p-2 object-contain shadow-sm"
						/>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</a>

<style>
	.category-card {
		background:
			linear-gradient(145deg, var(--category-soft), var(--category-faint) 48%, transparent 82%),
			#fff;
	}

	.category-fade {
		background: linear-gradient(
			135deg,
			rgb(255 255 255 / 0.12),
			rgb(255 255 255 / 0.54) 52%,
			rgb(255 255 255 / 0.9)
		);
	}

	:global(html[data-theme='dark']) .category-card {
		background:
			linear-gradient(145deg, var(--category-soft), var(--category-faint) 48%, transparent 82%),
			#111827;
	}

	:global(html[data-theme='dark']) .category-fade {
		background: linear-gradient(135deg, rgb(17 24 39 / 0.18), rgb(17 24 39 / 0.7) 52%, #111827);
	}

	:global(html[data-theme='dark']) .category-pattern {
		opacity: 0.075;
	}

	:global(html[data-theme='dark']) .category-card:hover .category-pattern {
		opacity: 0.11;
	}
</style>
