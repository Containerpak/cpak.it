<script lang="ts">
  import { onMount, tick } from "svelte";
  import Seo from "$lib/components/Seo.svelte";
  import Board from "$lib/components/learn/play/Board.svelte";
  import { CoreError, loadCore, type Core } from "$lib/learn/core";
  import {
    HOST,
    HOST_FACTS,
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

  let entries = $state<Entry[]>(
    STARTING_POINTS[0].entries.map((e) => ({ ...e })),
  );
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
    fields = fields.filter((_, position) => position !== index);
    await tick();
    if (entries.length === 0) addButton?.focus();
    else fields[Math.min(index, entries.length - 1)]?.focus();
  }

  function start(chosen: Entry[]) {
    entries = chosen.map((entry) => ({ ...entry }));
    fields = [];
  }

  function count(value: number, one: string, many: string): string {
    return `${value} ${value === 1 ? one : many}`;
  }

  let request = $derived({ filesystem: entries, host: HOST });

  let answer = $derived(
    core && phase === "ready"
      ? core.ask<Plan>("filesystemPlan", request)
      : null,
  );

  let plan = $derived(answer && answer.ok ? answer.result : null);
  let broke = $derived(answer && !answer.ok ? answer.error : "");
  let resolved = $derived(
    plan ? plan.entries.filter((entry) => entry.source) : [],
  );
  let unresolved = $derived(
    plan ? plan.entries.filter((entry) => entry.error) : [],
  );
  let moved = $derived(
    resolved.filter((entry) => entry.source !== entry.target),
  );

  let summary = $derived.by(() => {
    if (phase === "loading") return "Waiting for the decision module.";
    if (phase === "failed") return "The decision module could not be loaded.";
    if (broke) return `The module could not answer: ${broke}`;
    if (!plan) return "";
    if (entries.length === 0)
      return "No entries. The application reaches none of the host.";
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

<Board
  title="Filesystem permissions"
  sentence="Write the filesystem list a manifest would carry and read where every entry lands: the directory it comes from on the host, and the path the application finds it at."
  reference={{ href: "/docs/file-access", label: "File access" }}
  {phase}
  version={core?.version ?? ""}
  error={failure}
  onretry={load}
>
  <div class="grid gap-6 lg:grid-cols-12 lg:items-start">
    <section
      aria-labelledby="list-heading"
      class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-5 lg:row-start-1"
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
            class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
          >
            {point.name}
          </button>
        {/each}
        <button
          type="button"
          onclick={() => start([])}
          class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
        >
          Empty
        </button>
      </div>

      <ul class="mt-5 space-y-3">
        {#each entries as entry, index (entry)}
          <li class="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div
              class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:items-end"
            >
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
                  autocomplete="off"
                  placeholder="home, host, xdg-documents or an absolute path"
                  aria-invalid={plan?.entries[index]?.error ? "true" : "false"}
                  class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-gray-800 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
                />
              </div>
              <div>
                <label
                  for={`access-${index}`}
                  class="block text-xs text-gray-500">Access</label
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
                Remove<span class="sr-only">
                  entry {index + 1}, {entry.path || "empty"}</span
                >
              </button>
            </div>
            {#if plan?.entries[index]?.error}
              <p class="mt-2 text-xs leading-5 text-red-600">
                {plan.entries[index].error}
              </p>
            {/if}
          </li>
        {:else}
          <li class="rounded-xl bg-slate-50 px-4 py-3 leading-7 text-gray-600">
            The list is empty, which is a real answer: an application whose
            manifest carries no filesystem permission reaches none of the host.
          </li>
        {/each}
      </ul>

      <button
        type="button"
        bind:this={addButton}
        onclick={() => add()}
        class="mt-4 rounded-full bg-[#3E7BFF] px-5 py-2 text-sm font-semibold text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Add an entry
      </button>

      <h3 class="mt-6 text-sm font-semibold text-gray-900">
        The scopes a path can be
      </h3>
      <p class="mt-1 text-xs leading-5 text-gray-500">
        Each one adds an entry to the list.
      </p>
      <div class="mt-3 flex flex-wrap gap-2">
        {#each SCOPES as scope}
          <button
            type="button"
            onclick={() => add({ path: scope.path, access: scope.access })}
            title={scope.note}
            class="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
          >
            {scope.path}<span class="sr-only">. {scope.note}</span>
          </button>
        {/each}
      </div>
    </section>

    <section
      aria-labelledby="plan-heading"
      class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1"
    >
      <h2 id="plan-heading" class="text-lg font-semibold text-gray-900">
        Where each entry lands
      </h2>
      <p class="mt-1 text-sm text-gray-500" role="status" aria-live="polite">
        {summary}
      </p>
      <ul
        class="mt-3 flex flex-wrap gap-2"
        aria-label="The host these answers are about"
      >
        {#each HOST_FACTS as fact}
          <li
            class="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-gray-600"
          >
            {fact}
          </li>
        {/each}
      </ul>

      {#if phase === "loading"}
        <div class="mt-6 rounded-xl bg-slate-50 px-4 py-3">
          <p class="flex items-center gap-2 leading-7 text-gray-600">
            <span
              class="material-symbols-outlined animate-spin text-[20px] text-gray-400"
              aria-hidden="true">progress_activity</span
            >
            The module that resolves these is still loading. You can write the list
            in the meantime.
          </p>
        </div>
      {:else if phase === "failed"}
        <div class="mt-6 rounded-xl border border-red-200 bg-white px-4 py-3">
          <p class="leading-7 text-red-600">{failure}</p>
          <p class="mt-2 leading-7 text-gray-600">
            A path resolves against a home directory and a session, and the only
            thing here that knows how is the module. The board shows you nothing
            rather than a guess.
          </p>
          <button
            type="button"
            onclick={load}
            class="mt-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
          >
            Try again
          </button>
        </div>
      {:else if broke}
        <p
          class="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 leading-7 text-red-600"
        >
          <span class="material-symbols-outlined text-[20px]" aria-hidden="true"
            >error</span
          >
          <span>{broke}</span>
        </p>
      {:else if plan}
        {#if !plan.valid && plan.error}
          <p
            class="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 leading-7 text-red-600"
          >
            <span
              class="material-symbols-outlined text-[20px]"
              aria-hidden="true">error</span
            >
            <span>
              cpak refuses this list: {plan.error} The rows below are what each line
              would have resolved to on its own.
            </span>
          </p>
        {/if}

        {#if plan.entries.length === 0}
          <p
            class="mt-6 rounded-xl bg-slate-50 px-4 py-3 leading-7 text-gray-600"
          >
            Nothing to resolve. Add an entry, or start from one of the lists.
          </p>
        {:else}
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <div
            role="region"
            aria-label="Where each entry lands"
            tabindex="0"
            class="mt-4 max-h-[32rem] overflow-auto rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
          >
            <table class="w-max min-w-full text-left">
              <thead class="bg-slate-50 text-xs text-gray-500">
                <tr>
                  <th scope="col" class="px-3 py-2 font-medium">Written</th>
                  <th scope="col" class="px-3 py-2 font-medium">Access</th>
                  <th scope="col" class="px-3 py-2 font-medium">On the host</th>
                  <th scope="col" class="px-3 py-2 font-medium"
                    >In the sandbox</th
                  >
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                {#each plan.entries as entry}
                  <tr class={entry.error ? "bg-red-50" : ""}>
                    <th
                      scope="row"
                      class="px-3 py-2 align-top font-mono text-xs font-normal whitespace-nowrap text-gray-900"
                      >{entry.path || "(empty)"}</th
                    >
                    <td
                      class="px-3 py-2 align-top text-xs whitespace-nowrap text-gray-600"
                      >{entry.access}</td
                    >
                    {#if entry.error}
                      <td
                        class="px-3 py-2 align-top text-xs text-red-600"
                        colspan="2">{entry.error}</td
                      >
                    {:else}
                      <td
                        class="px-3 py-2 align-top font-mono text-xs whitespace-nowrap text-gray-800"
                        >{entry.source}</td
                      >
                      <td
                        class={`px-3 py-2 align-top font-mono text-xs whitespace-nowrap ${
                          entry.source === entry.target
                            ? "text-gray-800"
                            : "font-semibold text-[#3158c7]"
                        }`}>{entry.target}</td
                      >
                    {/if}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          {#if moved.length > 0}
            <p class="mt-3 leading-7 text-gray-600">
              The two paths are the same everywhere except the host scope. The
              whole filesystem is offered at
              <code class="font-mono text-sm">/run/host</code>, so an
              application given the host cannot mistake it for its own root, and
              read-only is the only mode it can have.
            </p>
          {:else}
            <p class="mt-3 text-xs leading-5 text-gray-500">
              The two paths are the same for every entry here. The host scope is
              the one that lands somewhere else.
            </p>
          {/if}
        {/if}
      {/if}
    </section>

    <section
      aria-labelledby="host-heading"
      class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-5 lg:col-start-1 lg:row-start-2"
    >
      <h2 id="host-heading" class="text-lg font-semibold text-gray-900">
        The host these answers are about
      </h2>
      <p class="mt-2 leading-7 text-gray-600">
        {HOST_SUMMARY} It is sent with every question and the module answers about
        it, never about the computer you are reading this on. That is why two people
        comparing this page see the same directories.
      </p>
      <ul class="mt-4 space-y-2 text-sm leading-6 text-gray-600">
        {#each NOTES as note}
          <li class="flex gap-2">
            <span aria-hidden="true">&middot;</span><span>{note}</span>
          </li>
        {/each}
      </ul>
      <details class="mt-4">
        <summary
          class="cursor-pointer rounded-sm text-sm font-medium text-[#4670EC] focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
        >
          {USER_DIRS_PATH}, as the module receives it
        </summary>
        <pre
          class="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100">{USER_DIRS}</pre>
      </details>
      <details class="mt-3">
        <summary
          class="cursor-pointer rounded-sm text-sm font-medium text-[#4670EC] focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
        >
          The question this board asked
        </summary>
        <pre
          class="mt-3 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100">{JSON.stringify(
            request,
            null,
            2,
          )}</pre>
      </details>
    </section>
  </div>
</Board>
