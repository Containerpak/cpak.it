<script lang="ts">
  import { groupedArticles } from "$lib/docs";

  const paths = [
    {
      icon: "play_circle",
      title: "Use Cpak",
      description:
        "Install the runtime, check your host, and run an application.",
      href: "/docs/quick-start",
      label: "Run your first package",
    },
    {
      icon: "inventory_2",
      title: "Package an application",
      description:
        "Turn an OCI image and a small manifest into a distributable application.",
      href: "/docs/first-package",
      label: "Build a package",
    },
    {
      icon: "code",
      title: "Work on Cpak",
      description:
        "Understand the repository map, development flow, and project conventions.",
      href: "/docs/contributing",
      label: "Start contributing",
    },
  ];
</script>

<svelte:head>
  <title>Documentation - cpak</title>
  <meta
    name="description"
    content="Complete documentation for using, packaging, operating, and contributing to cpak."
  />
</svelte:head>

<section class="border-b border-slate-200 bg-white">
  <div class="mx-auto max-w-7xl px-6 py-20">
    <p class="text-sm font-semibold tracking-wide text-[#4670EC] uppercase">
      Cpak documentation
    </p>
    <h1
      class="mt-4 max-w-4xl text-5xl font-extrabold tracking-tight text-gray-950 sm:text-6xl"
    >
      Everything you need to build and ship with Cpak.
    </h1>
    <p class="mt-6 max-w-3xl text-xl leading-8 text-gray-600">
      Choose the path that matches what you are doing. Each guide uses the
      current v2 runtime, manifest, and command line interface.
    </p>

    <div class="mt-12 grid gap-5 lg:grid-cols-3">
      {#each paths as path}
        <a
          href={path.href}
          class="group rounded-3xl border border-slate-200 bg-slate-50 p-7 transition hover:border-[#4670EC]/40 hover:bg-white hover:shadow-lg"
        >
          <span
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4670EC]/10 text-[#4670EC]"
          >
            <span class="material-symbols-outlined text-[22px]"
              >{path.icon}</span
            >
          </span>
          <h2 class="mt-6 text-2xl font-bold text-gray-950">{path.title}</h2>
          <p class="mt-3 leading-7 text-gray-600">{path.description}</p>
          <span
            class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#4670EC]"
          >
            {path.label}
            <span
              class="material-symbols-outlined text-lg transition group-hover:translate-x-1"
              >arrow_forward</span
            >
          </span>
        </a>
      {/each}
    </div>
  </div>
</section>

<div class="mx-auto max-w-7xl space-y-16 px-6 py-20">
  {#each groupedArticles as group}
    {#if group.articles.length}
      <section id={group.id} class="scroll-mt-24">
        <div class="max-w-3xl">
          <h2 class="text-3xl font-bold tracking-tight text-gray-950">
            {group.title}
          </h2>
          <p class="mt-2 text-lg leading-7 text-gray-600">
            {group.description}
          </p>
        </div>
        <div
          class="mt-7 grid overflow-hidden rounded-3xl border border-slate-200 bg-white md:grid-cols-2"
        >
          {#each group.articles as article}
            <a
              href={`/docs/${article.slug}`}
              class="group border-b border-slate-200 p-6 transition last:border-b-0 hover:bg-slate-50 md:border-r md:[&:nth-last-child(-n+2)]:border-b-0 md:[&:nth-child(2n)]:border-r-0"
            >
              <div class="flex items-start justify-between gap-5">
                <div>
                  <h3
                    class="text-lg font-semibold text-gray-950 group-hover:text-[#4670EC]"
                  >
                    {article.title}
                  </h3>
                  <p class="mt-2 text-sm leading-6 text-gray-600">
                    {article.description}
                  </p>
                </div>
                <span
                  class="material-symbols-outlined mt-1 text-xl text-slate-400"
                  >arrow_forward</span
                >
              </div>
            </a>
          {/each}
        </div>
      </section>
    {/if}
  {/each}

  <section class="rounded-3xl bg-slate-950 px-7 py-10 text-white sm:px-10">
    <div
      class="flex flex-col justify-between gap-8 lg:flex-row lg:items-center"
    >
      <div>
        <h2 class="text-3xl font-bold">Cannot find what you need?</h2>
        <p class="mt-3 max-w-2xl leading-7 text-slate-300">
          The documentation is maintained beside the project. Open the
          repository, inspect the code, or propose a focused correction.
        </p>
      </div>
      <a
        href="https://github.com/Containerpak/cpak"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-950 hover:bg-slate-100"
      >
        Open Cpak on GitHub
        <span class="material-symbols-outlined text-lg">open_in_new</span>
      </a>
    </div>
  </section>
</div>
