<script lang="ts">
  import { onMount } from "svelte";
  import Seo from "$lib/components/Seo.svelte";
  import CoreStatus from "$lib/components/learn/CoreStatus.svelte";
  import { CoreError, loadCore, type Core } from "$lib/learn/core";
  import { EXAMPLES, EXPORT_DEFAULTS, type Example } from "./examples";

  type Export = {
    exportId: string;
    exported: string;
    exportedFileName: string;
    alias: string;
    aliasFileName: string;
  };

  type Row = {
    number: number;
    lead: string;
    published: string;
    written: string;
    key: string;
    changed: boolean;
  };

  let core = $state<Core | null>(null);
  let phase = $state<"loading" | "ready" | "failed">("loading");
  let failure = $state("");

  let entry = $state(EXAMPLES[0].entry);
  let example = $state<Example | null>(EXAMPLES[0]);
  let fileName = $state(EXAMPLES[0].fileName);
  let origin = $state(EXPORT_DEFAULTS.origin);
  let cpakId = $state(EXPORT_DEFAULTS.cpakId);
  let launcher = $state(EXPORT_DEFAULTS.launcher);
  let icon = $state(EXPORT_DEFAULTS.icon);
  let copied = $state("");
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

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

  function choose(chosen: Example) {
    example = chosen;
    entry = chosen.entry;
    fileName = chosen.fileName;
  }

  function clear() {
    example = null;
    entry = "";
  }

  async function copy(value: string, key: string) {
    await navigator.clipboard.writeText(value);
    copied = key;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = ""), 1800);
  }

  /** The key a rewritten line sets, read off what cpak wrote rather than guessed. */
  function keyOf(line: string): string {
    const cut = line.indexOf("=");
    return cut < 0 ? "" : line.slice(0, cut);
  }

  function count(value: number, one: string, many: string): string {
    return `${value} ${value === 1 ? one : many}`;
  }

  let missing = $derived(
    [
      origin.trim() === "" ? "the origin it was installed from" : "",
      cpakId.trim() === "" ? "the installation id" : "",
      launcher.trim() === "" ? "the path of the cpak binary" : "",
    ].filter((value) => value !== ""),
  );

  let answer = $derived.by(() => {
    if (!core || phase !== "ready") return null;
    if (entry.trim() === "" || missing.length > 0) return null;
    return core.ask<Export>("desktopEntry", {
      entry,
      name: fileName.trim() === "" ? "application.desktop" : fileName,
      origin,
      cpakId,
      launcher,
      icon,
    });
  });

  let result = $derived(answer && answer.ok ? answer.result : null);
  let refused = $derived(answer && !answer.ok ? answer.error : "");

  let rows = $derived.by<Row[]>(() => {
    if (!result) return [];
    const published = entry.split("\n");
    const written = result.exported.split("\n");
    return published.map((line, index) => {
      const after = written[index] ?? "";
      const lead = line.match(/^[ \t]+/);
      return {
        number: index + 1,
        lead: lead ? lead[0] : "",
        published: lead ? line.slice(lead[0].length) : line,
        written: after,
        key: keyOf(after),
        changed: after !== line,
      };
    });
  });

  let changed = $derived(rows.filter((row) => row.changed));
  let execLines = $derived(changed.filter((row) => row.key === "Exec"));
  let marked = $derived(result ? result.alias !== result.exported : false);

  let summary = $derived.by(() => {
    if (phase !== "ready") return "";
    if (missing.length > 0) return `The export needs ${missing.join(" and ")}.`;
    if (entry.trim() === "") return "No entry to export yet.";
    if (refused) return `cpak refused the entry: ${refused}`;
    return `${count(rows.length, "line", "lines")}, ${count(
      changed.length,
      "rewritten",
      "rewritten",
    )}, ${count(execLines.length, "of them setting", "of them setting")} Exec.`;
  });
</script>

<Seo
  title="Desktop entry board - cpak"
  description="Paste a .desktop file and see exactly what cpak exports for it, line by line, decided by cpak's own code running in the page."
  path="/learn/play/desktop-entry"
/>

<div class="mx-auto max-w-7xl px-6 py-12 lg:py-16">
  <a
    href="/docs/system-integration"
    class="text-sm font-medium text-[#4670EC] hover:underline">System integration</a
  >
  <h1 class="mt-5 text-4xl font-extrabold text-gray-900">Desktop entry board</h1>
  <p class="mt-4 max-w-3xl text-lg text-gray-600">
    Paste the <code class="font-mono text-base">.desktop</code> file your image ships
    and see the two files cpak writes for it, line by line. The answers come from
    cpak's own export code, built to WebAssembly and running in this page.
  </p>
  <p class="mt-3 max-w-3xl leading-7 text-gray-600">
    The line worth watching is Exec. A launcher does not compare bytes: it skips
    the whitespace before the key and around the equals sign, so a space before
    Exec, a tab before Exec and <code class="font-mono text-sm">Exec =</code> all
    set the same key. Replacing that line is the only thing keeping a menu click
    inside the sandbox, so a line cpak read differently from the launcher would
    be a launch that escaped it.
  </p>

  <div class="mt-8">
    <CoreStatus
      state={phase}
      version={core?.version ?? ""}
      error={failure}
      onretry={load}
    />
  </div>

  {#if phase === "ready"}
    <div class="mt-8 grid items-start gap-8 lg:grid-cols-3">
      <section
        aria-labelledby="entry-heading"
        class="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 id="entry-heading" class="text-lg font-semibold text-gray-900">
          The entry a package ships
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Paste your own, or start from one of these.
        </p>

        <div class="mt-4 flex flex-wrap gap-2">
          {#each EXAMPLES as candidate}
            <button
              type="button"
              onclick={() => choose(candidate)}
              aria-pressed={example?.id === candidate.id}
              class={`rounded-full border px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none ${
                example?.id === candidate.id
                  ? "border-[#3E7BFF] bg-[#3E7BFF]/10 text-[#3158c7]"
                  : "border-slate-200 bg-white text-gray-900 hover:bg-slate-100"
              }`}
            >
              {candidate.name}
            </button>
          {/each}
          <button
            type="button"
            onclick={clear}
            class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
          >
            Empty
          </button>
        </div>

        {#if example}
          <p class="mt-4 leading-7 text-gray-600">{example.note}</p>
        {/if}

        <label for="entry" class="mt-6 block text-sm font-semibold text-gray-900"
          >The file</label
        >
        <textarea
          id="entry"
          rows="14"
          bind:value={entry}
          oninput={() => (example = null)}
          spellcheck="false"
          autocapitalize="off"
         
          aria-describedby="entry-note"
          class="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-5 text-gray-800 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
        ></textarea>
        <p id="entry-note" class="mt-2 text-xs leading-5 text-gray-500">
          Nothing leaves the page. The file is handed to the module in this tab
          and nowhere else.
        </p>

        <h3 class="mt-6 text-sm font-semibold text-gray-900">
          What cpak knows at export time
        </h3>
        <p class="mt-1 text-xs leading-5 text-gray-500">
          An entry is exported for an application cpak installed, so these come
          from the installation rather than from the file.
        </p>
        <div class="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <label for="origin" class="block text-sm text-gray-700">Origin</label>
            <input
              id="origin"
              type="text"
              bind:value={origin}
              spellcheck="false"
              aria-invalid={origin.trim() === "" ? "true" : "false"}
              class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-gray-800 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
            />
          </div>
          <div>
            <label for="cpak-id" class="block text-sm text-gray-700"
              >Installation id</label
            >
            <input
              id="cpak-id"
              type="text"
              bind:value={cpakId}
              spellcheck="false"
              aria-invalid={cpakId.trim() === "" ? "true" : "false"}
              class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-gray-800 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
            />
          </div>
          <div>
            <label for="launcher" class="block text-sm text-gray-700"
              >The cpak binary</label
            >
            <input
              id="launcher"
              type="text"
              bind:value={launcher}
              spellcheck="false"
              aria-invalid={launcher.trim() === "" ? "true" : "false"}
              aria-describedby="launcher-note"
              class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-gray-800 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
            />
            <p id="launcher-note" class="mt-1 text-xs leading-5 text-gray-500">
              Put a space in it and watch the Exec line get quoted.
            </p>
          </div>
          <div>
            <label for="icon" class="block text-sm text-gray-700"
              >The extracted icon</label
            >
            <input
              id="icon"
              type="text"
              bind:value={icon}
              spellcheck="false"
              aria-describedby="icon-note"
              class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-gray-800 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
            />
            <p id="icon-note" class="mt-1 text-xs leading-5 text-gray-500">
              Leave it empty and the entry keeps the icon name the publisher
              wrote.
            </p>
          </div>
          <div class="sm:col-span-2 lg:col-span-1">
            <label for="file-name" class="block text-sm text-gray-700"
              >The file name in the image</label
            >
            <input
              id="file-name"
              type="text"
              bind:value={fileName}
              spellcheck="false"
              class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-gray-800 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
            />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="read-heading"
        class="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
      >
        <h2 id="read-heading" class="text-lg font-semibold text-gray-900">
          What a launcher reads
        </h2>
        <p
          class="mt-1 text-sm text-gray-500"
          role="status"
          aria-live="polite"
        >
          {summary}
        </p>

        {#if missing.length > 0}
          <p class="mt-6 rounded-xl bg-slate-50 px-4 py-3 leading-7 text-gray-600">
            The board needs {missing.join(" and ")} before it can ask. cpak only
            exports an entry it installed itself, and without those the command it
            writes would have a hole in it.
          </p>
        {:else if entry.trim() === ""}
          <p class="mt-6 rounded-xl bg-slate-50 px-4 py-3 leading-7 text-gray-600">
            Nothing to read yet. Paste a <code class="font-mono text-sm"
              >.desktop</code
            > file, or pick one of the examples.
          </p>
        {:else if refused}
          <p
            class="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 leading-7 text-red-600"
          >
            <span class="material-symbols-outlined text-[20px]">error</span>
            <span>{refused}</span>
          </p>
        {:else}
          {#if execLines.length > 1}
            <p class="mt-4 rounded-xl bg-slate-50 px-4 py-3 leading-7 text-gray-600">
              {execLines.length} lines here set Exec. A launcher keeps the last one
              it reads, and cpak rewrote all of them, so whichever one is kept runs
              inside the sandbox.
            </p>
          {/if}
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <div
            role="region"
            aria-label="The entry line by line"
            tabindex="0"
            class="mt-4 overflow-x-auto rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
          >
            <table class="w-max min-w-full text-left">
              <thead class="bg-slate-50 text-xs text-gray-500">
                <tr>
                  <th scope="col" class="px-3 py-2 font-medium">Line</th>
                  <th scope="col" class="px-3 py-2 font-medium">As published</th>
                  <th scope="col" class="px-3 py-2 font-medium">What cpak wrote</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                {#each rows as row}
                  <tr>
                    <td class="px-3 py-2 align-top font-mono text-xs text-gray-400"
                      >{row.number}</td
                    >
                    <td
                      class="px-3 py-2 align-top font-mono text-xs whitespace-pre text-gray-800"
                    >
                      {#if row.lead}<span class="bg-[#3E7BFF]/20">{row.lead}</span
                        >{/if}{row.published}
                    </td>
                    <td class="px-3 py-2 align-top font-mono text-xs whitespace-pre">
                      {#if row.changed}
                        <span
                          class="mr-2 rounded-full bg-[#3E7BFF]/10 px-2 py-0.5 text-[11px] font-semibold text-[#3158c7]"
                          >read as {row.key}</span
                        >{row.written}
                      {:else}
                        <span class="text-gray-400">left as it was</span>
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <p class="mt-3 text-xs leading-5 text-gray-500">
            The tinted blank at the start of a line is whitespace the launcher
            skips. cpak writes every key it rewrites back without it, which is why
            the exported lines all start at the margin.
          </p>
        {/if}
      </section>
    </div>

    {#if result}
      <section
        aria-labelledby="files-heading"
        class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 id="files-heading" class="text-lg font-semibold text-gray-900">
          The two files cpak writes
        </h2>
        <p class="mt-2 max-w-3xl leading-7 text-gray-600">
          The exported entry is the one a menu shows and runs. The alias keeps the
          publisher's own file name, so a launcher that was told about the
          application by that name still finds it: it is hidden from menus and
          carries the two keys that say whose it is.
        </p>
        <p class="mt-2 max-w-3xl leading-7 text-gray-600">
          Both are named after the installation rather than the package, through a
          digest, so the name is a single path element whatever the identifier
          turns out to contain:
          <code class="font-mono text-sm break-all">{result.exportId}</code>.
        </p>

        <div class="mt-6 grid gap-6 lg:grid-cols-2">
          <div class="min-w-0">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <h3 class="font-mono text-sm break-all text-gray-900">
                {result.exportedFileName}
              </h3>
              <button
                type="button"
                onclick={() => copy(result.exported, "exported")}
                class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
              >
                {copied === "exported" ? "Copied" : "Copy"}
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-500">
              Written into the exported applications directory.
            </p>
            <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
            <pre
              role="region"
              aria-label="The exported entry"
              tabindex="0"
              class="mt-3 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none">{result.exported}</pre>
          </div>
          <div class="min-w-0">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <h3 class="font-mono text-sm break-all text-gray-900">
                {result.aliasFileName}
              </h3>
              <button
                type="button"
                onclick={() => copy(result.alias, "alias")}
                class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
              >
                {copied === "alias" ? "Copied" : "Copy"}
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-500">
              {#if marked}
                The publisher's own file name, hidden from menus.
              {:else}
                The same bytes as the exported entry.
              {/if}
            </p>
            <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
            <pre
              role="region"
              aria-label="The alias entry"
              tabindex="0"
              class="mt-3 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none">{result.alias}</pre>
            {#if !marked}
              <p class="mt-2 leading-6 text-gray-600">
                This file has no
                <code class="font-mono text-sm">[Desktop Entry]</code> group, so
                there is nowhere to write NoDisplay or the two cpak keys. cpak will
                not invent the group, so the alias comes out as the exported entry,
                unmarked, and a later export cannot recognise it as its own.
              </p>
            {/if}
          </div>
        </div>
      </section>
    {/if}
  {/if}
</div>
