<script lang="ts">
  import type { BoardStatus } from "$lib/learn/boards";
  import { onMount, untrack } from "svelte";
  import { CoreError, loadCore, type Core } from "$lib/learn/core";
  import type {
    Catalog,
    Permission,
    Policy,
    Validation,
  } from "$lib/learn/policy";
  import {
    FIXTURE,
    format,
    manifestFor,
    ticksOf,
    toggled,
    type Manifest,
    type Ticks,
  } from "$lib/learn/play/permissions/fixture";
  import {
    reachOf,
    reachOfQuiet,
    reachOfShim,
  } from "$lib/learn/play/permissions/reach";
  import {
    noteOf,
    weigh,
    type Weighed,
  } from "$lib/learn/play/permissions/weight";

  type Mount = { path: string; by: string[]; reach: string };
  type Shim = { name: string; by: string[]; reach: string };
  type Swallowed = { key: string; inside: string };

  type Board = {
    /** The manifest cpak will not accept, and the stage it stopped at. */
    refusal: { stage: string; error: string } | null;
    /** The module could not answer at all. */
    failure: string | null;
    mounts: Mount[];
    shims: Shim[];
    swallowed: Swallowed[];
    quiet: { key: string; reach: string }[];
    ungranted: string[];
    ungrantedFailure: string | null;
  };

  const STARTS = [
    { name: "A window and nothing else", keys: ["socketWayland"] },
    {
      name: "A desktop application",
      keys: [
        "socketWayland",
        "socketPulseAudio",
        "notification",
        "openURI",
        "network",
      ],
    },
    {
      name: "A browser",
      keys: [
        "socketWayland",
        "socketPulseAudio",
        "deviceDri",
        "notification",
        "openURI",
        "network",
        "userNamespaces",
      ],
    },
    { name: "The session bus, alone", keys: ["socketSessionBus"] },
    { name: "Nothing at all", keys: [] },
  ];

  // The board is the same component standalone and inside a lesson, so the
  // frame around it is not its business. It only says how the decision
  // module is doing, and whoever placed it says that in its own words.
  let { onstatus = () => {} }: { onstatus?: (state: BoardStatus) => void } =
    $props();

  let core = $state<Core | null>(null);
  let status = $state<"loading" | "ready" | "failed">("loading");
  let failure = $state("");
  let permissions = $state<Permission[]>([]);
  // What each permission opens, measured rather than asserted. It is worked
  // out once, from the module's own answers, and it is what tells the rows
  // that open one named thing from the rows that do not.
  let weights = $state(new Map<string, Weighed>());
  let explicit = $state(false);
  let text = $state(
    format(manifestFor(["socketWayland"], { socketWayland: true }, false)),
  );
  let lastRead = $state<Manifest | null>(null);

  // What one permission binds on its own, asked once per permission and kept.
  // The module is deterministic and the host never changes, so a second answer
  // would be the first one again.
  const alone = new Map<string, Policy>();

  onMount(load);

  async function load() {
    status = "loading";
    failure = "";
    try {
      const loaded = await loadCore();
      const answer = loaded.ask<Catalog>("permissionCatalog", {});
      if (!answer.ok) throw new CoreError("start", answer.error);
      alone.clear();
      permissions = answer.result.permissions.filter(
        (permission) => permission.stated,
      );
      // Every permission is asked what it binds on its own before the board
      // draws a row for it, so the weight of a row is the module's answer and
      // not a judgement this page made about the name.
      for (const permission of permissions) contribution(loaded, permission.key);
      weights = weigh(alone);
      core = loaded;
      status = "ready";
    } catch (error) {
      failure = error instanceof Error ? error.message : String(error);
      status = "failed";
    }
  }

  /**
   * Sets or clears one permission in the manifest as it stands. Every other
   * field survives, including override keys this board has no checkbox for,
   * because the reader may have written them by hand.
   */
  function toggle(key: string, on: boolean) {
    if (!read) return;
    text = format(toggled(read, key, on, explicit));
  }

  /** Writes the manifest again from scratch. This is also how a broken one is repaired. */
  function start(keys: string[]) {
    const ticked: Ticks = {};
    for (const key of keys) ticked[key] = true;
    text = format(manifestFor(catalogKeys, ticked, explicit));
  }

  function writeOut(on: boolean) {
    explicit = on;
    if (!read) return;
    const written = manifestFor(catalogKeys, ticks, on).override ?? {};
    const kept: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(read.override ?? {})) {
      if (!catalogKeys.includes(key)) kept[key] = value;
    }
    text = format({ ...read, override: { ...written, ...kept } });
  }

  function contribution(loaded: Core, key: string): Policy {
    const kept = alone.get(key);
    if (kept) return kept;
    const answer = loaded.ask<Policy>("effectivePolicy", {
      override: { [key]: true },
      host: FIXTURE.host,
    });
    const policy = answer.ok
      ? answer.result
      : ({ mounts: [], shims: [] } as unknown as Policy);
    alone.set(key, policy);
    return policy;
  }

  function credit(sources: Map<string, string[]>, name: string, key: string) {
    sources.set(name, [...(sources.get(name) ?? []), key]);
  }

  /** The mount already on the page that a path is inside, if there is one. */
  function covering(path: string, mounts: string[]): string | null {
    for (const mount of mounts) {
      if (mount === path) return mount;
      if (mount.endsWith("/") && path.startsWith(mount)) return mount;
    }
    return null;
  }

  /**
   * Everything the page shows, asked of the module: whether cpak accepts the
   * manifest, what it binds on the fixture, and which permissions the manifest
   * never mentions.
   */
  function decide(loaded: Core, manifest: Manifest, chosen: string[]): Board {
    const checked = loaded.ask<Validation>("validateManifest", { manifest });
    const missing = loaded.ask<{ permissions: string[] }>(
      "ungrantedPermissions",
      { manifest },
    );
    const board: Board = {
      refusal:
        checked.ok && !checked.result.valid
          ? {
              stage: checked.result.stage ?? "rules",
              error: checked.result.error ?? "",
            }
          : null,
      failure: checked.ok ? null : checked.error,
      mounts: [],
      shims: [],
      swallowed: [],
      quiet: [],
      ungranted: missing.ok ? missing.result.permissions : [],
      ungrantedFailure: missing.ok ? null : missing.error,
    };
    if (board.refusal || board.failure) return board;

    const policy = loaded.ask<Policy>("effectivePolicy", {
      manifest,
      host: FIXTURE.host,
    });
    if (!policy.ok) {
      board.failure = policy.error;
      return board;
    }
    const bound = policy.result.mounts;

    const mountedBy = new Map<string, string[]>();
    const shimmedBy = new Map<string, string[]>();
    for (const key of chosen) {
      const own = contribution(loaded, key);
      for (const path of own.mounts) credit(mountedBy, path, key);
      for (const shim of own.shims) credit(shimmedBy, shim, key);

      if (own.mounts.length === 0 && own.shims.length === 0) {
        board.quiet.push({ key, reach: reachOfQuiet(key) });
        continue;
      }
      // A permission whose own paths are all inside a wider mount adds nothing
      // to the list, and a reader who ticked it deserves to be told why.
      const outside = own.mounts.filter((path) => !bound.includes(path));
      if (own.shims.length === 0 && outside.length === own.mounts.length) {
        const inside = covering(own.mounts[0], bound);
        if (inside) board.swallowed.push({ key, inside });
      }
    }

    board.mounts = bound.map((path) => ({
      path,
      by: mountedBy.get(path) ?? [],
      reach: reachOf(path),
    }));
    board.shims = policy.result.shims.map((name) => ({
      name,
      by: shimmedBy.get(name) ?? [],
      reach: reachOfShim(name),
    }));
    return board;
  }

  function count(value: number, one: string, many: string) {
    return `${value} ${value === 1 ? one : many}`;
  }

  const catalogKeys = $derived(permissions.map((permission) => permission.key));
  const read = $derived.by<Manifest | null>(() => {
    try {
      const value = JSON.parse(text) as unknown;
      if (!value || typeof value !== "object" || Array.isArray(value))
        return null;
      return value as Manifest;
    } catch {
      return null;
    }
  });
  const unreadable = $derived.by(() => {
    if (read) return "";
    try {
      JSON.parse(text);
      return "A manifest is an object.";
    } catch (error) {
      return error instanceof Error ? error.message : String(error);
    }
  });
  $effect(() => {
    if (read) lastRead = read;
  });

  const shown = $derived(read ?? lastRead);
  const ticks = $derived(shown ? ticksOf(shown, catalogKeys) : {});
  const chosen = $derived(catalogKeys.filter((key) => ticks[key]));
  /** The permissions the module's own answers put above the rest. */
  const wide = $derived(
    permissions.filter((permission) => weights.get(permission.key)?.wide),
  );

  /** The ticked permissions that open more than the thing they name. */
  const widened = $derived(chosen.filter((key) => weights.get(key)?.wide));
  /** Why this permission opens more than its name says, or nothing. */
  function wider(key: string): string {
    const weighed = weights.get(key);
    return weighed?.wide ? noteOf(weighed) : "";
  }

  const groups = $derived.by(() => {
    const kindOf = (permission: Permission) => weights.get(permission.key)?.kind;
    const rest = permissions.filter(
      (permission) => !weights.get(permission.key)?.wide,
    );
    const broker = rest.filter(
      (permission) => kindOf(permission) === "broker",
    );
    const narrow = rest.filter((permission) => kindOf(permission) !== "broker");
    return [
      {
        title: "Wider than the name says",
        note: "Not a list of the dangerous ones. Each permission here was asked what it binds on its own, and these are the ones whose answer is not a single named thing. Every row further down opens exactly what it says.",
        items: wide,
      },
      {
        title: "Sockets",
        note: "Each one is a socket on the host, bound into the container.",
        items: narrow.filter((permission) =>
          permission.key.startsWith("socket"),
        ),
      },
      {
        title: "Devices",
        note: "Each one is a device node, or a directory of them, under /dev.",
        items: narrow.filter((permission) =>
          permission.key.startsWith("device"),
        ),
      },
      {
        title: "Requests through the broker",
        note: "These bind nothing. Each one puts a command in the container that hands one typed request to the host, which decides what to do with it.",
        items: broker,
      },
      {
        title: "The rest",
        note: "Everything the groups above do not account for.",
        items: narrow.filter(
          (permission) =>
            !permission.key.startsWith("socket") &&
            !permission.key.startsWith("device"),
        ),
      },
    ].filter((group) => group.items.length > 0);
  });

  const board = $derived(
    core && status === "ready" && read ? decide(core, read, chosen) : null,
  );
  const summary = $derived.by(() => {
    if (status === "loading") return "Loading the module that answers this.";
    if (status === "failed")
      return "The module could not be loaded, so nothing here can be answered.";
    if (!read)
      return "The manifest below is not JSON, so there is nothing to ask about yet.";
    if (!board) return "";
    if (board.failure) return `The module could not answer: ${board.failure}`;
    if (board.refusal)
      return `cpak refuses this manifest: ${board.refusal.error}`;
    const line = `${count(chosen.length, "permission", "permissions")} ticked, ${count(
      board.mounts.length,
      "host path",
      "host paths",
    )} bound, ${count(board.shims.length, "broker command", "broker commands")}.`;
    if (widened.length === 0) return line;
    return `${line} Wider than the name says: ${widened.join(", ")}.`;
  });


  $effect(() => {
    const state: BoardStatus = {
      phase: status,
      version: core?.version ?? "",
      error: failure,
      retry: load,
    };
    untrack(() => onstatus(state));
  });
</script>

<div class="@container">
  <div class="grid items-start gap-6 @3xl:grid-cols-2">
    <!-- The question. -->
    <section
      aria-labelledby="asked-heading"
      class="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div class="border-b border-slate-200 px-5 py-4 sm:px-6">
        <h2 id="asked-heading" class="text-lg font-semibold text-gray-900">
          What the manifest asks for
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Nothing is granted by omission, so this list starts at nothing and
          every path on the right is there because a tick put it there.
        </p>
      </div>

      <div class="px-5 py-5 sm:px-6">
        <h3 class="text-sm font-semibold text-gray-900">Start from</h3>
        <div class="mt-2 flex flex-wrap gap-2">
          {#each STARTS as preset}
            <button
              type="button"
              onclick={() => start(preset.keys)}
              disabled={status !== "ready"}
              class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none disabled:cursor-not-allowed disabled:text-gray-400"
            >
              {preset.name}
            </button>
          {/each}
        </div>

        <label class="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={explicit}
            disabled={status !== "ready" || !read}
            onchange={(event) => writeOut(event.currentTarget.checked)}
            class="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-[#3E7BFF] focus:ring-[#3E7BFF]"
          />
          <span class="text-sm leading-6 text-gray-600">
            Write every permission out, the way <code class="font-mono"
              >cpak init</code
            > does. The refusals are then on the page too, and the application gets
            exactly what it got while they were missing.
          </span>
        </label>

        {#if status === "loading"}
          <div class="mt-6 space-y-3" aria-hidden="true">
            {#each Array.from({ length: 10 }) as _, row (row)}
              <div
                class="h-4 max-w-md animate-pulse rounded-full bg-slate-100"
              ></div>
            {/each}
          </div>
        {:else if status === "failed"}
          <p
            class="mt-6 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-gray-600"
          >
            The list of permissions comes from cpak itself, so there is nothing
            to tick until it loads.
          </p>
        {:else}
          {#if wide.length > 0}
            <p
              class="mt-6 rounded-xl bg-yellow-100 p-4 text-sm leading-6 text-yellow-800"
            >
              {wide.length} of these do not open one named thing. Each one binds
              a whole tree, or a bus, or nothing at all because what it changes
              is the container itself. They come first, and each one says what
              makes it wider.
            </p>
          {/if}

          {#if !read}
            <p
              class="mt-4 rounded-xl border border-red-200 bg-red-100 p-4 text-sm leading-6 text-red-700"
            >
              The manifest below is not JSON, so a tick has nowhere to go. Fix
              it, or start again from one of the buttons above. The ticks shown
              are the ones it had last.
            </p>
          {/if}

          {#each groups as group (group.title)}
            <fieldset class="mt-7">
              <legend class="text-base font-semibold text-gray-900"
                >{group.title}</legend
              >
              <p class="mt-1 text-sm text-gray-500">{group.note}</p>
              <ul
                class="mt-3 divide-y divide-slate-200 border-t border-slate-200"
              >
                {#each group.items as permission (permission.key)}
                  <li>
                    <label
                      class="flex items-start gap-3 py-3 {read
                        ? 'cursor-pointer'
                        : 'cursor-not-allowed opacity-60'}"
                    >
                      <input
                        type="checkbox"
                        checked={!!ticks[permission.key]}
                        disabled={!read}
                        onchange={(event) =>
                          toggle(permission.key, event.currentTarget.checked)}
                        class="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-[#3E7BFF] focus:ring-[#3E7BFF]"
                      />
                      <span class="min-w-0">
                        <span
                          class="block font-mono text-sm break-words text-gray-900"
                        >
                          {permission.key}
                        </span>
                        <span
                          class="mt-0.5 block text-sm leading-6 text-gray-500"
                        >
                          {permission.description}
                        </span>
                        {#if wider(permission.key)}
                          <span
                            class="mt-1.5 flex items-start gap-1.5 text-sm leading-6 text-yellow-800"
                          >
                            <span
                              class="material-symbols-outlined mt-0.5 text-[16px] leading-4"
                              aria-hidden="true"
                            >
                              key
                            </span>
                            <span>{wider(permission.key)}</span>
                          </span>
                        {/if}
                      </span>
                    </label>
                  </li>
                {/each}
              </ul>
            </fieldset>
          {/each}
        {/if}
      </div>

      <!-- On a phone the answer is a screen away, so it says here what it says there. -->
      <div
        class="sticky bottom-0 z-10 rounded-b-2xl border-t border-slate-200 bg-white px-5 py-3 sm:px-6 @3xl:hidden"
      >
        <p
          class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm"
        >
          <span class="text-gray-600">{summary}</span>
          <a
            href="#opens"
            class="shrink-0 font-medium text-[#4670EC] hover:underline"
          >
            Read what it opens
          </a>
        </p>
      </div>
    </section>

    <!-- The answer. -->
    <section
      id="opens"
      aria-labelledby="opens-heading"
      class="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm @3xl:sticky @3xl:top-6 @3xl:max-h-[calc(100vh-3rem)] @3xl:overflow-y-auto"
    >
      <div class="border-b border-slate-200 px-5 py-4 sm:px-6">
        <h2 id="opens-heading" class="text-lg font-semibold text-gray-900">
          What it opens on {FIXTURE.id}
        </h2>
        <p class="mt-1 text-sm leading-6 text-gray-500">
          The fixture is {FIXTURE.summary}. It is sent with every question, so
          this is never about the machine you are reading on.
        </p>
        <p aria-live="polite" class="mt-2 text-sm font-medium text-gray-900">
          {summary}
        </p>
      </div>

      <div class="px-5 py-5 sm:px-6">
        {#if status === "loading"}
          <div class="space-y-3" aria-hidden="true">
            {#each Array.from({ length: 6 }) as _, row (row)}
              <div
                class="h-4 max-w-sm animate-pulse rounded-full bg-slate-100"
              ></div>
            {/each}
          </div>
        {:else if status === "failed"}
          <div class="rounded-xl border border-red-200 bg-red-100 p-4">
            <p class="font-medium text-gray-900">Nothing can be answered</p>
            <p class="mt-1 text-sm leading-6 text-gray-600">
              {failure}
            </p>
            <p class="mt-2 text-sm leading-6 text-gray-600">
              Nothing here is guessed, so there is nothing to show until cpak's
              own code is running.
            </p>
          </div>
        {:else if !read}
          <div class="rounded-xl border border-red-200 bg-red-100 p-4">
            <p class="font-medium text-gray-900">The manifest is not JSON</p>
            <p class="mt-1 font-mono text-sm break-words text-gray-900">
              {unreadable}
            </p>
            <p class="mt-2 text-sm leading-6 text-gray-600">
              cpak reads a manifest before it decides anything, so this is as
              far as it gets. Nothing is guessed at in the meantime. The ticks
              the manifest had a moment ago are still on the left, and one of
              the buttons there writes a whole manifest again.
            </p>
          </div>
        {:else if board}
          {#if board.failure}
            <div class="rounded-xl border border-red-200 bg-red-100 p-4">
              <p class="font-medium text-gray-900">
                The module could not answer
              </p>
              <p class="mt-1 text-sm leading-6 text-gray-600">
                {board.failure}
              </p>
            </div>
          {:else if board.refusal}
            <div class="rounded-xl border border-red-200 bg-red-100 p-4">
              <p class="font-medium text-gray-900">
                cpak refuses this manifest
              </p>
              <p class="mt-1 font-mono text-sm break-words text-gray-900">
                {board.refusal.error}
              </p>
              <p class="mt-2 text-sm leading-6 text-gray-600">
                It fails at the {board.refusal.stage} stage, so there is no policy
                to compute and nothing is bound. A manifest cpak refuses never runs.
              </p>
            </div>
          {:else if board.mounts.length === 0 && board.shims.length === 0}
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="font-medium text-gray-900">No host path is bound</p>
              <p class="mt-1 text-sm leading-6 text-gray-600">
                The application sees its own image and nothing of the machine
                underneath. That is what a manifest asking for nothing gets, and
                it is where every manifest starts.
              </p>
            </div>
          {:else}
            <ul class="divide-y divide-slate-200 border-t border-slate-200">
              {#each board.mounts as mount (mount.path)}
                <li class="py-4">
                  <code class="block font-mono text-sm break-all text-gray-900"
                    >{mount.path}</code
                  >
                  <p class="mt-1.5 text-sm leading-6 text-gray-600">
                    {mount.reach}
                  </p>
                  <p class="mt-1.5 text-xs leading-5 text-gray-500">
                    {#if mount.by.length > 0}
                      Bound by <span class="font-mono break-words"
                        >{mount.by.join(", ")}</span
                      >
                    {:else}
                      Bound by the ticked permissions together, not by any one
                      of them alone
                    {/if}
                  </p>
                </li>
              {/each}
            </ul>
          {/if}

          {#if board.shims.length > 0}
            <h3 class="mt-8 text-base font-semibold text-gray-900">
              Commands, not mounts
            </h3>
            <p class="mt-1 text-sm leading-6 text-gray-500">
              These bind nothing. They put a command in the container that
              forwards one typed request to the host broker.
            </p>
            <ul
              class="mt-3 divide-y divide-slate-200 border-t border-slate-200"
            >
              {#each board.shims as shim (shim.name)}
                <li class="py-4">
                  <code class="font-mono text-sm text-gray-900"
                    >{shim.name}</code
                  >
                  <p class="mt-1.5 text-sm leading-6 text-gray-600">
                    {shim.reach}
                  </p>
                  {#if shim.by.length > 0}
                    <p class="mt-1.5 text-xs leading-5 text-gray-500">
                      From <span class="font-mono break-words"
                        >{shim.by.join(", ")}</span
                      >
                    </p>
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}

          {#if board.swallowed.length > 0}
            <h3 class="mt-8 text-base font-semibold text-gray-900">
              Ticked, and already inside
            </h3>
            <ul
              class="mt-3 divide-y divide-slate-200 border-t border-slate-200"
            >
              {#each board.swallowed as absorbed (absorbed.key)}
                <li class="py-4">
                  <code class="font-mono text-sm text-gray-900"
                    >{absorbed.key}</code
                  >
                  <p class="mt-1.5 text-sm leading-6 text-gray-600">
                    What it binds is inside
                    <code class="font-mono break-all">{absorbed.inside}</code>,
                    which is already on the list, so it adds nothing. Untick the
                    wider one and it appears on its own.
                  </p>
                </li>
              {/each}
            </ul>
          {/if}

          {#if board.quiet.length > 0}
            <h3 class="mt-8 text-base font-semibold text-gray-900">
              Ticked, and nothing appears
            </h3>
            <p class="mt-1 text-sm leading-6 text-gray-500">
              A permission that binds no path still changes what the container
              is.
            </p>
            <ul
              class="mt-3 divide-y divide-slate-200 border-t border-slate-200"
            >
              {#each board.quiet as quiet (quiet.key)}
                <li class="py-4">
                  <code class="font-mono text-sm text-gray-900"
                    >{quiet.key}</code
                  >
                  <p class="mt-1.5 text-sm leading-6 text-gray-600">
                    {quiet.reach}
                  </p>
                </li>
              {/each}
            </ul>
          {/if}

          <h3 class="mt-8 text-base font-semibold text-gray-900">
            {#if board.ungrantedFailure}
              What the manifest never mentions
            {:else if board.ungranted.length > 0}
              {count(board.ungranted.length, "permission", "permissions")} this manifest
              never mentions
            {:else}
              This manifest mentions every permission
            {/if}
          </h3>
          {#if board.ungrantedFailure}
            <p class="mt-1 text-sm leading-6 text-gray-600">
              {board.ungrantedFailure}
            </p>
          {:else if board.ungranted.length > 0}
            <p class="mt-1 text-sm leading-6 text-gray-600">
              None of them is granted. A permission written as false and one
              nobody wrote arrive the same way: the application does not have
              it.
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
              {#each board.ungranted as key (key)}
                <code
                  class="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-gray-600"
                >
                  {key}
                </code>
              {/each}
            </div>
          {:else}
            <p class="mt-1 text-sm leading-6 text-gray-600">
              Every permission is written down, most of them as false, and the
              paths above are the same as when they were missing.
            </p>
          {/if}
        {/if}
      </div>
    </section>
  </div>

  <!-- The manifest, which is both what the ticks wrote and something to edit. -->
  <section
    aria-labelledby="manifest-heading"
    class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
  >
    <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
      <h2 id="manifest-heading" class="text-lg font-semibold text-gray-900">
        The manifest these ticks describe
      </h2>
      <p class="text-sm text-gray-500">Edit it and the answers follow.</p>
    </div>
    <p class="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
      This is the file a package would ship. Write a permission in here and it
      ticks above; break the file and cpak refuses it here exactly as it would
      refuse it on a machine.
    </p>
    <label for="manifest" class="sr-only">The manifest, as JSON</label>
    <textarea
      id="manifest"
      bind:value={text}
      rows="16"
      wrap="off"
      spellcheck="false"
      autocapitalize="off"
      aria-invalid={read ? "false" : "true"}
      aria-describedby={read ? undefined : "manifest-error"}
      class="mt-3 w-full resize-y overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-6 text-gray-800 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
    ></textarea>
    {#if !read}
      <p
        id="manifest-error"
        class="mt-2 flex items-start gap-1.5 text-sm leading-6 text-red-700"
      >
        <span class="material-symbols-outlined text-[18px] leading-6"
          >error</span
        >
        <span>{unreadable}</span>
      </p>
    {/if}
  </section>

  <!-- Everything that is explanation rather than answer sits after the board. -->
  <div class="mt-6 grid gap-6 @3xl:grid-cols-2">
    <section
      class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <h2 class="text-lg font-semibold text-gray-900">
        The host these answers are about
      </h2>
      <p class="mt-2 leading-7 text-gray-600">
        A mount resolves against a machine: the user id, the home directory, a
        few environment variables and what is on disk. This page uses one
        written down in full,
        <span class="font-mono text-sm">{FIXTURE.id}</span>, and sends it with
        every question, so two people comparing this page see the same paths.
      </p>
      <ul class="mt-4 space-y-1 text-sm leading-6 text-gray-600">
        {#each FIXTURE.notes as note (note)}
          <li class="flex gap-2">
            <span aria-hidden="true">·</span><span>{note}</span>
          </li>
        {/each}
      </ul>
      <details class="mt-4">
        <summary class="cursor-pointer text-sm font-medium text-[#4670EC]">
          The host, as cpak receives it
        </summary>
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <pre
          role="region"
          aria-label="The fixture host, as JSON"
          tabindex="0"
          class="mt-3 overflow-auto rounded-xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none">{JSON.stringify(
            FIXTURE.host,
            null,
            2,
          )}</pre>
      </details>
    </section>

    <section
      class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <h2 class="text-lg font-semibold text-gray-900">
        What this page does not answer
      </h2>
      <p class="mt-2 leading-7 text-gray-600">
        cpak changes, and last year's mounts would teach you something false, so
        this page pins one build by digest and refuses any other. What a
        permission means here is what it meant in that build.
      </p>
      <p class="mt-3 leading-7 text-gray-600">
        Filesystem access is not here. It names places rather than being on or
        off, and resolves against the directories of whoever runs the
        application: the
        <a
          href="/docs/file-access"
          class="font-medium text-[#4670EC] hover:underline"
        >
          file access reference
        </a>
        covers it, and the
        <a
          href="/learn/play/filesystem"
          class="font-medium text-[#4670EC] hover:underline"
        >
          filesystem board
        </a>
        resolves it the same way this one resolves a socket.
      </p>
    </section>
  </div>
</div>
