<script lang="ts">
  import type { PlaygroundStatus } from "$lib/learn/playgrounds";
  import { onMount, untrack } from "svelte";
  import JsonPane from "$lib/components/learn/JsonPane.svelte";
  import { loadCore, type Core } from "$lib/learn/core";
  import { CASES, reasonFor } from "$lib/learn/migration";
  import {
    describe,
    format,
    granted,
    parse,
    type Catalog,
    type Migration,
    type Override,
    type Validation,
  } from "$lib/learn/policy";

  /** One field of the old manifest and everything it turned into. */
  type Group = {
    field: string;
    before: string;
    entries: { became: string; reason: string }[];
  };

  type Answer = {
    reading: Validation | null;
    migration: Migration;
    after: Validation | null;
    groups: Group[];
    kept: string[];
    output: string;
  };

  // The board is the same component standalone and inside a lesson, so the
  // frame around it is not its business. It only says how the decision
  // module is doing, and whoever placed it says that in its own words.
  let { onstatus = () => {} }: { onstatus?: (state: PlaygroundStatus) => void } =
    $props();

  let core = $state<Core | null>(null);
  let coreState = $state<"loading" | "ready" | "failed">("loading");
  let coreError = $state("");
  let catalog = $state<Catalog>({ permissions: [], aliases: [] });

  let manifestText = $state(CASES[0].manifest);
  let board = $state<Answer | null>(null);
  let refusal = $state("");
  let copied = $state(false);

  let manifest = $derived(parse<Record<string, unknown>>(manifestText));
  let worked = $derived(CASES.find((entry) => entry.manifest === manifestText));
  let blocked = $derived.by(() => {
    if (manifestText.trim() === "") return "empty";
    if (manifest.error) return "invalid";
    return "";
  });

  /**
   * The whole answer, asked of the module: what it reads, what it writes, what
   * each field became, and whether the manifest it wrote holds up on its own.
   */
  function decide(loaded: Core, text: string): Answer | string {
    const request = { manifestText: text };
    const answer = loaded.ask<Migration>("migrateManifest", request);
    const checked = loaded.ask<Validation>("validateManifest", request);
    if (!answer.ok) return answer.error;

    const migration = answer.result;
    const after = loaded.ask<Validation>("validateManifest", {
      manifest: migration.manifest,
    });
    const source = parse<Record<string, unknown>>(text).value ?? {};
    const before = (source.override ?? {}) as Override;
    const behind = (migration.manifest.override ?? {}) as Override;
    const carried = granted(behind, catalog);

    const groups: Group[] = [];
    for (const change of migration.changes) {
      const entry = {
        became: change.became,
        reason: reasonFor(change.field, change.became),
      };
      const seen = groups.find((group) => group.field === change.field);
      if (seen) {
        seen.entries.push(entry);
        continue;
      }
      groups.push({
        field: change.field,
        before: wrote(change.field, source, before),
        entries: [entry],
      });
    }

    return {
      reading: checked.ok ? checked.result : null,
      migration,
      after: after.ok ? after.result : null,
      groups,
      kept: granted(before, catalog).filter((key) => carried.includes(key)),
      output: format(migration.manifest),
    };
  }

  /** What the old manifest wrote for a field, in the words it wrote it. */
  function wrote(
    field: string,
    source: Record<string, unknown>,
    before: Override,
  ): string {
    if (field === "manifest_version") {
      return String(source.manifest_version ?? "1.0");
    }
    const value = before[field];
    if (value === undefined) return "";
    return JSON.stringify(value);
  }

  $effect(() => {
    const current = core;
    const text = manifestText;
    const stopped = blocked;
    if (!current) return;
    if (stopped) {
      board = null;
      refusal = "";
      return;
    }
    const timer = setTimeout(() => {
      copied = false;
      const answer = decide(current, text);
      if (typeof answer === "string") {
        board = null;
        refusal = answer;
      } else {
        board = answer;
        refusal = "";
      }
    }, 200);
    return () => clearTimeout(timer);
  });

  function start() {
    coreState = "loading";
    coreError = "";
    loadCore()
      .then((loaded) => {
        const answer = loaded.ask<Catalog>("permissionCatalog", {});
        if (answer.ok) catalog = answer.result;
        core = loaded;
        coreState = "ready";
      })
      .catch((error: unknown) => {
        coreState = "failed";
        coreError = error instanceof Error ? error.message : String(error);
      });
  }

  onMount(start);

  async function copy() {
    if (!board) return;
    try {
      await navigator.clipboard.writeText(board.output);
      copied = true;
    } catch {
      copied = false;
    }
  }

  function count(value: number, one: string, many: string) {
    return `${value} ${value === 1 ? one : many}`;
  }

  let tone = $derived(coreState === "failed" || refusal ? "bad" : "plain");

  let verdict = $derived.by(() => {
    if (coreState === "loading")
      return "Loading cpak. Nothing is migrated yet.";
    if (coreState === "failed")
      return "cpak's own code could not be loaded, so nothing is migrated.";
    if (blocked === "empty")
      return "No manifest yet. Pick a case or paste one.";
    if (blocked === "invalid") return "The pane is not JSON yet.";
    if (refusal) return `cpak will not migrate this: ${refusal}`;
    // The module is here but has not read this manifest yet. It is a moment,
    // and a bar that goes blank for it reads as an answer of nothing.
    if (!board) return "Working out what each field becomes.";
    if (board.migration.changes.length === 0) {
      return `Nothing to migrate: this manifest is already version ${board.migration.manifestVersion}.`;
    }
    return `Version ${board.reading?.manifestVersion ?? "1.0"} to ${board.migration.manifestVersion}, with ${count(board.groups.length, "field", "fields")} rewritten and ${count(board.kept.length, "permission", "permissions")} copied through untouched.`;
  });

  let paneState = $derived.by(() => {
    if (manifestText.trim() === "")
      return "Empty. Paste the manifest you have.";
    if (!board) return "Read by cpak as it stands.";
    const legacy = board.reading?.legacyFields ?? [];
    const version = `Version ${board.reading?.manifestVersion ?? "1.0"}.`;
    if (legacy.length === 0)
      return `${version} No version 1 filesystem field in it.`;
    return `${version} Version 1 filesystem fields: ${legacy.join(", ")}.`;
  });

  $effect(() => {
    const state: PlaygroundStatus = {
      phase: coreState,
      version: core?.version ?? "",
      error: coreError,
      retry: start,
    };
    untrack(() => onstatus(state));
  });
</script>

<div class="@container">
  <!-- The answer stays on screen while the manifest below it is edited: on a
       phone the two are never both in view, and an answer nobody can see is
       the defect this bar exists to correct. -->
  <p
    class={`sticky top-0 z-20 -mx-6 flex items-start gap-2 border-y bg-white px-6 py-3 text-sm leading-6 ${
      tone === "bad" ? "border-red-200" : "border-slate-200"
    }`}
    role="status"
    aria-live="polite"
  >
    <span
      class={`material-symbols-outlined text-[18px] leading-6 ${
        tone === "bad" ? "text-red-600" : "text-[#3E7BFF]"
      }`}
      aria-hidden="true"
    >
      {tone === "bad" ? "error" : "sync_alt"}
    </span>
    <span class="text-gray-900">{verdict}</span>
  </p>

  <div class="mt-6 grid items-start gap-6 @3xl:grid-cols-12">
    <section aria-labelledby="input" class="min-w-0 @3xl:col-span-5">
      <h2 id="input" class="sr-only">The manifest you have</h2>

      <div class="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 class="text-sm font-semibold text-gray-900">Start from a case</h3>
        <div class="mt-3 flex flex-wrap gap-2">
          {#each CASES as entry}
            <button
              type="button"
              onclick={() => (manifestText = entry.manifest)}
              aria-pressed={worked?.id === entry.id}
              class={`rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none ${
                worked?.id === entry.id
                  ? "border-[#3E7BFF] bg-[#3E7BFF]/10 text-[#3158c7]"
                  : "border-slate-200 bg-white text-gray-700 hover:bg-slate-100"
              }`}
            >
              {entry.label}
            </button>
          {/each}
        </div>
        <p class="mt-3 text-sm leading-6 text-gray-600">
          {worked
            ? worked.lesson
            : "Your own manifest. It stays in this page: nothing is uploaded."}
        </p>
      </div>

      <div class="mt-4">
        <JsonPane
          id="v1"
          label="The manifest you have"
          note="A version 1 manifest, or a version 2 one to see that there is nothing left to do."
          state={paneState}
          rows={24}
          bind:value={manifestText}
          error={manifest.error ?? ""}
        />
      </div>
    </section>

    <section
      aria-labelledby="answer"
      class="flex min-w-0 flex-col gap-4 @3xl:col-span-7"
    >
      <h2 id="answer" class="sr-only">What cpak writes</h2>

      {#if coreState === "loading"}
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <div class="h-4 w-48 animate-pulse rounded-full bg-slate-100"></div>
          <div class="mt-4 space-y-2">
            {#each Array(6) as _}
              <div
                class="h-3 w-full animate-pulse rounded-full bg-slate-100"
              ></div>
            {/each}
          </div>
          <p class="mt-4 text-sm leading-6 text-gray-500">
            Nothing is migrated until cpak's own code is here and checked.
          </p>
        </div>
      {:else if coreState === "failed"}
        <div class="rounded-2xl border border-red-200 bg-red-100 p-5">
          <p class="text-sm font-semibold text-red-700">
            Nothing can be migrated
          </p>
          <p class="mt-1 text-sm leading-6 text-gray-600">
            No manifest is rewritten from memory here, so nothing is shown. Try
            again from the button at the top of the page.
          </p>
        </div>
      {:else if blocked === "empty"}
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <p class="text-sm leading-6 text-gray-600">
            The pane is empty. Pick one of the cases, or paste a manifest, and
            the version 2 manifest appears here.
          </p>
        </div>
      {:else if blocked === "invalid"}
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <p class="text-sm leading-6 text-gray-600">
            The pane is not JSON yet, so the last answer was dropped rather than
            left standing beside text that no longer says it. The pane says
            where it stops parsing.
          </p>
        </div>
      {:else if refusal}
        <div class="rounded-2xl border border-red-200 bg-red-100 p-5">
          <p class="text-sm font-semibold text-red-700">
            cpak will not migrate this
          </p>
          <p class="mt-1 font-mono text-sm break-words text-red-700">
            {refusal}
          </p>
          <p class="mt-2 text-sm leading-6 text-gray-600">
            A migration that cannot say what a field becomes stops instead of
            guessing. Dropping the field would quietly take away something the
            author asked for, and inventing a permission would quietly add one.
            Three host commands have a typed replacement:
            <span class="font-mono">xdg-open</span>,
            <span class="font-mono">notify-send</span> and
            <span class="font-mono">cpak-launch-app</span>. Anything else has to
            be decided by a person.
          </p>
        </div>
      {:else if board}
        {#if board.migration.changes.length === 0}
          <div class="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 class="text-lg font-semibold text-gray-900">
              Nothing to migrate
            </h3>
            <p class="mt-2 text-sm leading-6 text-gray-600">
              This manifest is already version {board.migration
                .manifestVersion}, so there is no legacy filesystem field to
              rewrite and no host command to replace. The manifest below is the
              same one, written the way the runtime holds it.
            </p>
          </div>
        {:else}
          <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 class="text-lg font-semibold text-gray-900">
              What each field became
            </h3>
            <p class="mt-2 text-sm leading-6 text-gray-600">
              One entry for every field cpak rewrote: what the old manifest
              wrote, what it says now, and why that is the honest reading of it.
            </p>
            <ul class="mt-4 space-y-5">
              {#each board.groups as group}
                <li class="border-l-2 border-[#3E7BFF]/40 pl-4">
                  <p class="font-mono text-sm break-all text-gray-900">
                    {group.field}
                    {#if group.before}
                      <span class="text-gray-500">: {group.before}</span>
                    {/if}
                  </p>
                  <ul class="mt-1 space-y-1">
                    {#each group.entries as entry, index}
                      <li>
                        <p
                          class="flex items-start gap-1.5 font-mono text-sm break-all text-[#3158c7]"
                        >
                          <span
                            class="material-symbols-outlined text-[16px] leading-5"
                            aria-hidden="true">arrow_right_alt</span
                          >
                          <span>{entry.became}</span>
                        </p>
                        <!-- A field rewritten once per path says why once. A
                             field that became two different permissions says
                             why for each of them. -->
                        {#if entry.reason && entry.reason !== group.entries[index - 1]?.reason}
                          <p class="mt-1 text-sm leading-6 text-gray-600">
                            {entry.reason}
                          </p>
                        {/if}
                      </li>
                    {/each}
                  </ul>
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if board.kept.length > 0}
          <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 class="text-lg font-semibold text-gray-900">
              Carried through untouched
            </h3>
            <p class="mt-2 text-sm leading-6 text-gray-600">
              These the old manifest asked for and the new one asks for in the
              same words. A migration that quietly widened one of them would be
              a different application.
            </p>
            <ul class="mt-3 flex flex-wrap gap-2">
              {#each board.kept as key}
                <li
                  class="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-gray-800"
                  title={describe(key, catalog)}
                >
                  {key}
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h3 class="text-lg font-semibold text-gray-900">
              The manifest cpak writes
            </h3>
            <button
              type="button"
              onclick={copy}
              class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p class="mt-2 text-sm leading-6 text-gray-600">
            The module writes the whole override down, the permissions nobody
            asked for included, because a file that says what it does not grant
            is a file somebody can read.
          </p>
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <div
            role="region"
            aria-label="The version 2 manifest"
            tabindex="0"
            class="mt-3 max-h-[28rem] min-w-0 overflow-auto rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
          >
            <pre
              class="w-max min-w-full p-3 font-mono text-xs leading-5 text-gray-800">{board.output}</pre>
          </div>
          {#if board.after}
            <p
              class={`mt-3 flex items-start gap-1.5 text-sm leading-6 ${
                board.after.valid ? "text-gray-600" : "text-red-600"
              }`}
            >
              <span
                class="material-symbols-outlined text-[18px] leading-6"
                aria-hidden="true"
                >{board.after.valid ? "check_circle" : "error"}</span
              >
              <span>
                {#if board.after.valid}
                  cpak was asked to read the manifest it just wrote, and accepts
                  it as it stands.
                {:else}
                  cpak was asked to read the manifest it just wrote, and refuses
                  it: {board.after.error}
                {/if}
              </span>
            </p>
          {/if}
        </div>
      {/if}
    </section>
  </div>

  <section class="mt-10 border-t border-slate-200 pt-8">
    <p class="max-w-3xl text-sm leading-6 text-gray-600">
      A migrated manifest still only asks. What an application runs with is
      decided on the host it runs on:
      <a
        href="/learn/play/ceiling"
        class="font-medium text-[#4670EC] hover:underline">the ceiling board</a
      >
      puts an owner override and an administrator ceiling around one, and
      <a
        href="/learn/play/filesystem"
        class="font-medium text-[#4670EC] hover:underline"
        >the filesystem board</a
      >
      resolves the grants this one produces against a real home directory.
    </p>
  </section>
</div>
