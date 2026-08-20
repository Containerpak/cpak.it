<script lang="ts">
  import { onMount, untrack } from "svelte";
  import SearchSelect from "$lib/components/SearchSelect.svelte";
  import { CoreError, loadCore, type Core } from "$lib/learn/core";
  import * as m from "$lib/paraglide/messages.js";
  import type { PlaygroundStatus } from "$lib/learn/playgrounds";
  import { HOST, STARTING_POINTS } from "$lib/learn/play/filesystem/fixture";
  import { format, parse } from "$lib/learn/policy";

  type Input = "filesystem" | "host";
  type Entry = { path: string; access: string };
  type Resolved = Entry & { source?: string; target?: string; error?: string };
  type Plan = { valid: boolean; error?: string; entries: Resolved[]; host: unknown };

  let { onstatus = () => {} }: { onstatus?: (state: PlaygroundStatus) => void } = $props();

  let core = $state<Core | null>(null);
  let phase = $state<"loading" | "ready" | "failed">("loading");
  let failure = $state("");
  let active = $state<Input>("filesystem");
  let selected = $state("0");
  let filesystemText = $state(format(STARTING_POINTS[0].entries));
  let hostText = $state(format(HOST));
  let plan = $state<Plan | null>(null);
  let refusal = $state("");

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

  function choose(index: number) {
    selected = String(index);
    filesystemText = format(STARTING_POINTS[index].entries);
  }

  function exampleLabel(index: number) {
    if (index === 0) return m.filesystem_example_editor();
    if (index === 1) return m.filesystem_example_player();
    if (index === 2) return m.filesystem_example_user_dirs();
    if (index === 3) return m.filesystem_example_host();
    return m.filesystem_example_refused();
  }

  function currentText() {
    return active === "filesystem" ? filesystemText : hostText;
  }

  function change(value: string) {
    selected = "custom";
    if (active === "filesystem") filesystemText = value;
    else hostText = value;
  }

  $effect(() => {
    const loaded = core;
    const filesystem = filesystemText;
    const host = hostText;
    if (!loaded || phase !== "ready") return;

    const timer = setTimeout(() => {
      const decodedFilesystem = parse<Entry[]>(filesystem);
      const decodedHost = parse<Record<string, unknown>>(host);
      const error = decodedFilesystem.error || decodedHost.error;
      if (error || !decodedFilesystem.value || !decodedHost.value) {
        plan = null;
        refusal = error || "Both editors must contain JSON.";
        return;
      }
      if (!Array.isArray(decodedFilesystem.value)) {
        plan = null;
        refusal = "filesystem.json must contain an array.";
        return;
      }

      const answer = loaded.ask<Plan>("filesystemPlan", {
        filesystem: decodedFilesystem.value,
        host: decodedHost.value,
      });
      if (!answer.ok) {
        plan = null;
        refusal = answer.error;
        return;
      }
      plan = answer.result;
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
      <h2 class="font-semibold text-white">{m.filesystem_workspace()}</h2>
      <p class="mt-0.5 text-xs text-slate-400">{m.filesystem_workspace_intro()}</p>
    </div>
    <SearchSelect
      id="filesystem-example"
      value={selected}
      label={m.filesystem_starting_example()}
      searchLabel={m.filesystem_search_examples()}
      options={[
        ...STARTING_POINTS.map((point, index) => ({ value: String(index), label: exampleLabel(index) })),
        ...(selected === "custom" ? [{ value: "custom", label: m.play_custom() }] : []),
      ]}
      onchange={(value) => {
        if (value !== "custom") choose(Number(value));
      }}
    />
  </header>

  <div class="grid min-h-[34rem] lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
    <div class="min-w-0 border-b border-slate-800 lg:border-r lg:border-b-0">
      <div class="flex border-b border-slate-800 bg-slate-900">
        <button
          type="button"
          onclick={() => (active = "filesystem")}
          class={`border-b-2 px-4 py-3 font-mono text-xs transition ${active === "filesystem" ? "border-[#7DA2FF] text-white" : "border-transparent text-slate-500 hover:text-slate-200"}`}
        >filesystem.json</button>
        <button
          type="button"
          onclick={() => (active = "host")}
          class={`border-b-2 px-4 py-3 font-mono text-xs transition ${active === "host" ? "border-[#7DA2FF] text-white" : "border-transparent text-slate-500 hover:text-slate-200"}`}
        >host.json</button>
      </div>
      <label for="filesystem-editor" class="sr-only">{active} JSON</label>
      <textarea
        id="filesystem-editor"
        value={currentText()}
        oninput={(event) => change(event.currentTarget.value)}
        rows="24"
        wrap="off"
        spellcheck="false"
        autocapitalize="off"
        class="block min-h-[32rem] w-full resize-y border-0 bg-slate-950 p-4 font-mono text-[13px] leading-6 text-slate-100 focus:ring-0 focus:outline-none sm:p-5"
      ></textarea>
    </div>

    <aside class="min-w-0 bg-slate-900/70" aria-live="polite">
      <div class="border-b border-slate-800 px-4 py-3 sm:px-5">
        <h3 class="text-sm font-semibold text-white">{m.filesystem_mount_plan()}</h3>
        <p class="mt-1 text-xs leading-5 text-slate-400">{m.filesystem_mount_plan_intro()}</p>
      </div>
      <div class="space-y-4 px-4 py-5 sm:px-5">
        {#if phase === "loading"}
          <p class="text-sm text-slate-400">{m.cpak_loading()}</p>
        {:else if phase === "failed"}
          <p class="font-mono text-xs leading-5 text-red-300">{failure}</p>
        {:else if refusal}
          <div>
            <p class="text-sm font-semibold text-amber-300">{m.filesystem_refuses()}</p>
            <p class="mt-2 font-mono text-xs leading-5 text-slate-300">{refusal}</p>
          </div>
        {:else if plan}
          <p class={`text-sm font-semibold ${plan.valid ? "text-emerald-300" : "text-amber-300"}`}>
            {plan.valid ? m.filesystem_valid() : plan.error}
          </p>
          {#if plan.entries.length}
            <ol class="space-y-3">
              {#each plan.entries as entry, index (`${entry.path}-${index}`)}
                <li class="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
                  <div class="flex flex-wrap items-center gap-2">
                    <code class="text-xs text-white">{entry.path}</code>
                    <span class="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">{entry.access}</span>
                  </div>
                  {#if entry.error}
                    <p class="mt-2 text-xs leading-5 text-amber-200">{entry.error}</p>
                  {:else}
                    <dl class="mt-3 grid gap-2 text-xs">
                      <div><dt class="text-slate-500">{m.play_host()}</dt><dd class="mt-0.5 break-all font-mono text-slate-200">{entry.source}</dd></div>
                      <div><dt class="text-slate-500">{m.play_application()}</dt><dd class="mt-0.5 break-all font-mono text-slate-200">{entry.target}</dd></div>
                    </dl>
                  {/if}
                </li>
              {/each}
            </ol>
          {:else}
            <p class="text-sm text-slate-300">{m.filesystem_no_mount()}</p>
          {/if}
        {/if}
      </div>
    </aside>
  </div>
</section>
