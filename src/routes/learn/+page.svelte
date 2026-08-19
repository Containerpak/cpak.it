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
    reference: { href: string; label: string };
    ground: string;
    note: string;
  };

  const AUDIENCES: Audience[] = [
    {
      heading: "Packaging an application",
      sentence:
        "Write a manifest cpak accepts, ask for the access your program needs, and ship a desktop entry that survives being exported.",
      action: {
        href: "/learn/packaging",
        label: "Start the packaging course",
      },
      reference: { href: "/docs/manifest", label: "Read the manifest reference" },
      ground: "audience-blue",
      note: "Three lessons and five questions, with the filesystem and desktop entry playgrounds beside the text.",
    },
    {
      heading: "Running cpak on machines you look after",
      sentence:
        "Set one policy for other people's installations, and be able to say exactly what it closes and what it leaves open.",
      action: {
        href: "/learn/administration",
        label: "Start the administration course",
      },
      reference: {
        href: "/docs/managed-deployment",
        label: "Read the docs on managed deployment",
      },
      ground: "audience-green",
      note: "Two lessons and four questions, with the ceiling playground beside the text.",
    },
  ];
</script>

<Seo
  title="Learn - cpak"
  description="Learn cpak by changing something and reading what it decides. A short course for anyone new to it, and playgrounds that run cpak's own decision code in the page."
  path="/learn"
/>

<section class="border-b border-slate-200 bg-slate-50">
  <div
    class="mx-auto grid max-w-6xl gap-x-12 gap-y-10 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:py-20"
  >
    <div class="min-w-0">
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

      <div
        class="mt-10 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
      >
      <p class="text-xs font-bold tracking-wide text-slate-500 uppercase">
        New to cpak
      </p>
      <h2 class="mt-2 text-2xl font-bold text-gray-900">Start here</h2>
      <p class="mt-3 leading-7 text-gray-600">
        Four lessons and six questions, about twenty-five minutes, assuming
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

    <!-- Not a picture of the idea, the thing itself: what cpak prints before it
         installs anything. Somebody who reads this and nothing else has already
         understood the argument the course spends twenty-five minutes on. -->
    <figure class="min-w-0 lg:sticky lg:top-8">
      <div
        class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-sm"
      >
        <div
          class="flex items-center gap-2 border-b border-slate-800 px-4 py-2.5"
        >
          <span class="h-2.5 w-2.5 rounded-full bg-slate-700" aria-hidden="true"
          ></span>
          <span class="h-2.5 w-2.5 rounded-full bg-slate-700" aria-hidden="true"
          ></span>
          <span class="h-2.5 w-2.5 rounded-full bg-slate-700" aria-hidden="true"
          ></span>
          <span class="ml-2 font-mono text-xs text-slate-500">cpak install</span
          >
        </div>
        <pre
          class="overflow-x-auto p-4 font-mono text-xs leading-6 text-slate-200"><code>$ cpak install github.com/containerpak/vlc

The following cpak(s) will be installed:
  - VLC: Play video, audio and network streams.

The following permissions will be granted:
  - socket-wayland: <span class="text-emerald-400">true</span>
  - socket-pulse-audio: <span class="text-emerald-400">true</span>
  - socket-session-bus: <span class="text-emerald-400">true</span>
  - socket-ssh-agent: <span class="text-slate-500">false</span>
  - device-dri: <span class="text-emerald-400">true</span>
  - device-video: <span class="text-slate-500">false</span>
  - network: <span class="text-emerald-400">true</span>
  <span class="text-slate-500">... twenty-two more, each one true or false</span>

Do you want to continue? [y/N]</code></pre>
      </div>
      <figcaption class="mt-3 text-sm leading-6 text-slate-600">
        This is the whole of what you are asked to agree to. Nothing is granted
        that is not on this list, and the false ones are printed too.
      </figcaption>
    </figure>
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
        <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href={audience.action.href}
            class="audience-action inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {audience.action.label}
            <span class="material-symbols-outlined text-base" aria-hidden="true"
              >arrow_forward</span
            >
          </a>
          <a
            href={audience.reference.href}
            class="audience-reference text-sm font-medium underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
          >
            {audience.reference.label}
          </a>
        </div>
        <p class="mt-4 text-sm text-slate-600">{audience.note}</p>
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

<style>
  .audience-blue {
    background: #eef2fd;
  }
  .audience-green {
    background: #eaf4ef;
  }
  :global(html[data-theme="dark"]) .audience-blue {
    background: #131c33;
  }
  :global(html[data-theme="dark"]) .audience-green {
    background: #10231c;
  }

  /* Both controls sit on a tinted ground, so neither can borrow the page's
     text colour: on the dark grounds above they came out as dark ink on a dark
     field, which is the call to action of the section made invisible. */
  .audience-action {
    border-color: #0f172a;
    color: #0f172a;
  }
  .audience-action:hover {
    background: #0f172a;
    color: #fff;
  }
  .audience-reference {
    color: #334155;
  }
  .audience-reference:hover {
    color: #0f172a;
  }
  :global(html[data-theme="dark"]) .audience-action {
    border-color: #cbd5e1;
    color: #f1f5f9;
  }
  :global(html[data-theme="dark"]) .audience-action:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
  :global(html[data-theme="dark"]) .audience-reference {
    color: #cbd5e1;
  }
  :global(html[data-theme="dark"]) .audience-reference:hover {
    color: #fff;
  }
</style>
