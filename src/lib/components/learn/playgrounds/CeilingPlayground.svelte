<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { loadCore, type Core } from "$lib/learn/core";
  import { CASES, MACHINES } from "$lib/learn/ceiling";
  import { format, parse, type Host, type Override, type Policy } from "$lib/learn/policy";
  import type { PlaygroundStatus } from "$lib/learn/playgrounds";

  type Input = "manifest" | "user" | "ceiling" | "host";

  let { onstatus = () => {} }: { onstatus?: (state: PlaygroundStatus) => void } = $props();

  let core = $state<Core | null>(null);
  let status = $state<"loading" | "ready" | "failed">("loading");
  let failure = $state("");
  let active = $state<Input>("manifest");
  let selected = $state(CASES[0].id);
  let manifestText = $state(CASES[0].manifest);
  let userText = $state(CASES[0].user);
  let ceilingText = $state(CASES[0].ceiling);
  let hostText = $state(format(MACHINES[0].host));
  let answer = $state<Policy | null>(null);
  let refusal = $state("");

  onMount(load);

  async function load() {
    status = "loading";
    failure = "";
    try {
      core = await loadCore();
      status = "ready";
    } catch (error) {
      failure = error instanceof Error ? error.message : String(error);
      status = "failed";
    }
  }

  function loadCase(id: string) {
    const entry = CASES.find((item) => item.id === id) ?? CASES[0];
    const machine = MACHINES.find((item) => item.id === entry.machine) ?? MACHINES[0];
    selected = entry.id;
    manifestText = entry.manifest;
    userText = entry.user;
    ceilingText = entry.ceiling;
    hostText = format(machine.host);
  }

  function currentText() {
    if (active === "manifest") return manifestText;
    if (active === "user") return userText;
    if (active === "ceiling") return ceilingText;
    return hostText;
  }

  function setCurrent(value: string) {
    selected = "custom";
    if (active === "manifest") manifestText = value;
    else if (active === "user") userText = value;
    else if (active === "ceiling") ceilingText = value;
    else hostText = value;
  }

  function decodeOptional(text: string): { value: Override | null; error: string } {
    if (!text.trim()) return { value: null, error: "" };
    const decoded = parse<Override>(text);
    return { value: decoded.value ?? null, error: decoded.error ?? "" };
  }

  $effect(() => {
    const loaded = core;
    const manifest = manifestText;
    const user = userText;
    const ceiling = ceilingText;
    const host = hostText;
    if (!loaded || status !== "ready") return;

    const timer = setTimeout(() => {
      const decodedHost = parse<Host>(host);
      const decodedUser = decodeOptional(user);
      const decodedCeiling = decodeOptional(ceiling);
      const error = decodedHost.error || decodedUser.error || decodedCeiling.error;
      if (error || !decodedHost.value) {
        answer = null;
        refusal = error || "Host must contain one JSON object.";
        return;
      }

      const result = loaded.ask<Policy>("effectivePolicy", {
        manifestText: manifest,
        userOverride: decodedUser.value,
        ceiling: decodedCeiling.value,
        host: decodedHost.value,
      });
      if (!result.ok) {
        answer = null;
        refusal = result.error;
        return;
      }
      answer = result.result;
      refusal = "";
    }, 120);
    return () => clearTimeout(timer);
  });

  $effect(() => {
    const state: PlaygroundStatus = {
      phase: status,
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
      <h2 class="font-semibold text-white">Policy workspace</h2>
      <p class="mt-0.5 text-xs text-slate-400">Write every side of the decision and read the policy that reaches the container.</p>
    </div>
    <label for="ceiling-case" class="sr-only">Starting case</label>
    <select
      id="ceiling-case"
      value={selected}
      onchange={(event) => loadCase(event.currentTarget.value)}
      class="rounded-lg border-slate-700 bg-slate-900 py-1.5 pr-8 pl-3 text-xs text-slate-200 focus:border-[#7DA2FF] focus:ring-[#7DA2FF]"
    >
      {#each CASES as entry (entry.id)}
        <option value={entry.id}>{entry.label}</option>
      {/each}
      {#if selected === "custom"}<option value="custom">Custom</option>{/if}
    </select>
  </header>

  <div class="grid min-h-[34rem] lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
    <div class="min-w-0 border-b border-slate-800 lg:border-r lg:border-b-0">
      <div class="flex overflow-x-auto border-b border-slate-800 bg-slate-900">
        {#each [
          ["manifest", "cpak.json"],
          ["user", "user override"],
          ["ceiling", "ceiling"],
          ["host", "host.json"],
        ] as tab (tab[0])}
          <button
            type="button"
            onclick={() => (active = tab[0] as Input)}
            class={`shrink-0 border-b-2 px-4 py-3 font-mono text-xs transition ${active === tab[0] ? "border-[#7DA2FF] text-white" : "border-transparent text-slate-500 hover:text-slate-200"}`}
          >{tab[1]}</button>
        {/each}
      </div>
      <label for="ceiling-editor" class="sr-only">{active} JSON</label>
      <textarea
        id="ceiling-editor"
        value={currentText()}
        oninput={(event) => setCurrent(event.currentTarget.value)}
        rows="24"
        wrap="off"
        spellcheck="false"
        autocapitalize="off"
        placeholder={active === "user" || active === "ceiling" ? "Leave empty for none" : ""}
        class="block min-h-[32rem] w-full resize-y border-0 bg-slate-950 p-4 font-mono text-[13px] leading-6 text-slate-100 placeholder:text-slate-600 focus:ring-0 focus:outline-none sm:p-5"
      ></textarea>
    </div>

    <aside class="min-w-0 bg-slate-900/70" aria-live="polite">
      <div class="border-b border-slate-800 px-4 py-3 sm:px-5">
        <h3 class="text-sm font-semibold text-white">Effective policy</h3>
        <p class="mt-1 text-xs leading-5 text-slate-400">The manifest asks, the user override replaces that request and the ceiling can only remove access.</p>
      </div>

      <div class="space-y-6 px-4 py-5 sm:px-5">
        {#if status === "loading"}
          <p class="text-sm text-slate-400">Loading cpak...</p>
        {:else if status === "failed"}
          <p class="font-mono text-xs leading-5 text-red-300">{failure}</p>
        {:else if refusal}
          <div>
            <p class="text-sm font-semibold text-amber-300">cpak refuses this input</p>
            <p class="mt-2 font-mono text-xs leading-5 text-slate-300">{refusal}</p>
          </div>
        {:else if answer}
          <div>
            <p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">Decision source</p>
            <p class="mt-2 text-sm text-slate-200">{answer.source === "user" ? "User override" : "Package manifest"}</p>
          </div>

          <div>
            <p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">Narrowed fields</p>
            {#if answer.narrowed.length}
              <div class="mt-2 flex flex-wrap gap-1.5">
                {#each answer.narrowed as key (key)}<code class="rounded-md bg-slate-800 px-2 py-1 text-xs text-amber-200">{key}</code>{/each}
              </div>
            {:else}
              <p class="mt-2 text-sm text-slate-300">None.</p>
            {/if}
          </div>

          <div>
            <p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">Host mounts</p>
            {#if answer.mounts.length}
              <ul class="mt-2 space-y-2">
                {#each answer.mounts as mount (mount)}<li class="font-mono text-xs break-all text-slate-200">{mount}</li>{/each}
              </ul>
            {:else}
              <p class="mt-2 text-sm text-slate-300">No host paths are mounted.</p>
            {/if}
          </div>

          {#if answer.shims.length}
            <div>
              <p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">Broker commands</p>
              <ul class="mt-2 space-y-2">
                {#each answer.shims as shim (shim)}<li class="font-mono text-xs text-slate-200">{shim}</li>{/each}
              </ul>
            </div>
          {/if}

          <details class="border-t border-slate-800 pt-4">
            <summary class="cursor-pointer text-sm font-medium text-slate-200">Raw effective override</summary>
            <pre class="mt-3 overflow-x-auto font-mono text-[11px] leading-5 text-slate-400">{format(answer.effective)}</pre>
          </details>
        {/if}
      </div>
    </aside>
  </div>
</section>
