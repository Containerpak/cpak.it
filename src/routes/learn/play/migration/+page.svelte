<script lang="ts">
  import { onMount } from "svelte";
  import Seo from "$lib/components/Seo.svelte";
  import CoreStatus from "$lib/components/learn/CoreStatus.svelte";
  import JsonPane from "$lib/components/learn/JsonPane.svelte";
  import { loadCore, type Core } from "$lib/learn/core";
  import { CASES, WHY } from "$lib/learn/migration";
  import {
    format,
    parse,
    type Migration,
    type Validation,
  } from "$lib/learn/policy";

  let core = $state<Core | null>(null);
  let coreState = $state<"loading" | "ready" | "failed">("loading");
  let coreError = $state("");

  let manifestText = $state(CASES[0].manifest);
  let reading = $state<Validation | null>(null);
  let migration = $state<Migration | null>(null);
  let refusal = $state("");
  let copied = $state(false);

  let manifest = $derived(parse<Record<string, unknown>>(manifestText));
  let worked = $derived(
    CASES.find((entry) => entry.manifest === manifestText),
  );
  let blocked = $derived.by(() => {
    if (manifestText.trim() === "") return "empty";
    if (manifest.error) return "invalid";
    return "";
  });

  $effect(() => {
    const current = core;
    const request = { manifestText };
    const stopped = blocked;
    if (!current) return;
    if (stopped) {
      reading = null;
      migration = null;
      refusal = "";
      return;
    }
    const timer = setTimeout(() => {
      copied = false;
      const checked = current.ask<Validation>("validateManifest", request);
      reading = checked.ok ? checked.result : null;
      const answer = current.ask<Migration>("migrateManifest", request);
      if (answer.ok) {
        migration = answer.result;
        refusal = "";
      } else {
        migration = null;
        refusal = answer.error;
      }
    }, 200);
    return () => clearTimeout(timer);
  });

  function start() {
    coreState = "loading";
    coreError = "";
    loadCore()
      .then((loaded) => {
        core = loaded;
        coreState = "ready";
      })
      .catch((error: unknown) => {
        coreState = "failed";
        coreError = error instanceof Error ? error.message : String(error);
      });
  }

  onMount(start);

  let output = $derived(migration ? format(migration.manifest) : "");

  // A field can be rewritten more than once, one line for each path it named.
  // The reason is the same every time, so it is given with the first of them.
  function firstOf(field: string) {
    return (migration?.changes ?? []).findIndex(
      (change) => change.field === field,
    );
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      copied = true;
    } catch {
      copied = false;
    }
  }

  let summary = $derived.by(() => {
    if (coreState === "loading") return "The decision module is loading.";
    if (coreState === "failed") return "The decision module could not load.";
    if (blocked === "empty") return "No manifest yet.";
    if (blocked === "invalid") return "The manifest pane is not JSON.";
    if (refusal) return `The module refused this manifest: ${refusal}`;
    if (!migration) return "";
    if (migration.changes.length === 0) {
      return "Nothing to migrate: this manifest is already version 2.";
    }
    return `Version ${migration.manifestVersion}, with ${migration.changes.length} field${migration.changes.length === 1 ? "" : "s"} rewritten.`;
  });
</script>

<Seo
  title="The migration board - cpak"
  description="Put a version 1 cpak manifest in and read the version 2 manifest cpak writes, with every field it rewrote and what it now means."
  path="/learn/play/migration"
/>

<div class="mx-auto max-w-7xl px-6 py-12 sm:py-16">
  <a
    href="/docs/manifest"
    class="text-sm font-medium text-[#4670EC] hover:underline"
  >
    Manifest
  </a>
  <h1 class="mt-5 text-4xl font-extrabold tracking-tight text-gray-900">
    The migration board
  </h1>
  <p class="mt-4 max-w-3xl text-lg leading-8 text-gray-600">
    A version 1 manifest reached the host filesystem through flags, and reached
    host programs by naming the commands it was allowed to run. Version 2 has
    neither. Put the old manifest in and cpak writes the new one, saying what
    each field became. Nothing is guessed: the same code does this when you run
    the migration yourself.
  </p>

  <div class="mt-8">
    <CoreStatus
      state={coreState}
      version={core?.version ?? ""}
      error={coreError}
      onretry={start}
    />
  </div>

  <section aria-labelledby="cases" class="mt-10">
    <h2 id="cases" class="text-sm font-semibold text-gray-900">
      Start from a case
    </h2>
    <div class="mt-3 flex flex-wrap gap-2">
      {#each CASES as entry}
        <button
          type="button"
          onclick={() => (manifestText = entry.manifest)}
          aria-pressed={worked?.id === entry.id}
          class={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            worked?.id === entry.id
              ? "border-[#3E7BFF] bg-[#3E7BFF]/10 text-[#3158c7]"
              : "border-slate-200 bg-white text-gray-700 hover:bg-slate-100"
          }`}
        >
          {entry.label}
        </button>
      {/each}
    </div>
    <p class="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
      {worked
        ? worked.lesson
        : "Your own manifest. It stays in this page: nothing is uploaded."}
    </p>
  </section>

  <div class="mt-6 grid gap-4 lg:grid-cols-2">
    <JsonPane
      id="v1"
      label="The manifest you have"
      note="A version 1 manifest, or a version 2 one to see that there is nothing left to do."
      rows={26}
      bind:value={manifestText}
      error={manifest.error ?? ""}
    />

    <div class="flex min-w-0 flex-col gap-4">
      <p class="sr-only" aria-live="polite">{summary}</p>

      {#if coreState === "loading"}
        <div
          class="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div class="h-4 w-44 rounded bg-slate-100"></div>
          <div class="mt-4 h-3 w-full rounded bg-slate-100"></div>
          <div class="mt-2 h-3 w-2/3 rounded bg-slate-100"></div>
        </div>
      {:else if coreState === "failed"}
        <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
          <p class="text-sm leading-6 text-gray-600">
            Nothing can be migrated until the module loads.
          </p>
        </div>
      {:else if blocked === "empty"}
        <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
          <p class="max-w-2xl text-sm leading-6 text-gray-600">
            The pane is empty. Paste a manifest, or pick one of the cases above,
            and the version 2 manifest appears here.
          </p>
        </div>
      {:else if blocked === "invalid"}
        <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
          <p class="max-w-2xl text-sm leading-6 text-gray-600">
            The pane is not JSON yet. The answer is held back until it is.
          </p>
        </div>
      {:else}
        {#if reading}
          <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 class="text-lg font-semibold text-gray-900">
              What cpak reads
            </h2>
            <p class="mt-2 text-sm leading-6 text-gray-600">
              Manifest version <span class="font-mono"
                >{reading.manifestVersion}</span
              >.
              {#if reading.valid}
                It is a manifest cpak accepts as it stands.
              {:else}
                It is refused as it stands: {reading.error}
              {/if}
            </p>
            {#if reading.legacyFields.length > 0}
              <p class="mt-3 text-sm leading-6 text-gray-600">
                Version 1 filesystem fields it still carries:
              </p>
              <ul class="mt-2 flex flex-wrap gap-2">
                {#each reading.legacyFields as field}
                  <li
                    class="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 font-mono text-xs text-gray-700"
                  >
                    {field}
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        {/if}

        {#if refusal}
          <div class="rounded-2xl border border-red-200 bg-red-100 p-5">
            <p class="text-sm font-semibold text-red-700">
              cpak will not migrate this
            </p>
            <p class="mt-1 font-mono text-sm break-words text-red-700">
              {refusal}
            </p>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              A migration that cannot say what a field becomes stops instead of
              guessing. Dropping it would quietly take away something the author
              asked for, and inventing a permission would quietly add one.
            </p>
          </div>
        {:else if migration}
          <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 class="text-lg font-semibold text-gray-900">What changed</h2>
            {#if migration.changes.length === 0}
              <p class="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Nothing. This manifest is already version {migration.manifestVersion},
                so there is no legacy field to rewrite and no host command to
                replace.
              </p>
            {:else}
              <p class="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Each line is one field cpak rewrote, what it became, and why
                that is the honest reading of it.
              </p>
              <ul class="mt-4 space-y-4">
                {#each migration.changes as change, index}
                  <li class="border-l-2 border-[#3E7BFF]/40 pl-4">
                    <p class="font-mono text-sm text-gray-900">
                      {change.field}
                    </p>
                    <p class="mt-1 font-mono text-sm text-[#3158c7]">
                      {change.became}
                    </p>
                    {#if WHY[change.field] && firstOf(change.field) === index}
                      <p class="mt-1 text-sm leading-6 text-gray-600">
                        {WHY[change.field]}
                      </p>
                    {/if}
                  </li>
                {/each}
              </ul>
            {/if}
          </div>

          <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-lg font-semibold text-gray-900">
                The manifest cpak writes
              </h2>
              <button
                type="button"
                onclick={copy}
                class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-slate-100"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Every permission the old manifest asked for is still asked for
              here, written the way version 2 writes it.
            </p>
            <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
            <div
              role="region"
              aria-label="The version 2 manifest"
              tabindex="0"
              class="mt-3 max-h-[32rem] min-w-0 overflow-auto rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
            >
              <pre
                class="w-max min-w-full p-3 font-mono text-xs leading-5 text-gray-800">{output}</pre>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </div>

  <section class="mt-12 border-t border-slate-200 pt-8">
    <p class="max-w-3xl text-sm leading-6 text-gray-600">
      A migrated manifest still only asks. What an application actually runs
      with is decided on the host it runs on:
      <a
        href="/learn/play/ceiling"
        class="font-medium text-[#4670EC] hover:underline"
        >the ceiling board</a
      >
      puts an owner override and an administrator ceiling around one. The fields
      themselves are documented in
      <a
        href="/docs/manifest"
        class="font-medium text-[#4670EC] hover:underline">the manifest reference</a
      >.
    </p>
  </section>
</div>
