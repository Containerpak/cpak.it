<script lang="ts">
	export let pkg: {
		origin: string;
		slug: string;
		name: string;
		description: string;
		version?: string;
		icon: string;
	};
	export let color: string;
</script>

<a
	href={`/store/apps/${pkg.slug}`}
	class="package-card group relative flex h-full min-h-[19rem] flex-col overflow-hidden rounded-3xl border border-slate-200 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
	style="--package-color: {color}; --package-soft: {color}1a;"
>
	<img
		src={pkg.icon}
		alt=""
		aria-hidden="true"
		class="pointer-events-none absolute -top-10 -right-10 h-52 w-52 rotate-12 object-contain opacity-[0.055] grayscale transition duration-500 group-hover:scale-105 group-hover:opacity-[0.09]"
	/>
	<div class="package-fade pointer-events-none absolute inset-0"></div>

	<div class="relative z-10 flex h-full flex-col">
		<img
			src={pkg.icon}
			alt={`${pkg.name} icon`}
			class="h-16 w-16 shrink-0 rounded-full border-2 border-white bg-white object-contain p-1 shadow-sm"
		/>

		<div class="mt-auto pt-8">
			{#if pkg.version}
				<p class="mb-2 text-sm font-semibold" style="color: {color}">
					v{pkg.version}
				</p>
			{/if}
			<h2 class="text-2xl font-semibold text-gray-900">{pkg.name}</h2>
			<p class="package-description mt-2 leading-6 text-gray-600">
				{pkg.description}
			</p>
		</div>

		<span
			class="material-symbols-outlined mt-5 self-end text-gray-500 transition duration-300 group-hover:translate-x-1 group-hover:text-gray-900"
		>
			arrow_forward
		</span>
	</div>
</a>

<style>
	.package-card {
		background: linear-gradient(145deg, var(--package-soft), transparent 72%), #fff;
	}

	.package-fade {
		background: linear-gradient(135deg, rgb(255 255 255 / 0.16), rgb(255 255 255 / 0.76) 58%, #fff);
	}

	.package-description {
		display: -webkit-box;
		overflow: hidden;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
	}

	:global(html[data-theme='dark']) .package-card {
		background: linear-gradient(145deg, var(--package-soft), transparent 72%), #111827;
	}

	:global(html[data-theme='dark']) .package-fade {
		background: linear-gradient(135deg, rgb(17 24 39 / 0.12), rgb(17 24 39 / 0.72) 58%, #111827);
	}
</style>
