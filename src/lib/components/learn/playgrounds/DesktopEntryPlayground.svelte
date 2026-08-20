<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { CoreError, loadCore, type Core } from "$lib/learn/core";
  import type { PlaygroundStatus } from "$lib/learn/playgrounds";
  import { EXAMPLES, EXPORT_DEFAULTS } from "$lib/learn/play/desktop-entry/examples";
  import { format, parse } from "$lib/learn/policy";

  type Input = "desktop" | "export";
  type Output = "exported" | "alias";
  type ExportRequest = {
    name: string;
    origin: string;
    cpakId: string;
    launcher: string;
    icon: string;
  };
  type ExportResult = {
    exportId: string;
    exported: string;
    exportedFileName: string;
    alias: string;
    aliasFileName: string;
  };

  let { onstatus = () => {} }: { onstatus?: (state: PlaygroundStatus) => void } = $props();

  const first = EXAMPLES[0];
  const defaults: ExportRequest = {
    name: first.fileName,
    origin: EXPORT_DEFAULTS.origin,
    cpakId: EXPORT_DEFAULTS.cpakId,
    launcher: EXPORT_DEFAULTS.launcher,
    icon: EXPORT_DEFAULTS.icon,
  };

  let core = $state<Core | null>(null);
  let phase = $state<"loading" | "ready" | "failed">("loading");
  let failure = $state("");
  let active = $state<Input>("desktop");
  let output = $state<Output>("exported");
  let selected = $state(first.id);
  let entryText = $state(first.entry);
  let requestText = $state(format(defaults));
  let result = $state<ExportResult | null>(null);
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
    const example = EXAMPLES.find((entry) => entry.id === id);
    if (!example) return;
    selected = id;
    entryText = example.entry;
    const current = parse<ExportRequest>(requestText).value ?? defaults;
    requestText = format({ ...current, name: example.fileName });
  }

  function currentText() {
    return active === "desktop" ? entryText : requestText;
  }

  function change(value: string) {
    selected = "custom";
    if (active === "desktop") entryText = value;
    else requestText = value;
  }

  function rendered() {
    if (!result) return "";
    return output === "exported" ? result.exported : result.alias;
  }

  function renderedName() {
    if (!result) return "";
    return output === "exported" ? result.exportedFileName : result.aliasFileName;
  }

  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(rendered());
      copied = true;
      setTimeout(() => (copied = false), 1800);
    } catch {
      copied = false;
    }
  }

  $effect(() => {
    const loaded = core;
    const entry = entryText;
    const request = requestText;
    if (!loaded || phase !== "ready") return;

    const timer = setTimeout(() => {
      const decoded = parse<ExportRequest>(request);
      if (decoded.error || !decoded.value) {
        result = null;
        refusal = decoded.error || "export.json must contain one object.";
        return;
      }
      const answer = loaded.ask<ExportResult>("desktopEntry", {
        entry,
        ...decoded.value,
      });
      if (!answer.ok) {
        result = null;
        refusal = answer.error;
        return;
      }
      result = answer.result;
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
      <h2 class="font-semibold text-white">Desktop entry workspace</h2>
      <p class="mt-0.5 text-xs text-slate-400">Edit the file shipped by the image and the export request cpak receives.</p>
    </div>
    <label for="desktop-example" class="sr-only">Starting desktop entry</label>
    <select
      id="desktop-example"
      value={selected}
      onchange={(event) => choose(event.currentTarget.value)}
      class="rounded-lg border-slate-700 bg-slate-900 py-1.5 pr-8 pl-3 text-xs text-slate-200 focus:border-[#7DA2FF] focus:ring-[#7DA2FF]"
    >
      {#each EXAMPLES as example (example.id)}<option value={example.id}>{example.name}</option>{/each}
      {#if selected === "custom"}<option value="custom">Custom</option>{/if}
    </select>
  </header>

  <div class="grid min-h-[34rem] lg:grid-cols-2">
    <div class="min-w-0 border-b border-slate-800 lg:border-r lg:border-b-0">
      <div class="flex border-b border-slate-800 bg-slate-900">
        <button
          type="button"
          onclick={() => (active = "desktop")}
          class={`border-b-2 px-4 py-3 font-mono text-xs transition ${active === "desktop" ? "border-[#7DA2FF] text-white" : "border-transparent text-slate-500 hover:text-slate-200"}`}
        >application.desktop</button>
        <button
          type="button"
          onclick={() => (active = "export")}
          class={`border-b-2 px-4 py-3 font-mono text-xs transition ${active === "export" ? "border-[#7DA2FF] text-white" : "border-transparent text-slate-500 hover:text-slate-200"}`}
        >export.json</button>
      </div>
      <label for="desktop-editor" class="sr-only">{active} editor</label>
      <textarea
        id="desktop-editor"
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
      <div class="flex items-center gap-3 border-b border-slate-800 px-4 py-3 sm:px-5">
        <div class="flex min-w-0 flex-1 gap-1">
          <button
            type="button"
            onclick={() => (output = "exported")}
            class={`rounded-lg px-3 py-1.5 text-xs ${output === "exported" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
          >Exported entry</button>
          <button
            type="button"
            onclick={() => (output = "alias")}
            class={`rounded-lg px-3 py-1.5 text-xs ${output === "alias" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
          >Alias</button>
        </div>
        {#if result}
          <button type="button" onclick={copy} class="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800">
            {copied ? "Copied" : "Copy"}
          </button>
        {/if}
      </div>

      {#if phase === "loading"}
        <p class="p-5 text-sm text-slate-400">Loading cpak...</p>
      {:else if phase === "failed"}
        <p class="p-5 font-mono text-xs leading-5 text-red-300">{failure}</p>
      {:else if refusal}
        <div class="p-5">
          <p class="text-sm font-semibold text-amber-300">cpak refuses this export</p>
          <p class="mt-2 font-mono text-xs leading-5 text-slate-300">{refusal}</p>
        </div>
      {:else if result}
        <div class="border-b border-slate-800 px-4 py-3 sm:px-5">
          <p class="truncate font-mono text-xs text-slate-400">{renderedName()}</p>
        </div>
        <pre class="min-h-[29rem] overflow-auto p-4 font-mono text-[13px] leading-6 text-slate-100 sm:p-5">{rendered()}</pre>
      {/if}
    </aside>
  </div>
</section>
