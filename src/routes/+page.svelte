<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	const features = [
		{
			id: 'footprint',
			title: 'Ultra-light footprint',
			desc: 'Compact bundles (< 30 MB) and a single no-deps runtime binary—ideal for embedded systems, IoT devices, and resource-constrained environments.',
			details: `cpak bundles include only the application binaries and their direct dependencies, resulting in package sizes under 30 MB. The runtime is a single, self-contained binary with zero external dependencies, eliminating the need to install libraries or daemons. This minimizes attack surface and storage overhead, making cpak perfect for edge devices, CI runners, and offline deployments.`
		},
		{
			id: 'docker',
			title: 'Docker-style compatibility',
			desc: 'Familiar Dockerfile syntax, layer caching, and incremental builds—without requiring a container daemon in production.',
			details: `Use the same Dockerfile instructions you already know; cpak reuses build layers for fast incremental builds and cacheable steps. Integrate seamlessly into existing CI/CD pipelines without installing or managing a background daemon in live environments. This approach speeds up build times, reduces infrastructure complexity, and ensures reproducible artifacts across development, staging, and production.`
		},
		{
			id: 'nvidia',
			title: 'NVIDIA driver passthrough',
			desc: 'Automatic host GPU driver binding—no need to rebuild or reinstall drivers for instant hardware acceleration.',
			details: `cpak detects NVIDIA driver libraries and binaries on the host system and bind-mounts them into the container at runtime. This avoids redundant driver installations and ensures full compatibility with CUDA and other GPU frameworks. Ideal for AI/ML workloads, data visualization, and GPU-accelerated rendering on edge servers or developer workstations.`
		},
		{
			id: 'secure',
			title: 'Secure system resource access',
			desc: 'Declarative bind-mounts for DBus, sockets, devices, and more—grant only the resources you need without code changes.',
			details: `Define exactly which system resources (DBus, UNIX sockets, GPIO, camera devices, audio, network interfaces, etc.) your application can access via simple override flags. No modifications to the app’s source code are required, enforcing the principle of least privilege and reducing your attack surface. This model is ideal for secure production environments, CI isolation, and multi-tenant edge deployments.`
		},
		{
			id: 'git',
			title: 'Git-native versioning',
			desc: 'Install any tag, branch, or exact commit SHA—mix semantic version tags with Git refs for fine-grained control.',
			details: `Specify package versions directly using Git refs: tags, branches, or commit SHAs. This enables you to pin to an exact commit for reproducible deployments or follow a development branch for continuous integration. Combine conventional semver tags with Git references to implement strategies like canary releases, hotfix branches, and automatic rollbacks with full auditability.`
		},
		{
			id: 'build',
			title: 'Build once, run anywhere',
			desc: 'One OCI bundle and one command (cpak run)—cross-platform compatibility on ARM, x86, Raspberry Pi, VM, or desktop.',
			details: `Create a single OCI-compliant bundle that runs unmodified across architectures and environments: ARM embedded boards, x86 server clusters, Raspberry Pi fleets, cloud virtual machines, or local developer machines. Use the same \`cpak run\` invocation everywhere—no extra learning curve, no platform-specific tweaks, and consistent behavior from your laptop to production edge nodes.`
		}
	];

	let showModal = false;
	let active = features[0].id;
	let activeFeature = features[0];
	$: activeFeature = features.find((f) => f.id === active) ?? features[0];
	function open(id: string) {
		active = id;
		showModal = true;
	}
	function close() {
		showModal = false;
	}
</script>

<svelte:head>
	<title>cpak - Deploy as freely as you develop</title>
	<meta
		name="description"
		content="cpak is a decentralized and versatile software distribution format for any context."
	/>
</svelte:head>

<Header />

<main class="bg-slate-50">
	<section class="mx-auto flex max-w-7xl flex-col items-center gap-20 px-6 pt-28 pb-36 lg:flex-row">
		<img src="/cpak-isometric-cubes.svg" alt="Isometric cubes" class="w-96 lg:w-[28rem]" />
		<div class="text-center lg:text-left">
			<h1 class="text-6xl leading-tight font-extrabold tracking-tight text-gray-900 lg:text-7xl">
				Deploy as <span class="text-[#3E7BFF]">freely</span><br />as you develop
			</h1>
			<p class="mx-auto mt-8 max-w-md text-xl text-gray-600 lg:mx-0">
				<span class="font-semibold text-gray-900">cpak</span> is a decentralized and versatile software
				distribution format for any context.
			</p>
			<div class="mt-12 flex justify-center gap-4 lg:justify-start">
				<a
					href="/docs/quick-start"
					class="rounded-full bg-[#3E7BFF] px-8 py-3 font-semibold text-white transition hover:brightness-110"
					>Get started</a
				>
				<a
					href="/store"
					class="rounded-full border border-slate-200 bg-white px-8 py-3 text-gray-900 transition hover:bg-slate-100"
					>Browse store</a
				>
			</div>
		</div>
	</section>
</main>

<div class="mx-auto grid max-w-7xl gap-16 px-6 py-24 sm:grid-cols-2 lg:grid-cols-3">
	{#each features as f}
		<div class="space-y-4">
			<h3 class="text-2xl font-semibold text-gray-900">{f.title}</h3>
			<p class="text-gray-600">{f.desc}</p>
			<button
				on:click={() => open(f.id)}
				class="inline-flex cursor-pointer items-center text-[#4670EC] hover:text-[#435280] focus:outline-none"
			>
				Learn More
				<span class="material-symbols-outlined ml-1">arrow_forward</span>
			</button>
		</div>
	{/each}
</div>

<section class="border-b border-slate-300 bg-gray-100">
	<div
		class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 px-6 py-12 sm:flex-row"
	>
		<div class="space-y-2 text-center sm:text-left">
			<h2 class="text-xl font-semibold">cpak runs everywhere</h2>
			<p class="text-black">
				Out-of-the-box support for every Linux distributions.
				<a href="/install" class="text-blue-800 underline">How to install</a>
			</p>
		</div>
		<div class="flex flex-wrap justify-center gap-6 sm:justify-start">
			<img src="/distributions/ubuntu.svg" alt="Ubuntu" class="h-10 w-auto" />
			<img src="/distributions/fedora.svg" alt="Fedora" class="h-10 w-auto" />
			<img src="/distributions/archlinux.svg" alt="Arch Linux" class="h-10 w-auto" />
			<img src="/distributions/vanillaos.svg" alt="Vanilla OS" class="h-10 w-auto" />
			<img src="/distributions/redhat.svg" alt="Red Hat" class="h-10 w-auto" />
			<img src="/distributions/opensuse.svg" alt="openSUSE" class="h-10 w-auto" />
		</div>
	</div>
</section>

{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="relative flex w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
			<aside class="w-1/3 overflow-auto border-r border-gray-200 bg-gray-50">
				<ul>
					{#each features as f}
						<li>
							<button
								on:click={() => (active = f.id)}
								class="w-full cursor-pointer px-4 py-3 text-left text-sm hover:bg-gray-100 {f.id ===
								active
									? 'bg-white font-semibold'
									: ''}"
							>
								{f.title}
							</button>
						</li>
					{/each}
				</ul>
			</aside>
			<div class="relative flex-1 overflow-auto p-6">
				<button on:click={close} class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
					<span class="material-symbols-outlined">close</span>
				</button>
				<h2 class="mb-4 text-2xl font-semibold text-gray-900">{activeFeature.title}</h2>
				<p class="whitespace-pre-line text-gray-700">{activeFeature.details}</p>
			</div>
		</div>
	</div>
{/if}

<Footer />
