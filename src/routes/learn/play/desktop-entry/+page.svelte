<script lang="ts">
  import { onMount } from "svelte";
  import Seo from "$lib/components/Seo.svelte";
  import Board from "$lib/components/learn/play/Board.svelte";
  import { CoreError, loadCore, type Core } from "$lib/learn/core";
  import {
    EXAMPLES,
    EXPORT_DEFAULTS,
    PROBE,
    probe,
    type Example,
  } from "./examples";

  type Export = {
    exportId: string;
    exported: string;
    exportedFileName: string;
    alias: string;
    aliasFileName: string;
  };

  type Part = { text: string; blank: boolean };

  type Row = {
    number: number;
    published: string;
    parts: Part[];
    blanks: string;
    spelling: string;
    key: string;
    written: string;
    rewritten: boolean;
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
    if (copyTimer) clearTimeout(copyTimer);
    try {
      await navigator.clipboard.writeText(value);
      copied = key;
    } catch {
      copied = `${key}:refused`;
    }
    copyTimer = setTimeout(() => (copied = ""), 2400);
  }

  /** The key a line cpak wrote sets, read off what it wrote. */
  function keyOf(line: string): string {
    const cut = line.indexOf("=");
    return cut < 0 ? "" : line.slice(0, cut);
  }

  /**
   * A published line cut into the runs a launcher skips and the runs it reads,
   * so the difference between a space, a tab and a gap before the equals sign
   * is something you can see rather than something you are told.
   */
  function segments(line: string): Part[] {
    const parts: Part[] = [];
    const lead = /^[ \t]+/.exec(line)?.[0] ?? "";
    if (lead) parts.push({ text: lead, blank: true });
    const rest = line.slice(lead.length);
    const cut = rest.indexOf("=");
    if (cut < 0) {
      if (rest) parts.push({ text: rest, blank: false });
      return parts;
    }
    const name = rest.slice(0, cut);
    const gap = /[ \t]+$/.exec(name)?.[0] ?? "";
    const bare = name.slice(0, name.length - gap.length);
    if (bare) parts.push({ text: bare, blank: false });
    if (gap) parts.push({ text: gap, blank: true });
    parts.push({ text: rest.slice(cut), blank: false });
    return parts;
  }

  function blankWords(run: string): string {
    const spaces = (run.match(/ /g) ?? []).length;
    const tabs = (run.match(/\t/g) ?? []).length;
    const words: string[] = [];
    if (spaces) words.push(spaces === 1 ? "one space" : `${spaces} spaces`);
    if (tabs) words.push(tabs === 1 ? "one tab" : `${tabs} tabs`);
    return words.join(" and ");
  }

  /** The same difference, in words, for somebody who is not looking at it. */
  function blanks(line: string): string {
    const lead = /^[ \t]+/.exec(line)?.[0] ?? "";
    const rest = line.slice(lead.length);
    const cut = rest.indexOf("=");
    const gap = cut < 0 ? "" : (/[ \t]+$/.exec(rest.slice(0, cut))?.[0] ?? "");
    const notes: string[] = [];
    if (lead) notes.push(`${blankWords(lead)} before the key`);
    if (gap) notes.push(`${blankWords(gap)} before the equals sign`);
    return notes.join(", ");
  }

  /** The literal spelling of a key, with the tabs written where they are. */
  function spelling(line: string): string {
    const cut = line.indexOf("=");
    if (cut < 0) return "";
    return `"${line.slice(0, cut + 1).replace(/\t/g, "\\t")}"`;
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

  let asked = $derived(
    phase === "ready" && entry.trim() !== "" && missing.length === 0,
  );

  let request = $derived({
    entry,
    name: fileName.trim() === "" ? "application.desktop" : fileName,
    origin,
    cpakId,
    launcher,
    icon,
  });

  let answer = $derived(
    core && asked ? core.ask<Export>("desktopEntry", request) : null,
  );

  // The same file exported again with values nothing else uses. A line that
  // moves between the two exports is a line cpak read a key on, which is how
  // the board can mark a key without parsing the file itself.
  let probed = $derived(
    core && asked
      ? core.ask<Export>("desktopEntry", {
          ...request,
          origin: probe(origin, PROBE.origin),
          cpakId: probe(cpakId, PROBE.cpakId),
          launcher: probe(launcher, PROBE.launcher),
          icon: probe(icon, PROBE.icon),
        })
      : null,
  );

  let result = $derived(answer && answer.ok ? answer.result : null);
  let refused = $derived(answer && !answer.ok ? answer.error : "");

  let rows = $derived.by<Row[]>(() => {
    if (!result || !probed || !probed.ok) return [];
    const published = entry.split("\n");
    const written = result.exported.split("\n");
    const moved = probed.result.exported.split("\n");
    return published.map((line, index) => {
      const wrote = written[index] ?? line;
      const shifted = moved[index] ?? line;
      const rewritten = wrote !== line;
      const key = rewritten
        ? keyOf(wrote)
        : shifted !== line
          ? keyOf(shifted)
          : "";
      return {
        number: index + 1,
        published: line,
        parts: segments(line),
        blanks: blanks(line),
        spelling: key === "" ? "" : spelling(line),
        key,
        written: wrote,
        rewritten,
      };
    });
  });

  let execRows = $derived(rows.filter((row) => row.key === "Exec"));
  let readRows = $derived(rows.filter((row) => row.key !== ""));
  let marked = $derived(result ? result.alias !== result.exported : false);

  let summary = $derived.by(() => {
    if (phase === "loading") return "Waiting for the decision module.";
    if (phase === "failed") return "The decision module could not be loaded.";
    if (missing.length > 0) return `The export needs ${missing.join(" and ")}.`;
    if (entry.trim() === "") return "No entry to export yet.";
    if (refused) return `cpak refused the entry: ${refused}`;
    return `${count(rows.length, "line", "lines")}, ${count(
      readRows.length,
      "carrying a key cpak acts on",
      "carrying a key cpak acts on",
    )}, ${count(execRows.length, "of them Exec", "of them Exec")}.`;
  });
</script>

<Seo
  title="Desktop entry board - cpak"
  description="Paste a .desktop file and see exactly what cpak exports for it, line by line, decided by cpak's own code running in the page."
  path="/learn/play/desktop-entry"
/>

<Board
  title="Desktop entry"
  sentence="Paste the .desktop file your image ships and read the two files cpak exports for it, line by line."
  reference={{ href: "/docs/system-integration", label: "System integration" }}
  {phase}
  version={core?.version ?? ""}
  error={failure}
  onretry={load}
>
  <div class="grid gap-6 lg:grid-cols-12 lg:items-start">
    <section
      aria-labelledby="entry-heading"
      class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-5 lg:row-start-1"
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
            class={`rounded-full border px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none ${
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
          class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
        >
          Empty
        </button>
      </div>

      <label for="entry" class="mt-5 block text-sm font-semibold text-gray-900"
        >The file</label
      >
      <textarea
        id="entry"
        rows="14"
        bind:value={entry}
        oninput={() => (example = null)}
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
        aria-describedby="entry-note"
        class="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-5 text-gray-800 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
      ></textarea>
      <p id="entry-note" class="mt-2 text-xs leading-5 text-gray-500">
        Nothing leaves the page. The file is handed to the module in this tab
        and nowhere else.
      </p>

      {#if example}
        <p class="mt-4 leading-7 text-gray-600">{example.note}</p>
      {/if}
    </section>

    <section
      aria-labelledby="read-heading"
      class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1"
    >
      <h2 id="read-heading" class="text-lg font-semibold text-gray-900">
        What a launcher reads
      </h2>
      <p class="mt-1 text-sm text-gray-500" role="status" aria-live="polite">
        {summary}
      </p>

      {#if phase === "loading"}
        <div class="mt-6 rounded-xl bg-slate-50 px-4 py-3">
          <p class="flex items-center gap-2 leading-7 text-gray-600">
            <span
              class="material-symbols-outlined animate-spin text-[20px] text-gray-400"
              aria-hidden="true">progress_activity</span
            >
            The module that answers this is still loading. You can write the entry
            in the meantime.
          </p>
        </div>
      {:else if phase === "failed"}
        <div class="mt-6 rounded-xl border border-red-200 bg-white px-4 py-3">
          <p class="leading-7 text-red-600">{failure}</p>
          <p class="mt-2 leading-7 text-gray-600">
            Nothing here can be answered without it. Every answer on this board
            is decided by cpak's own code, so the board shows you nothing rather
            than a guess.
          </p>
          <button
            type="button"
            onclick={load}
            class="mt-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
          >
            Try again
          </button>
        </div>
      {:else if missing.length > 0}
        <p
          class="mt-6 rounded-xl bg-slate-50 px-4 py-3 leading-7 text-gray-600"
        >
          The board needs {missing.join(" and ")} before it can ask. cpak exports
          an entry for an application it installed, and the command it writes is
          built out of what the installation knows.
        </p>
      {:else if entry.trim() === ""}
        <p
          class="mt-6 rounded-xl bg-slate-50 px-4 py-3 leading-7 text-gray-600"
        >
          Nothing to read yet. Paste a <code class="font-mono text-sm"
            >.desktop</code
          > file, or pick one of the examples.
        </p>
      {:else if refused}
        <p
          class="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 leading-7 text-red-600"
        >
          <span class="material-symbols-outlined text-[20px]" aria-hidden="true"
            >error</span
          >
          <span>{refused}</span>
        </p>
      {:else}
        {#if execRows.length > 1}
          <p
            class="mt-4 rounded-xl bg-slate-50 px-4 py-3 leading-7 text-gray-600"
          >
            {execRows.length} lines here set Exec, however they are spelled. A launcher
            keeps the last one it reads in a group, and cpak rewrote every one of
            them, so whichever it keeps runs inside the sandbox.
          </p>
        {/if}

        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div
          role="region"
          aria-label="The entry line by line"
          tabindex="0"
          class="mt-4 max-h-[32rem] overflow-auto rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
        >
          <table class="w-max min-w-full text-left">
            <thead class="bg-slate-50 text-xs text-gray-500">
              <tr>
                <th scope="col" class="px-3 py-2 font-medium">Line</th>
                <th scope="col" class="px-3 py-2 font-medium">As published</th>
                <th scope="col" class="px-3 py-2 font-medium">Key</th>
                <th scope="col" class="px-3 py-2 font-medium"
                  >What cpak wrote</th
                >
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              {#each rows as row}
                <tr class={row.key === "" ? "" : "bg-[#3E7BFF]/5"}>
                  <td
                    class="px-3 py-2 align-top font-mono text-xs text-gray-400"
                    >{row.number}</td
                  >
                  <td
                    class="px-3 py-2 align-top font-mono text-xs whitespace-pre text-gray-800"
                  >
                    {#each row.parts as part}{#if part.blank}<span
                          class="rounded-xs bg-[#3E7BFF]/25">{part.text}</span
                        >{:else}{part.text}{/if}{/each}{#if row.blanks}<span
                        class="sr-only">, {row.blanks}</span
                      >{/if}
                  </td>
                  <td class="px-3 py-2 align-top text-xs">
                    {#if row.key === ""}
                      <span class="text-gray-400">none</span>
                    {:else}
                      <span
                        class="rounded-full bg-[#3E7BFF]/10 px-2 py-0.5 font-semibold whitespace-nowrap text-[#3158c7]"
                        >{row.key}</span
                      >
                      {#if row.spelling}
                        <span
                          class="mt-1 block font-mono text-[11px] whitespace-nowrap text-gray-500"
                          >{row.spelling}</span
                        >
                      {/if}
                    {/if}
                  </td>
                  <td class="px-3 py-2 align-top font-mono text-xs">
                    {#if row.rewritten}
                      <span class="whitespace-pre text-gray-800"
                        >{row.written}</span
                      >
                    {:else if row.key === "Icon" && icon.trim() === ""}
                      <span class="font-sans text-gray-500"
                        >No icon was extracted, so the publisher's own icon name
                        stays.</span
                      >
                    {:else if row.key !== ""}
                      <span class="font-sans text-gray-500"
                        >cpak wrote the line that was already there.</span
                      >
                    {:else}
                      <span class="font-sans text-gray-400">left as it was</span
                      >
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs leading-5 text-gray-500">
          The tinted blanks are whitespace a launcher skips: before the key, and
          between the key and the equals sign. Every line cpak read is written
          back without it, which is why the rewritten lines all start at the
          margin.
        </p>
      {/if}
    </section>

    <section
      aria-labelledby="install-heading"
      class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-5 lg:col-start-1 lg:row-start-2"
    >
      <h2 id="install-heading" class="text-lg font-semibold text-gray-900">
        What cpak knows at export time
      </h2>
      <p class="mt-1 text-sm text-gray-500">
        An entry is exported for an application cpak installed, so these come
        from the installation rather than from the file.
      </p>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label for="origin" class="block text-sm text-gray-700">Origin</label>
          <input
            id="origin"
            type="text"
            bind:value={origin}
            spellcheck="false"
            autocomplete="off"
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
            autocomplete="off"
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
            autocomplete="off"
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
            autocomplete="off"
            aria-describedby="icon-note"
            class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-gray-800 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
          />
          <p id="icon-note" class="mt-1 text-xs leading-5 text-gray-500">
            Empty it and the Icon line is read and left alone.
          </p>
        </div>
        <div class="sm:col-span-2">
          <label for="file-name" class="block text-sm text-gray-700"
            >The file name in the image</label
          >
          <input
            id="file-name"
            type="text"
            bind:value={fileName}
            spellcheck="false"
            autocomplete="off"
            class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-gray-800 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
          />
        </div>
      </div>
    </section>
  </div>

  {#if result}
    <section
      aria-labelledby="files-heading"
      class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <h2 id="files-heading" class="text-lg font-semibold text-gray-900">
        The two files cpak writes
      </h2>
      <p class="mt-2 max-w-3xl leading-7 text-gray-600">
        The exported entry is the one a menu shows and runs. The alias keeps the
        publisher's own file name, so a launcher that was told about the
        application by that name still finds it: it is hidden from menus and
        carries the two keys that say whose it is. Both are named after the
        installation through a digest, so the name is a single path element
        whatever the identifier turns out to contain:
        <code class="font-mono text-sm break-all">{result.exportId}</code>.
      </p>

      <div class="mt-5 grid gap-6 lg:grid-cols-2">
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
              {copied === "exported"
                ? "Copied"
                : copied === "exported:refused"
                  ? "The browser refused"
                  : "Copy"}
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
              {copied === "alias"
                ? "Copied"
                : copied === "alias:refused"
                  ? "The browser refused"
                  : "Copy"}
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
              <code class="font-mono text-sm">[Desktop Entry]</code> group, so there
              is nowhere to write NoDisplay or the two cpak keys. cpak will not invent
              the group, so the alias comes out as the exported entry, unmarked,
              and a later export cannot recognise it as its own.
            </p>
          {/if}
        </div>
      </div>
    </section>
  {/if}

  <section
    aria-labelledby="notice-heading"
    class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6"
  >
    <h2 id="notice-heading" class="text-lg font-semibold text-gray-900">
      Why the spelling of a key matters
    </h2>
    <p class="mt-2 max-w-3xl leading-7 text-gray-600">
      A desktop entry comes from the publisher, and replacing its Exec line is
      the only thing keeping a menu click inside the sandbox. A launcher does
      not compare bytes to find that line: it skips the whitespace before the
      key and around the equals sign, so
      <code class="font-mono text-sm">" Exec="</code>,
      <code class="font-mono text-sm">"\tExec="</code> and
      <code class="font-mono text-sm">"Exec ="</code> are one key to it. An export
      that tested for the first eight characters would leave all three exactly as
      they were, and the launcher would run the publisher's command outside the sandbox.
    </p>
    <p class="mt-3 max-w-3xl leading-7 text-gray-600">
      Duplicates make it worse: a launcher keeps the last line it reads in a
      group, so a file could carry a rewritten line for cpak to find and an
      untouched one for the launcher to run. This board marks a key by exporting
      the file twice with different values and watching which lines move, so
      what it calls a key is what cpak read and not what this page guessed.
    </p>
  </section>
</Board>
