<script lang="ts">
	export let pkg: {
		origin: string;
		name: string;
		description: string;
		version: string;
		icon: string;
	};
	export let category: string;
</script>

<a
	href={`/store/${category}/${pkg.origin}`}
	class="flex items-center gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
>
	<img
		src={pkg.icon}
		alt={`${pkg.name} icon`}
		class="h-16 w-16 flex-shrink-0 rounded-lg object-contain shadow-sm"
	/>

	<div class="flex-1">
		<h2 class="text-2xl font-semibold text-gray-900">{pkg.name}</h2>
		<p class="text-gray-600">{pkg.description}</p>
		<p class="mt-2 text-sm text-gray-500">v{pkg.version}</p>
	</div>
</a>
