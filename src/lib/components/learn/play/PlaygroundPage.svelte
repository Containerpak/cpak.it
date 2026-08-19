<script lang="ts">
  // The frame a playground shares. A playground is a tool rather than a page
  // about a tool, so it gets its own ground, says what it is in one sentence,
  // and the playground starts directly under that.
  //
  // The state of the decision module lives here because every board needs it
  // and none of them can answer anything without it.
  import type { Snippet } from "svelte";
  import { CORE_MODULE } from "$lib/learn/core";

  let {
    title,
    sentence,
    reference,
    phase,
    version = "",
    error = "",
    onretry = () => {},
    children,
  }: {
    title: string;
    sentence: string;
    reference: { href: string; label: string };
    phase: "loading" | "ready" | "failed";
    version?: string;
    error?: string;
    onretry?: () => void;
    children: Snippet;
  } = $props();

  const megabytes = (CORE_MODULE.bytes / 1024 / 1024).toFixed(1);
  const digest = `${CORE_MODULE.digest.slice(0, 12)}…`;
</script>

<div class="bg-slate-950">
  <div class="mx-auto max-w-7xl px-6 py-8 sm:py-10">
    <nav aria-label="Breadcrumb">
      <ol
        class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400"
      >
        <li>
          <a
            href="/learn"
            class="rounded-sm text-slate-300 hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-[#8aa8ff] focus-visible:outline-none"
            >Learn</a
          >
        </li>
        <li aria-hidden="true">/</li>
        <li>Playground</li>
      </ol>
    </nav>

    <div class="mt-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div class="min-w-0">
        <h1
          class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
        >
          {title}
        </h1>
        <p class="mt-3 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          {sentence}
        </p>
      </div>
      <a
        href={reference.href}
        class="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#8aa8ff] focus-visible:outline-none"
      >
        {reference.label}
      </a>
    </div>

    <div
      class="mt-6 border-t border-white/10 pt-4 text-sm"
      role="status"
      aria-live="polite"
    >
      {#if phase === "loading"}
        <p class="flex items-center gap-2 text-slate-300">
          <span
            class="material-symbols-outlined animate-spin text-[18px] text-slate-400"
            aria-hidden="true">progress_activity</span
          >
          <span>
            Loading cpak's decision module, {megabytes} MB. The page checks it against
            the digest it was built with before running it.
          </span>
        </p>
      {:else if phase === "ready"}
        <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-300">
          <span
            class="material-symbols-outlined text-[18px] text-[#8aa8ff]"
            aria-hidden="true">verified</span
          >
          <span class="font-medium text-white">Answered by cpak {version}</span>
          <span>
            running in this tab, from the build
            <code class="font-mono text-xs text-slate-200">{digest}</code>.
            Nothing you type is sent anywhere.
          </span>
        </p>
      {:else}
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p class="flex items-start gap-2 text-[#fda4af]">
            <span
              class="material-symbols-outlined text-[18px]"
              aria-hidden="true">error</span
            >
            <span>{error || "The decision module could not be loaded."}</span>
          </p>
          <button
            type="button"
            onclick={onretry}
            class="rounded-full border border-white/20 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#8aa8ff] focus-visible:outline-none"
          >
            Try again
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<div class="mx-auto max-w-7xl px-6 py-8 sm:py-10">
  {@render children()}
</div>
