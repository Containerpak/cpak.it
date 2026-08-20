<script lang="ts">
  import { onMount, untrack } from "svelte";
  import SearchSelect from "$lib/components/SearchSelect.svelte";
  import { CoreError, loadCore, type Core } from "$lib/learn/core";
  import * as m from "$lib/paraglide/messages.js";
  import type { PlaygroundStatus } from "$lib/learn/playgrounds";
  import { CASES } from "$lib/learn/migration";
  import { format, type Migration, type Validation } from "$lib/learn/policy";

  let { onstatus = () => {} }: { onstatus?: (state: PlaygroundStatus) => void } = $props();

  let core = $state<Core | null>(null);
  let phase = $state<"loading" | "ready" | "failed">("loading");
  let failure = $state("");
  let selected = $state(CASES[0].id);
  let manifestText = $state(CASES[0].manifest);
  let migration = $state<Migration | null>(null);
  let validation = $state<Validation | null>(null);
  let refusal = $state("");
  let copied = $state(false);

  onMount(load);

  async function load() {
    phase = "loading";
    failure = "";
    try {
      core = await loadCore();
      phase = "ready";
    } catch (error) {
      failure = error instanceof CoreError ? error.message : String(error);
      phase = "failed";
    }
  }

  function choose(id: string) {
    const entry = CASES.find((item) => item.id === id);
    if (!entry) return;
    selected = id;
    manifestText = entry.manifest;
  }

  function caseLabel(id: string) {
    if (id === "typical") return m.migration_case_typical();
    if (id === "whole-host") return m.migration_case_whole_host();
    if (id === "no-provider") return m.migration_case_no_provider();
    if (id === "already-v2") return m.migration_case_already_v2();
    return m.play_custom();
  }

  function change(value: string) {
    selected = "custom";
    manifestText = value;
  }

  async function copy() {
    if (!migration) return;
    try {
      await navigator.clipboard.writeText(format(migration.manifest));
      copied = true;
      setTimeout(() => (copied = false), 1800);
    } catch {
      copied = false;
    }
  }

  $effect(() => {
    const loaded = core;
    const text = manifestText;
    if (!loaded || phase !== "ready") return;

    const timer = setTimeout(() => {
      const answer = loaded.ask<Migration>("migrateManifest", { manifestText: text });
      const check = loaded.ask<Validation>("validateManifest", { manifestText: text });
      validation = check.ok ? check.result : null;
      if (!answer.ok) {
        migration = null;
        refusal = answer.error;
        return;
      }
      migration = answer.result;
      refusal = "";
    }, 120);
    return () => clearTimeout(timer);
  });

  $effect(() => {
    const state: PlaygroundStatus = {
      phase,
      version: core?.version ?? "",
      error: failure,
      retry: load,
    };
    untrack(() => onstatus(state));
  });
</script>

<section class="overflow-hidden rounded-2xl border border-slate-300 bg-slate-950 shadow-sm">
  <header class="flex flex-wrap items-center gap-3 border-b border-slate-800 px-4 py-3 sm:px-5">
    <div class="min-w-0 flex-1">
      <h2 class="font-semibold text-white">{m.migration_workspace()}</h2>
      <p class="mt-0.5 text-xs text-slate-400">{m.migration_workspace_intro()}</p>
    </div>
    <SearchSelect
      id="migration-case"
      value={selected}
      label={m.migration_starting_manifest()}
      searchLabel={m.migration_search_manifests()}
      options={[
        ...CASES.map((entry) => ({ value: entry.id, label: caseLabel(entry.id) })),
        ...(selected === "custom" ? [{ value: "custom", label: m.play_custom() }] : []),
      ]}
      onchange={choose}
    />
  </header>

  <div class="grid min-h-[34rem] lg:grid-cols-2">
    <div class="min-w-0 border-b border-slate-800 lg:border-r lg:border-b-0">
      <div class="border-b border-slate-800 bg-slate-900 px-4 py-3 font-mono text-xs text-slate-300">{m.migration_before()}</div>
      <label for="migration-editor" class="sr-only">{m.migration_editor_label()}</label>
      <textarea
        id="migration-editor"
        value={manifestText}
        oninput={(event) => change(event.currentTarget.value)}
        rows="24"
        wrap="off"
        spellcheck="false"
        autocapitalize="off"
        class="block h-[32rem] w-full resize-none overflow-auto border-0 bg-slate-950 p-4 font-mono text-[13px] leading-6 text-slate-100 focus:ring-0 focus:outline-none sm:p-5"
      ></textarea>
    </div>

    <aside class="min-w-0 bg-slate-900/70" aria-live="polite">
      <div class="flex items-center gap-3 border-b border-slate-800 px-4 py-3 sm:px-5">
        <div class="min-w-0 flex-1">
          <h3 class="font-mono text-xs text-slate-300">{m.migration_after()}</h3>
          {#if validation}<p class="mt-1 text-[11px] text-slate-500">{m.migration_input_version({ version: validation.manifestVersion })}</p>{/if}
        </div>
        {#if migration}
          <button type="button" onclick={copy} class="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800">
            {copied ? m.play_copied() : m.play_copy()}
          </button>
        {/if}
      </div>

      {#if phase === "loading"}
        <p class="p-5 text-sm text-slate-400">{m.cpak_loading()}</p>
      {:else if phase === "failed"}
        <p class="p-5 font-mono text-xs leading-5 text-red-300">{failure}</p>
      {:else if refusal}
        <div class="p-5">
          <p class="text-sm font-semibold text-amber-300">{m.migration_refuses()}</p>
          <p class="mt-2 font-mono text-xs leading-5 text-slate-300">{refusal}</p>
        </div>
      {:else if migration}
        {#if migration.changes.length}
          <div class="border-b border-slate-800 px-4 py-3 sm:px-5">
            <p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">{m.migration_changes()}</p>
            <ul class="mt-2 flex flex-wrap gap-2">
              {#each migration.changes as change (`${change.field}-${change.became}`)}
                <li class="rounded-md bg-slate-800 px-2 py-1 font-mono text-[11px] text-amber-200">{change.field} -> {change.became}</li>
              {/each}
            </ul>
          </div>
        {:else}
          <p class="border-b border-slate-800 px-5 py-3 text-xs text-emerald-300">{m.migration_already({ version: migration.manifestVersion })}</p>
        {/if}
        <pre class="h-[32rem] overflow-auto p-4 font-mono text-[13px] leading-6 text-slate-100 sm:p-5">{format(migration.manifest)}</pre>
      {/if}
    </aside>
  </div>
</section>
