<svelte:head>
	<title>Install cpak</title>
	<meta name="description" content="Install cpak and prepare a Linux host." />
</svelte:head>

<div class="mx-auto max-w-4xl px-6 py-16">
	<a href="/docs" class="text-sm font-medium text-[#4670EC] hover:underline">Documentation</a>
	<h1 class="mt-5 text-4xl font-extrabold text-gray-900">Install cpak</h1>
	<p class="mt-4 max-w-2xl text-lg text-gray-600">cpak is distributed as a single command line application. Install the binary for your architecture, place it on your PATH, and check the host capabilities before installing a package.</p>
	<div class="mt-8 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
		<h2 class="text-2xl font-semibold text-gray-900">Verify the installation</h2>
		<pre class="mt-5 overflow-x-auto rounded-xl bg-slate-950 p-5 font-mono text-sm text-slate-100 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-slate-100"><code>cpak --help
cpak service</code></pre>
		<p class="mt-5 leading-7 text-gray-600">Running applications uses user namespaces and OverlayFS. cpak keeps shared OCI layers in a content-addressed store and creates writable container state separately for each application.</p>
	</div>
	<div class="mt-8 flex flex-wrap gap-4">
		<a href="/docs/quick-start" class="rounded-full bg-[#3E7BFF] px-7 py-3 font-semibold text-white hover:brightness-110">Get started</a>
		<a href="https://github.com/Containerpak/cpak/releases" class="rounded-full border border-slate-200 bg-white px-7 py-3 text-gray-900 hover:bg-slate-100">Download releases</a>
	</div>
</div>
