<script lang="ts">
	export let cat: {
		name: string;
		icon: string;
		color: string;
		count: number;
		appIcons?: string[];
	};
</script>
<a
	href={`/store/${cat.name}`}
	class="flex h-full w-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
	style="background-color: {cat.color}20; background-color: var(--tw-bg-opacity, 1) {cat.color}20;"
>
	<div class="flex items-center gap-4">
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full"
				style="background-color: {cat.color}; background-color: var(--tw-bg-opacity, 1) {cat.color};"
			>
				<span class="material-symbols-outlined text-2xl text-gray-900 dark:text-white">
					{cat.icon}
				</span>
			</div>
		<div>
			<h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{cat.name}</h2>
			<p class="text-gray-500 dark:text-gray-400">
				{cat.count} package{cat.count !== 1 ? 's' : ''}
			</p>
		</div>
	</div>

	{#if cat.appIcons && cat.appIcons.length}
		<div class="mt-4 flex -space-x-2">
			{#each cat.appIcons.slice(0, 3) as url}
				<img
					src={url}
					alt="app icon"
					class="h-10 w-10 rounded-full border-2 border-white shadow-sm dark:border-slate-800"
				/>
			{/each}
			{#if cat.count > 3}
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-600 dark:border-slate-800 dark:bg-slate-700 dark:text-gray-300"
				>
					+{cat.count - 3}
				</div>
			{/if}
		</div>
	{/if}
</a>
