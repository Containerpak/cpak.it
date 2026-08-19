<script lang="ts">
  // The entry asks one thing: who are you here as. Three audiences, three
  // grounds, one way into each. The boards are not the entry. They are tools,
  // and a tool belongs in the room that uses it, so each room carries its own
  // and somebody who already knows cpak reaches one in a single click.
  import Seo from "$lib/components/Seo.svelte";
  import { PLAYGROUNDS, type PlaygroundId } from "$lib/learn/playgrounds";

  type Room = {
    audience: string;
    heading: string;
    sentence: string;
    way: { href: string; label: string };
    tools: PlaygroundId[];
  };

  const ROOMS: Room[] = [
    {
      audience: "You install and run applications",
      heading: "Read what a package may reach before you install it",
      sentence:
        "You install applications, and you would rather check what one can touch than take somebody's word for it.",
      way: { href: "/learn/play/permissions", label: "Open the permission board" },
      tools: ["permissions"],
    },
    {
      audience: "You package applications",
      heading: "Write a manifest cpak accepts and a desktop entry it exports",
      sentence:
        "You write the file access, the permissions and the desktop integration a package ships with.",
      way: { href: "/learn/play/filesystem", label: "Open the filesystem board" },
      tools: ["filesystem", "desktop-entry", "migration"],
    },
    {
      audience: "You deploy cpak on machines you are responsible for",
      heading: "Hold a fleet to one policy, and know what that policy permits",
      sentence:
        "You set a ceiling for other people's installations, and you have to say exactly what it closes and what it leaves open.",
      way: { href: "/learn/play/ceiling", label: "Open the ceiling board" },
      tools: ["ceiling"],
    },
  ];
</script>

<Seo
  title="Learn - cpak"
  description="The cpak learning area, by audience: read what a package may reach, write a manifest cpak accepts, or hold a fleet to one policy. Every answer comes from cpak's own decision code running in the page."
  path="/learn"
/>

<section class="border-b border-slate-200 bg-slate-50">
  <div class="mx-auto max-w-7xl px-6 py-16 lg:py-20">
    <h1 class="text-5xl font-extrabold tracking-tight text-gray-900 lg:text-6xl">
      Learn
    </h1>
    <p class="mt-6 max-w-2xl text-xl leading-9 text-gray-600">
      Documentation says what cpak does. Here you change something and read what
      cpak itself decides, running in the page. Start where you stand.
    </p>
    <p class="mt-4 max-w-2xl leading-7 text-gray-500">
      The tools need no account, keep nothing, and answer the same way for
      everyone who opens them.
    </p>
  </div>
</section>

{#each ROOMS as room, index (room.audience)}
  <section
    class={index === 1
      ? "border-b border-slate-300 bg-gray-100"
      : index === 2
        ? "bg-slate-950"
        : "border-b border-slate-200 bg-white"}
  >
    <div class="mx-auto max-w-7xl px-6 py-16 lg:py-20">
      <div class="flex flex-col gap-10 lg:flex-row lg:items-start">
        <div class="max-w-2xl lg:flex-1">
          <p
            class={`text-sm font-semibold tracking-[0.16em] uppercase ${
              index === 2 ? "text-[#8aa8ff]" : "text-[#3E7BFF]"
            }`}
          >
            {room.audience}
          </p>
          <h2
            class={`mt-3 text-4xl font-extrabold tracking-tight ${
              index === 2 ? "text-white" : "text-gray-900"
            }`}
          >
            {room.heading}
          </h2>
          <p
            class={`mt-4 text-lg leading-8 ${
              index === 2 ? "text-slate-300" : "text-gray-600"
            }`}
          >
            {room.sentence}
          </p>

          {#if index === 0}
            <p class="mt-4 max-w-xl leading-7 text-gray-600">
              This track is for learning and nothing else. Nothing in it is
              examined and it carries no credential.
            </p>
          {/if}

          <a
            href={room.way.href}
            class="mt-8 inline-flex items-center gap-2 rounded-full bg-[#3E7BFF] px-8 py-3 font-semibold text-white transition hover:brightness-110"
          >
            {room.way.label}
            <span class="material-symbols-outlined" aria-hidden="true">
              arrow_forward
            </span>
          </a>
        </div>

        <div class="lg:w-[26rem] lg:shrink-0">
          <h3
            class={`text-sm font-semibold ${
              index === 2 ? "text-slate-300" : "text-gray-900"
            }`}
          >
            {room.tools.length === 1
              ? "The tool in this room"
              : "The tools in this room"}
          </h3>
          <ul
            class={`mt-3 divide-y border-y ${
              index === 2 ? "divide-white/10 border-white/10" : "divide-slate-200 border-slate-200"
            }`}
          >
            {#each room.tools as id (id)}
              <li>
                <a
                  href={PLAYGROUNDS[id].href}
                  class={`group flex gap-3 py-4 ${
                    index === 2 ? "text-slate-300" : "text-gray-600"
                  }`}
                >
                  <span
                    class={`material-symbols-outlined shrink-0 text-[20px] ${
                      index === 2 ? "text-slate-500" : "text-gray-400"
                    }`}
                    aria-hidden="true"
                  >
                    tune
                  </span>
                  <span class="min-w-0">
                    <span
                      class={`flex items-center gap-1 font-semibold ${
                        index === 2
                          ? "text-white"
                          : "text-gray-900 group-hover:text-[#3E7BFF]"
                      }`}
                    >
                      {PLAYGROUNDS[id].title}
                      <span
                        class="material-symbols-outlined text-base"
                        aria-hidden="true">arrow_outward</span
                      >
                    </span>
                    <span class="mt-1 block text-sm leading-6">
                      {PLAYGROUNDS[id].sentence}
                    </span>
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
  </section>
{/each}
