<script lang="ts">
  import type { BoardStatus } from "$lib/learn/boards";
  import { onMount, untrack } from "svelte";
  import JsonPane from "$lib/components/learn/JsonPane.svelte";
  import Lines from "$lib/components/learn/Lines.svelte";
  import { loadCore, type Core } from "$lib/learn/core";
  import { CASES, MACHINES } from "$lib/learn/ceiling";
  import {
    describe,
    format,
    granted,
    keysOf,
    parse,
    type Catalog,
    type Host,
    type Override,
    type Policy,
  } from "$lib/learn/policy";

  /** A permission the ceiling left open, with what it opens on its own. */
  type Reach = { key: string; mounts: string[] };

  /** One alias family the ceiling touched, read in the direction it applies. */
  type Family = {
    named: string[];
    pulled: string[];
    open: Reach[];
    mutual: boolean;
  };

  /** The three inputs and the machine, as one question for the module. */
  type Question = {
    manifestText: string;
    user: Override | null;
    ceiling: Override | null;
    named: string[];
    host: Host;
    machineId: string;
  };

  type Answer = {
    policy: Policy;
    named: string[];
    held: string[];
    families: Family[];
    open: Reach[];
    untouched: string[];
    changed: string[];
    formal: string[];
    asked: string[];
    carries: string[];
    removedMounts: string[];
    removedShims: string[];
    closedNothing: boolean;
  };

  // The board is the same component standalone and inside a lesson, so the
  // frame around it is not its business. It only says how the decision
  // module is doing, and whoever placed it says that in its own words.
  let { onstatus = () => {} }: { onstatus?: (state: BoardStatus) => void } =
    $props();

  let core = $state<Core | null>(null);
  let coreState = $state<"loading" | "ready" | "failed">("loading");
  let coreError = $state("");
  let catalog = $state<Catalog>({ permissions: [], aliases: [] });

  let manifestText = $state(CASES[0].manifest);
  let userText = $state(CASES[0].user);
  let ceilingText = $state(CASES[0].ceiling);
  let machineId = $state(CASES[0].machine);

  let board = $state<Answer | null>(null);
  let refusal = $state("");

  let manifest = $derived(parse<Record<string, unknown>>(manifestText));
  let user = $derived(parse<Override>(userText));
  let ceiling = $derived(parse<Override>(ceilingText));
  let machine = $derived(
    MACHINES.find((entry) => entry.id === machineId) ?? MACHINES[0],
  );

  let worked = $derived(
    CASES.find(
      (entry) =>
        entry.manifest === manifestText &&
        entry.user === userText &&
        entry.ceiling === ceilingText &&
        entry.machine === machineId,
    ),
  );

  let blocked = $derived.by(() => {
    if (manifestText.trim() === "") return "empty";
    if (manifest.error || user.error || ceiling.error) return "invalid";
    return "";
  });

  // What one permission binds on its own, asked once per permission and host
  // and kept. It is what lets the board show that two keys open one door.
  const alone = new Map<string, string[]>();

  function opens(loaded: Core, question: Question, key: string): string[] {
    const kept = alone.get(`${question.machineId}:${key}`);
    if (kept) return kept;
    const permission = catalog.permissions.find((entry) => entry.key === key);
    if (!permission || permission.kind !== "bool") return [];
    const answer = loaded.ask<Policy>("effectivePolicy", {
      override: { [key]: true },
      host: question.host,
    });
    const mounts = answer.ok ? answer.result.mounts : [];
    alone.set(`${question.machineId}:${key}`, mounts);
    return mounts;
  }

  /**
   * Everything the board shows, asked of the module. The policy is asked twice,
   * once with the ceiling and once without it, because the interesting number
   * is not what runs but what the ceiling took off it.
   */
  function decide(loaded: Core, question: Question): Answer | string {
    const request = {
      manifestText: question.manifestText,
      userOverride: question.user,
      host: question.host,
    };
    const managed = loaded.ask<Policy>("effectivePolicy", {
      ...request,
      ceiling: question.ceiling,
    });
    if (!managed.ok) return managed.error;
    const unmanaged = loaded.ask<Policy>("effectivePolicy", request);

    const policy = managed.result;
    const named = question.named;
    const held = policy.ceilingHolds ?? [];
    const carries = granted(policy.effective, catalog);
    const asked = granted(policy.requested, catalog);

    // A key can be narrowed and come back reading the same on both sides: an
    // unset list and an empty one differ to the runtime and not to a reader.
    const changed = policy.narrowed.filter(
      (key) => show(policy.requested[key]) !== show(policy.effective[key]),
    );

    const families: Family[] = [];
    for (const family of catalog.aliases) {
      const inside = [...family.WhenAnyOf, ...family.AlsoHold];
      const mine = named.filter((key) => inside.includes(key));
      if (mine.length === 0) continue;
      const pulled = held.filter(
        (key) => inside.includes(key) && !named.includes(key),
      );
      // The wide key is the one every narrow key also holds. Naming it does
      // not reach back down, so those narrow keys are the ones left open.
      const wide = mine.some((key) => family.AlsoHold.includes(key));
      const open = wide
        ? family.WhenAnyOf.filter(
            (key) => !held.includes(key) && carries.includes(key),
          ).map((key) => ({ key, mounts: opens(loaded, question, key) }))
        : [];
      if (pulled.length === 0 && open.length === 0) continue;
      // Two keys that hold each other open one door under two names. A key
      // that is only held by the other is the wider one, and says so.
      const mutual = [...mine, ...pulled].every((key) =>
        family.WhenAnyOf.includes(key),
      );
      families.push({ named: mine, pulled, open, mutual });
    }

    const open: Reach[] = [];
    for (const family of families) {
      for (const entry of family.open) {
        if (!open.some((seen) => seen.key === entry.key)) open.push(entry);
      }
    }

    return {
      policy,
      named,
      held,
      families,
      open,
      untouched: carries.filter(
        (key) => !held.includes(key) && !open.some((hole) => hole.key === key),
      ),
      changed,
      formal: policy.narrowed.filter((key) => !changed.includes(key)),
      asked,
      carries,
      removedMounts: unmanaged.ok
        ? unmanaged.result.mounts.filter(
            (path) => !policy.mounts.includes(path),
          )
        : [],
      removedShims: unmanaged.ok
        ? unmanaged.result.shims.filter((name) => !policy.shims.includes(name))
        : [],
      closedNothing: named.length > 0 && changed.length === 0,
    };
  }

  // The module is asked again a moment after typing stops. It answers in the
  // page, so there is nothing to wait for beyond that.
  $effect(() => {
    const current = core;
    const question: Question = {
      manifestText,
      user: user.value ?? null,
      ceiling: ceiling.value ?? null,
      named: ceiling.value ? keysOf(ceiling.value) : [],
      host: machine.host,
      machineId: machine.id,
    };
    const stopped = blocked;
    if (!current) return;
    if (stopped) {
      board = null;
      refusal = "";
      return;
    }
    const timer = setTimeout(() => {
      const answer = decide(current, question);
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
        alone.clear();
        core = loaded;
        coreState = "ready";
      })
      .catch((error: unknown) => {
        coreState = "failed";
        coreError = error instanceof Error ? error.message : String(error);
      });
  }

  onMount(start);

  function apply(entry: (typeof CASES)[number]) {
    manifestText = entry.manifest;
    userText = entry.user;
    ceilingText = entry.ceiling;
    machineId = entry.machine;
  }

  function count(value: number, one: string, many: string) {
    return `${value} ${value === 1 ? one : many}`;
  }

  function show(value: unknown): string {
    if (value === true) return "granted";
    if (value === false) return "closed";
    if (value === undefined || value === null) return "not asked for";
    if (Array.isArray(value)) {
      if (value.length === 0) return "nothing";
      return value.map(item).join(", ");
    }
    if (typeof value === "object") {
      const on = Object.entries(value as Record<string, unknown>)
        .filter((entry) => entry[1])
        .map((entry) => entry[0]);
      return on.length === 0 ? "nothing" : on.join(", ");
    }
    return String(value);
  }

  function item(value: unknown): string {
    if (value && typeof value === "object") {
      const entry = value as { path?: string; access?: string };
      if (entry.path) return `${entry.path} (${entry.access})`;
      return JSON.stringify(value);
    }
    return String(value);
  }

  let filesystem = $derived(board?.policy.effective.filesystem ?? []);

  let tone = $derived.by(() => {
    if (coreState === "failed" || refusal) return "bad";
    if (board && (board.closedNothing || board.open.length > 0)) return "warn";
    return "plain";
  });

  let verdict = $derived.by(() => {
    if (coreState === "loading")
      return "Loading cpak. Nothing is decided yet.";
    if (coreState === "failed")
      return "cpak's own code could not be loaded, so nothing is decided.";
    if (blocked === "empty")
      return "No manifest yet. Pick a case or write one.";
    if (blocked === "invalid") return "One of the three panes is not JSON yet.";
    if (refusal) return `cpak refuses this: ${refusal}`;
    // The module is here but has not answered these three panes yet. It is a
    // moment, and a bar that goes blank for it reads as an answer of nothing.
    if (!board) return "Working out what runs.";
    const runs = `The application runs with ${count(board.carries.length, "permission", "permissions")} and ${count(board.policy.mounts.length, "mount", "mounts")}.`;
    if (board.named.length === 0) return `No ceiling on this host. ${runs}`;
    // A permission the ceiling never named that reaches what it did name is
    // the whole point of the board, so the top line says so first.
    const holes = board.open.map((hole) => hole.key);
    const left =
      holes.length === 0
        ? ""
        : ` ${holes.join(", ")} ${holes.length === 1 ? "is" : "are"} still open under another name.`;
    if (board.closedNothing) {
      return `This ceiling closed nothing: it names ${board.named.join(", ")}, and nothing it names was narrowed.${left} ${runs}`;
    }
    const removed =
      board.removedMounts.length === 0
        ? "took no mount away"
        : `took away ${count(board.removedMounts.length, "mount", "mounts")}`;
    return `The ceiling narrowed ${count(board.changed.length, "permission", "permissions")} and ${removed}.${left} ${runs}`;
  });

  $effect(() => {
    const state: BoardStatus = {
      phase: coreState,
      version: core?.version ?? "",
      error: coreError,
      retry: start,
    };
    untrack(() => onstatus(state));
  });
</script>

<div class="@container">
  <!-- The answer stays on screen while the panes below it are edited: on a
       phone the two are never both in view, and an answer nobody can see is
       the defect this bar exists to correct. -->
  <p
    class={`sticky top-0 z-20 -mx-6 flex items-start gap-2 border-y bg-white px-6 py-3 text-sm leading-6 ${
      tone === "bad"
        ? "border-red-200"
        : tone === "warn"
          ? "border-yellow-400"
          : "border-slate-200"
    }`}
    role="status"
    aria-live="polite"
  >
    <span
      class={`material-symbols-outlined text-[18px] leading-6 ${
        tone === "bad"
          ? "text-red-600"
          : tone === "warn"
            ? "text-yellow-800"
            : "text-[#3E7BFF]"
      }`}
      aria-hidden="true"
    >
      {tone === "bad" ? "error" : tone === "warn" ? "warning" : "rule"}
    </span>
    <span
      class={tone === "plain" ? "text-gray-900" : "font-medium text-gray-900"}
      >{verdict}</span
    >
  </p>

  <div class="mt-6 grid items-start gap-6 @3xl:grid-cols-12">
    <section aria-labelledby="inputs" class="min-w-0 @3xl:col-span-5">
      <h2 id="inputs" class="sr-only">What the three parties say</h2>

      <div class="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 class="text-sm font-semibold text-gray-900">Start from a case</h3>
        <div class="mt-3 flex flex-wrap gap-2">
          {#each CASES as entry}
            <button
              type="button"
              onclick={() => apply(entry)}
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
            : "Your own case. Change any of the three panes and read what runs."}
        </p>
      </div>

      <div class="mt-4 flex flex-col gap-4">
        <JsonPane
          id="manifest"
          label="The manifest"
          note="What the package asks for. A permission it does not name is not granted."
          state={manifestText.trim() === ""
            ? "Empty. Nothing can be decided without it."
            : board
              ? `${count(board.asked.length, "permission", "permissions")} asked for.`
              : "Read by cpak as it stands."}
          rows={14}
          bind:value={manifestText}
          error={manifest.error ?? ""}
        />
        <JsonPane
          id="user"
          label="The owner's override"
          note="What the person who installed it decided. It replaces the manifest request rather than adding to it."
          state={userText.trim() === ""
            ? "Empty. The manifest request stands."
            : board?.policy.source === "user"
              ? "In force. The manifest request was replaced by this."
              : "Written, but the manifest request is what was decided on."}
          rows={10}
          bind:value={userText}
          error={user.error ?? ""}
          onclear={() => (userText = "")}
        />
        <JsonPane
          id="ceiling"
          label="The administrator's ceiling"
          note="The widest policy this host permits. It decides only the keys it writes, and writing true is not a grant."
          state={ceilingText.trim() === ""
            ? "Empty. This host is unmanaged, so nothing narrows the policy."
            : board
              ? `Names ${count(board.named.length, "key", "keys")}, holds ${board.held.length}.`
              : "Read by cpak as it stands."}
          rows={10}
          bind:value={ceilingText}
          error={ceiling.error ?? ""}
          onclear={() => (ceilingText = "")}
        />

        <div class="rounded-2xl border border-slate-200 bg-white p-4">
          <fieldset>
            <legend class="text-sm font-semibold text-gray-900">
              The machine this is computed for
            </legend>
            <p class="mt-1 text-xs leading-5 text-gray-500">
              A mount is made against a real host. This one is written down
              rather than read off your computer, so two people comparing this
              board see the same answer.
            </p>
            <div class="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {#each MACHINES as entry}
                <div class="flex items-center gap-2">
                  <input
                    type="radio"
                    id={`machine-${entry.id}`}
                    name="machine"
                    value={entry.id}
                    bind:group={machineId}
                    class="h-4 w-4 text-[#3E7BFF] focus:ring-[#3E7BFF]"
                  />
                  <label
                    for={`machine-${entry.id}`}
                    class="text-sm text-gray-800">{entry.label}</label
                  >
                </div>
              {/each}
            </div>
            <p class="mt-3 text-sm leading-6 text-gray-600">{machine.note}</p>
            <details class="mt-3">
              <summary
                class="cursor-pointer text-sm font-medium text-[#4670EC] hover:underline"
              >
                What this host reports
              </summary>
              <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
              <div
                role="region"
                aria-label="The host, as cpak receives it"
                tabindex="0"
                class="mt-2 max-h-56 overflow-auto rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
              >
                <pre
                  class="w-max min-w-full p-3 font-mono text-xs leading-5 text-gray-800">{format(
                    machine.host,
                  )}</pre>
              </div>
            </details>
          </fieldset>
        </div>
      </div>
    </section>

    <section
      aria-labelledby="answer"
      class="flex min-w-0 flex-col gap-4 @3xl:col-span-7"
    >
      <h2 id="answer" class="sr-only">What runs</h2>

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
            Nothing is decided until cpak's own code is here and checked.
          </p>
        </div>
      {:else if coreState === "failed"}
        <div class="rounded-2xl border border-red-200 bg-red-100 p-5">
          <p class="text-sm font-semibold text-red-700">
            Nothing can be decided
          </p>
          <p class="mt-1 text-sm leading-6 text-gray-600">
            Nothing here is written from memory, so no answer is shown. Try
            again from the button at the top of the page.
          </p>
        </div>
      {:else if blocked === "empty"}
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <p class="text-sm leading-6 text-gray-600">
            The manifest pane is empty. Pick one of the cases, or write a
            manifest, and what runs appears here.
          </p>
        </div>
      {:else if blocked === "invalid"}
        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <p class="text-sm leading-6 text-gray-600">
            One of the panes is not JSON yet, so the last answer was dropped
            rather than left standing beside text that no longer says it. The
            pane says where it stops parsing.
          </p>
        </div>
      {:else if refusal}
        <div class="rounded-2xl border border-red-200 bg-red-100 p-5">
          <p class="text-sm font-semibold text-red-700">
            cpak refused this input
          </p>
          <p class="mt-1 font-mono text-sm break-words text-red-700">
            {refusal}
          </p>
          <p class="mt-2 text-sm leading-6 text-gray-600">
            This is the runtime's own answer, in its own words. A manifest that
            does not validate never reaches the ceiling.
          </p>
        </div>
      {:else if board}
        <div class="grid gap-4 @md:grid-cols-3">
          <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
            <p
              class="text-xs font-semibold tracking-wider text-gray-500 uppercase"
            >
              Asked for
            </p>
            <p class="mt-1 text-3xl font-bold text-gray-900">
              {board.asked.length}
            </p>
            <p class="mt-1 text-sm leading-6 text-gray-600">
              {board.policy.source === "user"
                ? "permissions, by the owner. The manifest request was replaced."
                : "permissions, by the manifest. No owner override was written."}
            </p>
          </div>
          <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
            <p
              class="text-xs font-semibold tracking-wider text-gray-500 uppercase"
            >
              Ceiling
            </p>
            <p class="mt-1 text-3xl font-bold text-gray-900">
              {board.named.length === 0
                ? "none"
                : `${board.named.length} named`}
            </p>
            <p class="mt-1 text-sm leading-6 text-gray-600">
              {board.named.length === 0
                ? "This host is unmanaged, so the request above stands."
                : `${count(board.held.length, "key", "keys")} held once the names that reach the same thing are counted.`}
            </p>
          </div>
          <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
            <p
              class="text-xs font-semibold tracking-wider text-gray-500 uppercase"
            >
              Runs with
            </p>
            <p class="mt-1 text-3xl font-bold text-gray-900">
              {board.carries.length}
            </p>
            <p class="mt-1 text-sm leading-6 text-gray-600">
              permissions, {count(
                board.policy.mounts.length,
                "mount",
                "mounts",
              )}
              and {count(board.policy.shims.length, "shim", "shims")}.
            </p>
          </div>
        </div>

        {#if board.open.length > 0}
          <div class="rounded-2xl border border-yellow-400 bg-yellow-100 p-5">
            <h3 class="flex items-center gap-2 font-semibold text-yellow-800">
              <span
                class="material-symbols-outlined text-[20px]"
                aria-hidden="true">warning</span
              >
              Still open under another name
            </h3>
            <p class="mt-2 text-sm leading-6 text-gray-600">
              The ceiling names {board.named.join(", ")}. A ceiling narrows the
              keys it writes and nothing else, and these were never written, so
              the application still holds them and still opens what they open.
            </p>
            <ul class="mt-3 space-y-3">
              {#each board.open as hole}
                <li>
                  <p class="font-mono text-sm text-gray-900">{hole.key}</p>
                  <p class="text-xs leading-5 text-gray-600">
                    {describe(hole.key, catalog)}
                  </p>
                  <div class="mt-2">
                    <Lines
                      label={`What ${hole.key} still opens`}
                      items={hole.mounts}
                      empty="Nothing on this machine, but it grants the same access wherever there is something to open."
                      height="max-h-32"
                    />
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        {:else if board.closedNothing}
          <div class="rounded-2xl border border-yellow-400 bg-yellow-100 p-5">
            <h3 class="flex items-center gap-2 font-semibold text-yellow-800">
              <span
                class="material-symbols-outlined text-[20px]"
                aria-hidden="true">warning</span
              >
              This ceiling closed nothing
            </h3>
            <p class="mt-2 text-sm leading-6 text-gray-600">
              It names {board.named.join(", ")}, and everything it names was
              already within it. The application runs with exactly what it asked
              for.
            </p>
          </div>
        {/if}

        <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="text-lg font-semibold text-gray-900">
            What the ceiling reaches
          </h3>
          {#if board.named.length === 0}
            <p class="mt-2 text-sm leading-6 text-gray-600">
              No ceiling is written on this host, so nothing is held. Everything
              below is what was asked for.
            </p>
          {:else}
            <p class="mt-2 text-sm leading-6 text-gray-600">
              A ceiling decides the keys it writes. These are the ones it wrote:
            </p>
            <ul class="mt-2 flex flex-wrap gap-2">
              {#each board.named as key}
                <li
                  class="rounded-full border border-[#3E7BFF]/40 bg-[#3E7BFF]/10 px-3 py-1 font-mono text-xs text-[#3158c7]"
                  title={describe(key, catalog)}
                >
                  {key}
                </li>
              {/each}
            </ul>
            {#each board.families as family}
              {#if family.pulled.length > 0}
                <p class="mt-4 text-sm leading-6 text-gray-600">
                  Naming <span class="font-mono">{family.named.join(", ")}</span
                  >
                  also holds
                  <span class="font-mono">{family.pulled.join(", ")}</span>:
                  {family.mutual
                    ? "they open the same thing, so a ceiling that named one and left the other would close nothing."
                    : "it would otherwise grant the same thing again under a wider name."}
                </p>
              {/if}
            {/each}
            {#if board.untouched.length > 0}
              <p class="mt-4 text-sm leading-6 text-gray-600">
                It says nothing about these, so the application keeps whatever
                the manifest and the owner agreed on:
              </p>
              <ul class="mt-2 flex flex-wrap gap-2">
                {#each board.untouched as key}
                  <li
                    class="rounded-full border border-slate-200 px-3 py-1 font-mono text-xs text-gray-500"
                    title={describe(key, catalog)}
                  >
                    {key}
                  </li>
                {/each}
              </ul>
            {/if}
          {/if}
        </div>

        <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="text-lg font-semibold text-gray-900">What it changed</h3>
          {#if board.changed.length === 0}
            <p class="mt-2 text-sm leading-6 text-gray-600">
              Nothing was narrowed. The policy that runs is the one that was
              asked for.
            </p>
          {:else}
            <p class="mt-2 text-sm leading-6 text-gray-600">
              Each of these was asked for and came out smaller. A ceiling can
              only ever narrow.
            </p>
            <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
            <div
              role="region"
              aria-label="Permissions the ceiling narrowed"
              tabindex="0"
              class="mt-3 max-h-72 min-w-0 overflow-auto rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
            >
              <table class="w-full min-w-[30rem] text-left text-sm">
                <thead class="bg-slate-50">
                  <tr>
                    <th
                      scope="col"
                      class="px-3 py-2 font-semibold text-gray-900"
                    >
                      Permission
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-2 font-semibold text-gray-900"
                    >
                      Asked for
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-2 font-semibold text-gray-900">Runs</th
                    >
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  {#each board.changed as key}
                    <tr>
                      <th
                        scope="row"
                        class="px-3 py-2 font-mono text-xs font-normal text-gray-800"
                        >{key}</th
                      >
                      <td class="px-3 py-2 text-xs text-gray-600"
                        >{show(board.policy.requested[key])}</td
                      >
                      <td class="px-3 py-2 text-xs text-gray-900"
                        >{show(board.policy.effective[key])}</td
                      >
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
          {#if board.formal.length > 0}
            <p class="mt-3 text-xs leading-5 text-gray-500">
              The ceiling also reached
              <span class="font-mono">{board.formal.join(", ")}</span>, which
              was empty on both sides. Nothing about it changed.
            </p>
          {/if}
        </div>

        <div class="grid gap-4 @5xl:grid-cols-2">
          <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 class="text-lg font-semibold text-gray-900">
              The permissions it runs with
            </h3>
            {#if board.carries.length === 0}
              <p class="mt-2 text-sm leading-6 text-gray-600">
                None. The application starts with no access to the host at all.
              </p>
            {:else}
              <ul class="mt-3 flex flex-wrap gap-2">
                {#each board.carries as key}
                  <li
                    class="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-gray-800"
                    title={describe(key, catalog)}
                  >
                    {key}
                  </li>
                {/each}
              </ul>
            {/if}
            <h4 class="mt-5 text-sm font-semibold text-gray-900">
              Filesystem grants
            </h4>
            {#if filesystem.length === 0}
              <p class="mt-1 text-sm leading-6 text-gray-600">
                No host file is reachable.
              </p>
            {:else}
              <ul class="mt-2 space-y-1">
                {#each filesystem as grant}
                  <li class="font-mono text-xs break-all text-gray-800">
                    {grant.path} ({grant.access})
                  </li>
                {/each}
              </ul>
            {/if}
            <p class="mt-4 text-xs leading-5 text-gray-500">
              These are not in the mount list beside them: they are resolved
              against the home and user directories of whoever runs the
              application, which
              <a
                href="/learn/play/filesystem"
                class="font-medium text-[#4670EC] hover:underline"
                >the filesystem board</a
              > works through.
            </p>
          </div>

          <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 class="text-lg font-semibold text-gray-900">
              What that mounts here
            </h3>
            <p class="mt-2 text-sm leading-6 text-gray-600">
              The paths this policy binds into the namespace on the machine
              chosen beside it. A permission is not a flag consulted later: it
              is one of these.
            </p>
            <div class="mt-3">
              <Lines
                label="Mounts"
                items={board.policy.mounts}
                empty="This policy mounts nothing."
              />
            </div>
            {#if board.removedMounts.length > 0 || board.removedShims.length > 0}
              <p class="mt-4 text-sm leading-6 text-gray-600">
                Without the ceiling the same manifest would also get these. This
                is what the ceiling took away:
              </p>
              <div class="mt-2">
                <Lines
                  label="What the ceiling took away"
                  items={[...board.removedMounts, ...board.removedShims]}
                  empty=""
                  height="max-h-40"
                />
              </div>
            {:else if board.named.length > 0}
              <p class="mt-4 text-sm leading-6 text-gray-600">
                The same manifest without the ceiling would mount exactly this.
                The ceiling took nothing away.
              </p>
            {/if}
            <h4 class="mt-5 text-sm font-semibold text-gray-900">
              Broker shims
            </h4>
            <p class="mt-1 text-sm leading-6 text-gray-600">
              Commands the container gets instead of the host programs they are
              named after. Nothing is exposed: the request is forwarded.
            </p>
            <div class="mt-3">
              <Lines
                label="Broker shims"
                items={board.policy.shims}
                empty="No shims: this policy forwards nothing to the host."
                height="max-h-40"
              />
            </div>
          </div>
        </div>
      {/if}
    </section>
  </div>

  <section class="mt-10 border-t border-slate-200 pt-8">
    <p class="max-w-3xl text-sm leading-6 text-gray-600">
      A manifest that still carries version 1 filesystem fields is a different
      exercise:
      <a
        href="/learn/play/migration"
        class="font-medium text-[#4670EC] hover:underline"
        >the migration board</a
      >
      shows what each of them becomes. The controls themselves are documented in
      <a
        href="/docs/managed-deployment"
        class="font-medium text-[#4670EC] hover:underline">managed deployment</a
      >
      and
      <a
        href="/docs/permissions"
        class="font-medium text-[#4670EC] hover:underline">permissions</a
      >.
    </p>
  </section>
</div>
