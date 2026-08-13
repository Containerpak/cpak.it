<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";

  const features = [
    {
      id: "footprint",
      title: "Ultra-light footprint",
      desc: "Two static binaries provide the runtime and one shared content store for every application.",
      details: `cpak pulls OCI content directly and starts cpak-storaged only while an application filesystem is mounted. Equal OCI layers are reused by digest, while FVS stores equal content blocks once across different layers and packages. Applications keep explicit dependencies without carrying a second copy of the same runtime files.`,
    },
    {
      id: "docker",
      title: "Docker-style compatibility",
      desc: "Familiar Dockerfile syntax, layer caching and incremental builds without a container daemon in production.",
      details: `Use the same Dockerfile instructions you already know; cpak reuses build layers for fast incremental builds and cacheable steps. Integrate it into existing CI/CD pipelines without installing or managing a background daemon in live environments. This approach speeds up build times, reduces infrastructure complexity, and ensures reproducible artifacts across development, staging, and production.`,
    },
    {
      id: "nvidia",
      title: "Host GPU integration",
      desc: "Bind host graphics drivers at launch instead of packaging a second driver stack in every image.",
      details: `cpak maps DRI devices and discovers host NVIDIA userspace libraries when the package grants GPU access. Images stay independent from the host driver version, while the application receives the matching host stack at launch. NVIDIA support remains experimental until it has broader hardware coverage.`,
    },
    {
      id: "secure",
      title: "Secure system resource access",
      desc: "Declare access to DBus, sockets and devices. Grant only the resources an application needs.",
      details: `Define exactly which system resources (DBus, UNIX sockets, GPIO, camera devices, audio, network interfaces, etc.) your application can access via simple override flags. No modifications to the app's source code are required, enforcing the principle of least privilege and reducing your attack surface. This model is ideal for secure production environments, CI isolation, and multi-tenant edge deployments.`,
    },
    {
      id: "git",
      title: "Git-native versioning",
      desc: "Install any tag, branch or exact commit SHA, then pin the source that should receive updates.",
      details: `Specify package versions directly using Git refs: tags, branches, or commit SHAs. This enables you to pin to an exact commit for reproducible deployments or follow a development branch for continuous integration. Combine conventional semver tags with Git references to implement strategies like canary releases, hotfix branches, and automatic rollbacks with full auditability.`,
    },
    {
      id: "build",
      title: "One package model",
      desc: "Use the same manifest and command across systems, with an OCI image built for each architecture.",
      details: `A package keeps one manifest and one Git origin while its OCI registry can publish the architecture-specific images it supports. The same \`cpak run\` command works on each supported target, and cpak selects the matching image without pretending an amd64 binary can run unchanged on ARM.`,
    },
  ];

  const featuredApps = [
    {
      name: "Bottles",
      description: "Run Windows applications on Linux with Wine and Proton.",
      icon: "/store-icons/bottles.svg",
      href: "/store/Utilities/github.com/bottlesdevs/bottles",
    },
    {
      name: "Firefox",
      description: "A private, fast web browser.",
      icon: "/store-icons/firefox.svg",
      href: "/store/Web/github.com/containerpak/firefox",
    },
    {
      name: "Visual Studio Code",
      description: "A code editor ready for your next project.",
      icon: "/store-icons/vscode.svg",
      href: "/store/Development/github.com/containerpak/vscode",
    },
    {
      name: "GIMP",
      description: "Create and edit images.",
      icon: "/store-icons/gimp.svg",
      href: "/store/Graphics/github.com/containerpak/gimp",
    },
    {
      name: "OBS Studio",
      description: "Record, stream and share video.",
      icon: "/store-icons/obs-studio.svg",
      href: "/store/Multimedia/github.com/containerpak/obs-studio",
    },
    {
      name: "UMU",
      description: "Run Windows games with Proton outside Steam.",
      icon: "/store-icons/umu.svg",
      href: "/store/Games/github.com/containerpak/umu",
    },
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
  <section
    class="mx-auto flex max-w-7xl flex-col items-center gap-20 px-6 pt-28 pb-36 lg:flex-row"
  >
    <img
      src="/cpak-isometric-cubes.svg"
      alt="Isometric cubes"
      class="w-96 lg:w-[28rem]"
    />
    <div class="text-center lg:text-left">
      <h1
        class="text-6xl leading-tight font-extrabold tracking-tight text-gray-900 lg:text-7xl"
      >
        Deploy as <span class="text-[#3E7BFF]">freely</span><br />as you develop
      </h1>
      <p class="mx-auto mt-8 max-w-md text-xl text-gray-600 lg:mx-0">
        <span class="font-semibold text-gray-900">cpak</span> is a decentralized
        and versatile software distribution format for any context.
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

<section class="border-y border-slate-200 bg-white">
  <div class="mx-auto max-w-7xl px-6 py-24">
    <div class="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
      <div class="max-w-xl">
        <p
          class="text-sm font-semibold tracking-[0.16em] text-[#3E7BFF] uppercase"
        >
          The Store
        </p>
        <h2 class="mt-3 text-4xl font-extrabold tracking-tight text-gray-900">
          Familiar apps, ready for cpak
        </h2>
        <p class="mt-4 text-lg text-gray-600">
          Every package has a clear manifest, a real origin and a command you
          can inspect before installing it.
        </p>
      </div>
      <a
        href="/store"
        class="inline-flex items-center gap-1 font-semibold text-[#3E7BFF] hover:text-[#3158c7]"
      >
        Browse every package
        <span class="material-symbols-outlined">arrow_forward</span>
      </a>
    </div>

    <div
      class="mt-14 grid divide-y divide-slate-200 border-y border-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3"
    >
      {#each featuredApps as app}
        <a
          href={app.href}
          class="group flex gap-4 px-0 py-7 sm:px-7 sm:first:pl-0 lg:first:pl-0 lg:odd:px-7"
        >
          <img
            src={app.icon}
            alt=""
            class="h-12 w-12 shrink-0 rounded-xl object-contain"
          />
          <span>
            <span
              class="flex items-center gap-1 font-semibold text-gray-900 group-hover:text-[#3E7BFF]"
            >
              {app.name}
              <span class="material-symbols-outlined text-base"
                >arrow_outward</span
              >
            </span>
            <span class="mt-1 block text-sm leading-6 text-gray-600"
              >{app.description}</span
            >
          </span>
        </a>
      {/each}
    </div>
  </div>
</section>

<div
  class="mx-auto grid max-w-7xl gap-16 px-6 py-24 sm:grid-cols-2 lg:grid-cols-3"
>
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
      <img
        src="/distributions/archlinux.svg"
        alt="Arch Linux"
        class="h-10 w-auto"
      />
      <img
        src="/distributions/vanillaos.svg"
        alt="Vanilla OS"
        class="h-10 w-auto"
      />
      <img src="/distributions/redhat.svg" alt="Red Hat" class="h-10 w-auto" />
      <img
        src="/distributions/opensuse.svg"
        alt="openSUSE"
        class="h-10 w-auto"
      />
    </div>
  </div>
</section>

{#if showModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div
      class="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl sm:flex-row"
    >
      <aside
        class="w-full overflow-auto border-b border-gray-200 bg-gray-50 sm:w-1/3 sm:border-r sm:border-b-0"
      >
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
        <button
          on:click={close}
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
        <h2 class="mb-4 text-2xl font-semibold text-gray-900">
          {activeFeature.title}
        </h2>
        <p class="whitespace-pre-line text-gray-700">{activeFeature.details}</p>
      </div>
    </div>
  </div>
{/if}

<Footer />
