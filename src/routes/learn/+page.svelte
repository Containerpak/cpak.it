<script lang="ts">
  // The way in. It answers one question before anything else: what is this.
  //
  // Somebody arriving may never have heard of cpak, so the first thing offered
  // is the course that assumes nothing. Below it, the two audiences who need
  // something different, and last the playgrounds, which are tools rather than
  // a way to start.
  import Seo from "$lib/components/Seo.svelte";
  import { PLAYGROUNDS, type PlaygroundId } from "$lib/learn/playgrounds";

  const ORDER: PlaygroundId[] = [
    "permissions",
    "filesystem",
    "ceiling",
    "migration",
    "desktop-entry",
  ];

  type Audience = {
    heading: string;
    sentence: string;
    action: { href: string; label: string };
    ground: string;
    note?: string;
  };

  const AUDIENCES: Audience[] = [
    {
      heading: "Packaging an application",
      sentence:
        "Write a manifest cpak accepts, ask for the access your program needs, and ship a desktop entry that survives being exported.",
      action: { href: "/learn/play/filesystem", label: "Open the filesystem playground" },
      ground: "bg-[#EEF2FD]",
      note: "The course for this is being written. The playgrounds below are the parts of it that already work.",
    },
    {
      heading: "Running cpak on machines you look after",
      sentence:
        "Set one policy for other people's installations, and be able to say exactly what it closes and what it leaves open.",
      action: { href: "/learn/play/ceiling", label: "Open the ceiling playground" },
      ground: "bg-[#EAF4EF]",
      note: "The course for this is being written. Start with the ceiling and read what survives it.",
    },
  ];
</script>

<Seo
  title="Learn - cpak"
  description="Learn cpak by changing something and reading what it decides. A short course for anyone new to it, and playgrounds that run cpak's own decision code in the page."
  path="/learn"
/>

<section class="border-b border-slate-200 bg-slate-50">
  <div class="mx-auto max-w-6xl px-6 py-16 lg:py-20">
    <div class="max-w-3xl">
      <h1
        class="text-5xl font-extrabold tracking-tight text-gray-900 lg:text-6xl"
      >
        Learn cpak
      </h1>
      <p class="mt-6 text-xl leading-9 text-gray-600">
        cpak installs applications that start with nothing and get only what
        they asked for in writing. Here you change that writing and read what
        cpak decides, in the page.
      </p>
    </div>

    <div
      class="mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
    >
      <p class="text-xs font-bold tracking-wide text-slate-500 uppercase">
        New to cpak
      </p>
      <h2 class="mt-2 text-2xl font-bold text-gray-900">Start here</h2>
      <p class="mt-3 leading-7 text-gray-600">
        Four lessons and five questions, about twenty-five minutes, assuming
        nothing. What cpak is, what you are shown before you install something,
        and what an application is allowed to do afterwards.
      </p>
      <a
        href="/learn/start"
        class="mt-6 inline-flex items-center gap-2 rounded-full bg-[#4670EC] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3158c7] focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Start the course
        <span class="material-symbols-outlined text-lg" aria-hidden="true"
          >arrow_forward</span
        >
      </a>
      <p class="mt-4 text-sm text-slate-500">
        No account needed, and nothing you type is uploaded.
      </p>
    </div>
  </div>
</section>

{#each AUDIENCES as audience (audience.heading)}
  <section class="{audience.ground} border-b border-slate-200">
    <div class="mx-auto max-w-6xl px-6 py-14">
      <div class="max-w-2xl">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900">
          {audience.heading}
        </h2>
        <p class="mt-3 text-lg leading-8 text-gray-700">{audience.sentence}</p>
        <a
          href={audience.action.href}
          class="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {audience.action.label}
          <span class="material-symbols-outlined text-base" aria-hidden="true"
            >arrow_forward</span
          >
        </a>
        {#if audience.note}
          <p class="mt-4 text-sm text-slate-600">{audience.note}</p>
        {/if}
      </div>
    </div>
  </section>
{/each}

<section id="playgrounds" class="mx-auto max-w-6xl px-6 py-16">
  <h2 class="text-3xl font-bold tracking-tight text-gray-900">Playgrounds</h2>
  <p class="mt-3 max-w-2xl text-lg leading-8 text-gray-600">
    Five tools you can open on their own. Each one asks cpak a question and
    shows you the answer, the same way it would answer on your machine.
  </p>

  <ul class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each ORDER as id (id)}
      {@const tool = PLAYGROUNDS[id]}
      <li>
        <a
          href={tool.href}
          class="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
        >
          <span class="text-lg font-semibold text-gray-900">{tool.title}</span>
          <span class="mt-2 flex-1 text-sm leading-6 text-gray-600"
            >{tool.sentence}</span
          >
          <span
            class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#4670EC]"
          >
            Open
            <span class="material-symbols-outlined text-base" aria-hidden="true"
              >arrow_forward</span
            >
          </span>
        </a>
      </li>
    {/each}
  </ul>
</section>
