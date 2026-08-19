<script lang="ts">
  import { onMount, tick } from "svelte";
  import Seo from "$lib/components/Seo.svelte";
  import CoreStatus from "$lib/components/learn/CoreStatus.svelte";
  import { CoreError, loadCore, type Core } from "$lib/learn/core";
  import {
    HOST,
    HOST_SUMMARY,
    NOTES,
    SCOPES,
    STARTING_POINTS,
    USER_DIRS,
    USER_DIRS_PATH,
    type Entry,
  } from "./fixture";

  type Resolved = {
    path: string;
    access: string;
    source?: string;
    target?: string;
    error?: string;
  };

  type Plan = {
    valid: boolean;
    error?: string;
    entries: Resolved[];
    host: unknown;
  };

  let core = $state<Core | null>(null);
  let phase = $state<"loading" | "ready" | "failed">("loading");
  let failure = $state("");

  let entries = $state<Entry[]>([...STARTING_POINTS[0].entries]);
  let fields = $state<HTMLInputElement[]>([]);
  let addButton = $state<HTMLButtonElement | undefined>();

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

  async function add(entry: Entry = { path: "", access: "read-only" }) {
    entries = [...entries, { ...entry }];
    await tick();
    fields[entries.length - 1]?.focus();
  }

  async function remove(index: number) {
    entries = entries.filter((_, position) => position !== index);
    await tick();
    if (entries.length === 0) addButton?.focus();
    else fields[Math.min(index, entries.length - 1)]?.focus();
  }

  function start(chosen: Entry[]) {
    entries = chosen.map((entry) => ({ ...entry }));
  }

  function count(value: number, one: string, many: string): string {
    return `${value} ${value === 1 ? one : many}`;
  }

  let answer = $derived.by(() => {
    if (!core || phase !== "ready") return null;
    return core.ask<Plan>("filesystemPlan", { filesystem: entries, host: HOST });
  });

  let plan = $derived(answer && answer.ok ? answer.result : null);
  let broke = $derived(answer && !answer.ok ? answer.error : "");
  let resolved = $derived(plan ? plan.entries.filter((entry) => entry.source) : []);
  let unresolved = $derived(plan ? plan.entries.filter((entry) => entry.error) : []);

  let summary = $derived.by(() => {
    if (phase !== "ready") return "";
    if (broke) return `The module could not answer: ${broke}`;
    if (!plan) return "";
    if (entries.length === 0) return "No entries. The application reaches none of the host.";
    const counted = `${count(resolved.length, "entry", "entries")} resolved, ${count(
      unresolved.length,
      "refused",
      "refused",
    )}.`;
    return plan.valid
      ? `${counted} cpak accepts the list.`
      : `${counted} cpak refuses the list: ${plan.error}`;
  });
</script>

<Seo
  title="Filesystem board - cpak"
  description="Write a cpak filesystem permission list and see the host directory and the path inside the sandbox each entry resolves to, decided by cpak's own code running in the page."
  path="/learn/play/filesystem"
/>

<div class="mx-auto max-w-7xl px-6 py-12 lg:py-16">
  <a href="/docs/file-access" class="text-sm font-medium text-[#4670EC] hover:underline"
    >File access</a
  >
  <h1 class="mt-5 text-4xl font-extrabold text-gray-900">Filesystem board</h1>
  <p class="mt-4 max-w-3xl text-lg text-gray-600">
    Write the filesystem list a manifest would carry and see what each entry
    resolves to: the directory it comes from on the host, and the path the
    application finds it at. The answers come from cpak's own resolution code,
    built to WebAssembly and running in this page.
  </p>
  <p class="mt-3 max-w-3xl leading-7 text-gray-600">
    The two are the same path almost everywhere, and the exceptions are the
    interesting part. <code class="font-mono text-sm">host</code> arrives at
    <code class="font-mono text-sm">/run/host</code>, so an application handed the
    whole filesystem cannot mistake it for its own root. The portable scopes,
    <code class="font-mono text-sm">home</code> and the XDG user directories, name
    a place rather than a path, and what they name is a different directory on every
    machine.
  </p>

  <div class="mt-8">
    <CoreStatus state={phase} version={core?.version ?? ""} error={failure} onretry={load} />
  </div>

  <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="text-lg font-semibold text-gray-900">The host these answers are about</h2>
    <p class="mt-2 max-w-3xl leading-7 text-gray-600">
      {HOST_SUMMARY} It is sent with every question and the module answers about it,
      never about the computer you are reading this on. That is why two people comparing
      this page see the same directories.
    </p>
    <ul class="mt-4 space-y-1 text-sm leading-6 text-gray-600">
      {#each NOTES as note}
        <li class="flex gap-2"><span aria-hidden="true">·</span><span>{note}</span></li>
      {/each}
    </ul>
    <details class="mt-4">
      <summary class="cursor-pointer text-sm font-medium text-[#4670EC]">
        {USER_DIRS_PATH}, as the module receives it
      </summary>
      <pre
        class="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100">{USER_DIRS}</pre>
    </details>
  </section>

  {#if phase === "ready"}
    <div class="mt-8 grid items-start gap-8 lg:grid-cols-2">
      <section
        aria-labelledby="list-heading"
        class="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 id="list-heading" class="text-lg font-semibold text-gray-900">
          The list a manifest carries
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Every entry is a place and an access mode. Nothing outside this list is
          reachable.
        </p>

        <div class="mt-4 flex flex-wrap gap-2">
          {#each STARTING_POINTS as point}
            <button
              type="button"
              onclick={() => start(point.entries)}
              class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
            >
              {point.name}
            </button>
          {/each}
          <button
            type="button"
            onclick={() => start([])}
            class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
          >
            Empty
          </button>
        </div>

        <ul class="mt-6 space-y-3">
          {#each entries as entry, index (entry)}
            <li class="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem_auto] sm:items-end">
                <div class="min-w-0">
                  <label for={`path-${index}`} class="block text-xs text-gray-500"
                    >Path</label
                  >
                  <input
                    id={`path-${index}`}
                    type="text"
                    bind:value={entry.path}
                    bind:this={fields[index]}
                    spellcheck="false"
                    autocapitalize="off"
                   
                    placeholder="home, host, xdg-documents or an absolute path"
                    aria-invalid={plan?.entries[index]?.error ? "true" : "false"}
                    aria-describedby={`resolution-${index}`}
                    class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-gray-800 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
                  />
                </div>
                <div>
                  <label for={`access-${index}`} class="block text-xs text-gray-500"
                    >Access</label
                  >
                  <select
                    id={`access-${index}`}
                    bind:value={entry.access}
                    class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
                  >
                    <option value="read-only">read-only</option>
                    <option value="read-write">read-write</option>
                  </select>
                </div>
                <button
                  type="button"
                  onclick={() => remove(index)}
                  class="justify-self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
                >
                  Remove<span class="sr-only"> entry {index + 1}, {entry.path || "empty"}</span
                  >
                </button>
              </div>
            </li>
          {:else}
            <li class="rounded-xl bg-slate-50 px-4 py-3 leading-7 text-gray-600">
              The list is empty, which is a real answer: an application whose
              manifest carries no filesystem permission reaches none of the host.
            </li>
          {/each}
        </ul>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            bind:this={addButton}
            onclick={() => add()}
            class="rounded-full bg-[#3E7BFF] px-5 py-2 text-sm font-semibold text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Add an entry
          </button>
        </div>

        <h3 class="mt-6 text-sm font-semibold text-gray-900">The scopes a path can be</h3>
        <div class="mt-3 flex flex-wrap gap-2">
          {#each SCOPES as scope}
            <button
              type="button"
              onclick={() => add({ path: scope.path, access: scope.access })}
              title={scope.note}
              class="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
            >
              {scope.path}
            </button>
          {/each}
        </div>
      </section>

      <section
        aria-labelledby="plan-heading"
        class="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 id="plan-heading" class="text-lg font-semibold text-gray-900">
          Where each entry lands
        </h2>
        <p class="mt-1 text-sm text-gray-500" role="status" aria-live="polite">
          {summary}
        </p>

        {#if broke}
          <p
            class="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 leading-7 text-red-600"
          >
            <span class="material-symbols-outlined text-[20px]">error</span>
            <span>{broke}</span>
          </p>
        {:else if plan}
          {#if !plan.valid && plan.error}
            <p
              class="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 leading-7 text-red-600"
            >
              <span class="material-symbols-outlined text-[20px]">error</span>
              <span>
                cpak refuses this list: {plan.error} The entries below are what each
                line would have resolved to on its own.
              </span>
            </p>
          {/if}

          {#if plan.entries.length === 0}
            <p class="mt-6 rounded-xl bg-slate-50 px-4 py-3 leading-7 text-gray-600">
              Nothing to resolve. Add an entry, or start from one of the lists.
            </p>
          {:else}
            <ol class="mt-4 space-y-3">
              {#each plan.entries as entry, index}
                <li
                  id={`resolution-${index}`}
                  class={`rounded-xl border p-4 ${
                    entry.error ? "border-red-200 bg-white" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div class="flex flex-wrap items-baseline gap-2">
                    <span class="font-mono text-sm break-all text-gray-900"
                      >{entry.path || "(empty)"}</span
                    >
                    <span
                      class="rounded-full bg-[#3E7BFF]/10 px-2 py-0.5 text-[11px] font-semibold text-[#3158c7]"
                      >{entry.access}</span
                    >
                  </div>
                  {#if entry.error}
                    <p class="mt-2 leading-6 text-red-600">{entry.error}</p>
                  {:else}
                    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
                    <div
                      role="region"
                      aria-label={`Where ${entry.path} lands`}
                      tabindex="0"
                      class="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
                    >
                      <table class="w-max text-left">
                        <tbody class="divide-y divide-slate-200">
                          <tr>
                            <th
                              scope="row"
                              class="px-3 py-2 text-xs font-medium whitespace-nowrap text-gray-500"
                              >On the host</th
                            >
                            <td class="px-3 py-2 font-mono text-xs whitespace-nowrap text-gray-800"
                              >{entry.source}</td
                            >
                          </tr>
                          <tr>
                            <th
                              scope="row"
                              class="px-3 py-2 text-xs font-medium whitespace-nowrap text-gray-500"
                              >In the sandbox</th
                            >
                            <td class="px-3 py-2 font-mono text-xs whitespace-nowrap text-gray-800"
                              >{entry.target}</td
                            >
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {#if entry.source !== entry.target}
                      <p class="mt-2 leading-6 text-gray-600">
                        The one entry where the two differ. The host filesystem is
                        offered somewhere the application cannot mistake it for its
                        own root, and read-only is the only mode it can have.
                      </p>
                    {/if}
                  {/if}
                </li>
              {/each}
            </ol>
            <details class="mt-6">
              <summary class="cursor-pointer text-sm font-medium text-[#4670EC]">
                The question this board asked
              </summary>
              <pre
                class="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100">{JSON.stringify(
                  { filesystem: entries, host: HOST },
                  null,
                  2,
                )}</pre>
            </details>
          {/if}
        {/if}
      </section>
    </div>
  {/if}
</div>
