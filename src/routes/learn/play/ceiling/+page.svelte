<script lang="ts">
  import { onMount } from "svelte";
  import Seo from "$lib/components/Seo.svelte";
  import CoreStatus from "$lib/components/learn/CoreStatus.svelte";
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
    reaching,
    type Catalog,
    type Override,
    type Policy,
  } from "$lib/learn/policy";

  let core = $state<Core | null>(null);
  let coreState = $state<"loading" | "ready" | "failed">("loading");
  let coreError = $state("");
  let catalog = $state<Catalog>({ permissions: [], aliases: [] });

  let manifestText = $state(CASES[0].manifest);
  let userText = $state(CASES[0].user);
  let ceilingText = $state(CASES[0].ceiling);
  let machineId = $state(CASES[0].machine);

  let policy = $state<Policy | null>(null);
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

  // The module is asked again a moment after typing stops. It answers in the
  // page, so there is nothing to wait for beyond that.
  $effect(() => {
    const current = core;
    const request = {
      manifestText,
      userOverride: user.value ?? null,
      ceiling: ceiling.value ?? null,
      host: machine.host,
    };
    const stopped = blocked;
    if (!current) return;
    if (stopped) {
      policy = null;
      refusal = "";
      return;
    }
    const timer = setTimeout(() => {
      const answer = current.ask<Policy>("effectivePolicy", request);
      if (answer.ok) {
        policy = answer.result;
        refusal = "";
      } else {
        policy = null;
        refusal = answer.error;
      }
    }, 200);
    return () => clearTimeout(timer);
  });

  function start() {
    coreState = "loading";
    coreError = "";
    loadCore()
      .then((loaded) => {
        core = loaded;
        coreState = "ready";
        const answer = loaded.ask<Catalog>("permissionCatalog", {});
        if (answer.ok) catalog = answer.result;
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

  let named = $derived(ceiling.value ? keysOf(ceiling.value) : []);
  let held = $derived(policy?.ceilingHolds ?? []);
  let alsoHeld = $derived(held.filter((key) => !named.includes(key)));
  let families = $derived(reaching(named, catalog));
  let carries = $derived(policy ? granted(policy.effective, catalog) : []);
  let asked = $derived(policy ? granted(policy.requested, catalog) : []);
  let untouched = $derived(carries.filter((key) => !held.includes(key)));
  let filesystem = $derived(policy?.effective.filesystem ?? []);

  // A key can come back narrowed with the same value on both sides: an unset
  // list and an empty one are different to the runtime and the same to a
  // reader. Those are said separately rather than shown as a change.
  let changed = $derived(
    (policy?.narrowed ?? []).filter(
      (key) =>
        show(policy?.requested[key]) !== show(policy?.effective[key]),
    ),
  );
  let formal = $derived(
    (policy?.narrowed ?? []).filter((key) => !changed.includes(key)),
  );
  let closedNothing = $derived(
    policy !== null && named.length > 0 && changed.length === 0,
  );

  function plural(count: number, word: string) {
    return count === 1 ? word : `${word}s`;
  }

  let summary = $derived.by(() => {
    if (coreState === "loading") return "The decision module is loading.";
    if (coreState === "failed") return "The decision module could not load.";
    if (blocked === "empty") return "No manifest yet.";
    if (blocked === "invalid") return "One of the three panes is not JSON.";
    if (refusal) return `The module refused this: ${refusal}`;
    if (!policy) return "";
    const decided =
      policy.source === "user" ? "the owner's override" : "the manifest";
    const ceilingPart =
      named.length === 0
        ? "No ceiling."
        : `The ceiling names ${named.length} ${plural(named.length, "key")} and holds ${held.length}, narrowing ${changed.length}.`;
    return `Decided by ${decided}. ${ceilingPart} The application runs with ${carries.length} ${plural(carries.length, "permission")} and ${policy.mounts.length} ${plural(policy.mounts.length, "mount")}.`;
  });

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

  // A family whose names all reach each other reads differently from one that
  // pulls in a wider key, so it is said differently.
  function widens(family: { WhenAnyOf: string[]; AlsoHold: string[] }) {
    return family.AlsoHold.filter((key) => !family.WhenAnyOf.includes(key));
  }

  function item(value: unknown): string {
    if (value && typeof value === "object") {
      const entry = value as { path?: string; access?: string };
      if (entry.path) return `${entry.path} (${entry.access})`;
      return JSON.stringify(value);
    }
    return String(value);
  }
</script>

<Seo
  title="The ceiling board - cpak"
  description="Run cpak's own decision logic on a manifest, an owner override and an administrator ceiling, and see the permissions and mounts that follow."
  path="/learn/play/ceiling"
/>

<div class="mx-auto max-w-7xl px-6 py-12 sm:py-16">
  <a
    href="/docs/managed-deployment"
    class="text-sm font-medium text-[#4670EC] hover:underline"
  >
    Managed deployment
  </a>
  <h1 class="mt-5 text-4xl font-extrabold tracking-tight text-gray-900">
    The ceiling board
  </h1>
  <p class="mt-4 max-w-3xl text-lg leading-8 text-gray-600">
    Three parties decide what an application may do. The manifest asks. An
    override written by the owner of the installation replaces that request
    outright. The administrator's ceiling then narrows whatever survived, and
    can never widen it. Edit any of the three and the answer below is recomputed
    by cpak itself.
  </p>

  <div class="mt-8">
    <CoreStatus
      state={coreState}
      version={core?.version ?? ""}
      error={coreError}
      onretry={start}
    />
  </div>

  <section aria-labelledby="cases" class="mt-10">
    <h2 id="cases" class="text-sm font-semibold text-gray-900">
      Start from a case
    </h2>
    <div class="mt-3 flex flex-wrap gap-2">
      {#each CASES as entry}
        <button
          type="button"
          onclick={() => apply(entry)}
          aria-pressed={worked?.id === entry.id}
          class={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            worked?.id === entry.id
              ? "border-[#3E7BFF] bg-[#3E7BFF]/10 text-[#3158c7]"
              : "border-slate-200 bg-white text-gray-700 hover:bg-slate-100"
          }`}
        >
          {entry.label}
        </button>
      {/each}
    </div>
    <p class="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
      {worked
        ? worked.lesson
        : "Your own case. The three panes below are yours to change, and every answer comes from the module."}
    </p>
  </section>

  <section aria-labelledby="inputs" class="mt-6">
    <h2 id="inputs" class="sr-only">The three inputs</h2>
    <div class="grid gap-4 lg:grid-cols-3">
      <JsonPane
        id="manifest"
        label="The manifest"
        note="What the package asks for. A permission it does not name is not granted."
        rows={18}
        bind:value={manifestText}
        error={manifest.error ?? ""}
      />
      <JsonPane
        id="user"
        label="The owner's override"
        note="What the person who installed it decided. It replaces the manifest request rather than adding to it."
        empty="Empty: no override written, so the manifest request stands."
        rows={18}
        bind:value={userText}
        error={user.error ?? ""}
        onclear={() => (userText = "")}
      />
      <JsonPane
        id="ceiling"
        label="The administrator's ceiling"
        note="The widest policy this host permits. It decides only the keys it writes, and writing true is not a grant."
        empty="Empty: no ceiling on this host, so nothing narrows the policy."
        rows={18}
        bind:value={ceilingText}
        error={ceiling.error ?? ""}
        onclear={() => (ceilingText = "")}
      />
    </div>
  </section>

  <section class="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
    <fieldset>
      <legend class="text-sm font-semibold text-gray-900">
        The machine this is computed for
      </legend>
      <p class="mt-1 max-w-3xl text-xs leading-5 text-gray-500">
        A mount is made against a real host: the user id, the home directory, a
        few environment variables and what is actually there. The host is
        written down here rather than read from your computer.
      </p>
      <div class="mt-3 flex flex-wrap gap-4">
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
            <label for={`machine-${entry.id}`} class="text-sm text-gray-800">
              {entry.label}
            </label>
          </div>
        {/each}
      </div>
      <p class="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
        {machine.note}
      </p>
      <details class="mt-3">
        <summary
          class="cursor-pointer text-sm font-medium text-[#4670EC] hover:underline"
        >
          What this host reports
        </summary>
        <pre
          class="mt-2 max-h-56 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-gray-800">{format(
            machine.host,
          )}</pre>
      </details>
    </fieldset>
  </section>

  <section aria-labelledby="answer" class="mt-12">
    <h2 id="answer" class="text-2xl font-semibold text-gray-900">What runs</h2>
    <p class="sr-only" aria-live="polite">{summary}</p>

    {#if coreState === "loading"}
      <div
        class="mt-4 animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
      >
        <div class="h-4 w-52 rounded bg-slate-100"></div>
        <div class="mt-4 h-3 w-full rounded bg-slate-100"></div>
        <div class="mt-2 h-3 w-2/3 rounded bg-slate-100"></div>
      </div>
    {:else if coreState === "failed"}
      <p class="mt-4 text-sm leading-6 text-gray-600">
        Nothing can be answered until the module loads.
      </p>
    {:else if blocked === "empty"}
      <p class="mt-4 max-w-3xl text-sm leading-6 text-gray-600">
        The manifest pane is empty. Write a manifest, or pick one of the cases
        above, and the effective policy appears here.
      </p>
    {:else if blocked === "invalid"}
      <p class="mt-4 max-w-3xl text-sm leading-6 text-gray-600">
        One of the panes above is not JSON yet. The answer is held back until it
        is, because a half-typed policy is not a policy.
      </p>
    {:else if refusal}
      <div class="mt-4 rounded-2xl border border-red-200 bg-red-100 p-5">
        <p class="text-sm font-semibold text-red-700">cpak refused this input</p>
        <p class="mt-1 font-mono text-sm break-words text-red-700">{refusal}</p>
        <p class="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
          This is the runtime's own answer, in its own words. A manifest that
          does not validate never reaches the ceiling.
        </p>
      </div>
    {:else if policy}
      <div class="mt-4 grid gap-4 lg:grid-cols-3">
        <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
          <p
            class="text-xs font-semibold tracking-wider text-gray-500 uppercase"
          >
            Asked for
          </p>
          <p class="mt-2 text-3xl font-bold text-gray-900">{asked.length}</p>
          <p class="mt-1 text-sm leading-6 text-gray-600">
            {policy.source === "user"
              ? "permissions, by the owner's override. The manifest request was replaced, not added to."
              : "permissions, by the manifest. No owner override was written."}
          </p>
        </div>
        <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
          <p
            class="text-xs font-semibold tracking-wider text-gray-500 uppercase"
          >
            Ceiling
          </p>
          <p class="mt-2 text-3xl font-bold text-gray-900">
            {named.length === 0 ? "none" : `${named.length} named`}
          </p>
          <p class="mt-1 text-sm leading-6 text-gray-600">
            {named.length === 0
              ? "This host is unmanaged, so the policy above stands as it is."
              : `Held to ${held.length} ${plural(held.length, "key")} once the names that reach the same thing are counted. ${changed.length} ${plural(changed.length, "permission")} changed.`}
          </p>
        </div>
        <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
          <p
            class="text-xs font-semibold tracking-wider text-gray-500 uppercase"
          >
            Runs with
          </p>
          <p class="mt-2 text-3xl font-bold text-gray-900">{carries.length}</p>
          <p class="mt-1 text-sm leading-6 text-gray-600">
            permissions, {policy.mounts.length}
            {plural(policy.mounts.length, "mount")} and {policy.shims.length}
            {plural(policy.shims.length, "shim")}.
          </p>
        </div>
      </div>

      {#if closedNothing}
        <div class="mt-4 rounded-2xl border border-red-200 bg-red-100 p-5">
          <p class="text-sm font-semibold text-red-700">
            This ceiling closed nothing
          </p>
          <p class="mt-1 max-w-3xl text-sm leading-6 text-gray-600">
            It names {named.join(", ")}, and everything it names was already
            within it. A ceiling narrows only what it names, so the application
            runs with exactly what it asked for.
          </p>
        </div>
      {/if}

      <div class="mt-4 grid gap-4 lg:grid-cols-2">
        <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="text-lg font-semibold text-gray-900">
            What the ceiling reaches
          </h3>
          {#if named.length === 0}
            <p class="mt-2 text-sm leading-6 text-gray-600">
              No ceiling is written, so nothing here is held. Every permission
              beside this is the one that was asked for.
            </p>
          {:else}
            <p class="mt-2 text-sm leading-6 text-gray-600">
              A ceiling decides only the keys it writes. These are the ones it
              wrote:
            </p>
            <ul class="mt-2 flex flex-wrap gap-2">
              {#each named as key}
                <li
                  class="rounded-full border border-[#3E7BFF]/40 bg-[#3E7BFF]/10 px-3 py-1 font-mono text-xs text-[#3158c7]"
                  title={describe(key, catalog)}
                >
                  {key}
                </li>
              {/each}
            </ul>
            {#if alsoHeld.length > 0}
              <p class="mt-4 text-sm leading-6 text-gray-600">
                These are held with them, because they reach the same places
                under another name. A ceiling that named one and left the rest
                would close nothing:
              </p>
              <ul class="mt-2 flex flex-wrap gap-2">
                {#each alsoHeld as key}
                  <li
                    class="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 font-mono text-xs text-gray-700"
                    title={describe(key, catalog)}
                  >
                    {key}
                  </li>
                {/each}
              </ul>
              <ul class="mt-3 space-y-1">
                {#each families as family}
                  <li class="text-xs leading-5 text-gray-500">
                    {#if widens(family).length === 0}
                      <span class="font-mono">{family.AlsoHold.join(", ")}</span
                      > open the same thing, so naming one of them holds all of
                      them.
                    {:else}
                      Naming any of
                      <span class="font-mono">{family.WhenAnyOf.join(", ")}</span
                      > also holds
                      <span class="font-mono">{widens(family).join(", ")}</span
                      >, which would otherwise grant them again.
                    {/if}
                  </li>
                {/each}
              </ul>
            {/if}
            {#if untouched.length > 0}
              <p class="mt-4 text-sm leading-6 text-gray-600">
                It says nothing about these, so the application keeps whatever
                the manifest and the owner agreed on:
              </p>
              <ul class="mt-2 flex flex-wrap gap-2">
                {#each untouched as key}
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
          <h3 class="text-lg font-semibold text-gray-900">What changed</h3>
          {#if changed.length === 0}
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
              <table class="w-full min-w-[28rem] text-left text-sm">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-3 py-2 font-semibold text-gray-900">
                      Permission
                    </th>
                    <th class="px-3 py-2 font-semibold text-gray-900">
                      Asked for
                    </th>
                    <th class="px-3 py-2 font-semibold text-gray-900">Runs</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  {#each changed as key}
                    <tr>
                      <td class="px-3 py-2 font-mono text-xs text-gray-800">
                        {key}
                      </td>
                      <td class="px-3 py-2 text-xs text-gray-600">
                        {show(policy.requested[key])}
                      </td>
                      <td class="px-3 py-2 text-xs text-gray-900">
                        {show(policy.effective[key])}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
          {#if formal.length > 0}
            <p class="mt-3 text-xs leading-5 text-gray-500">
              The ceiling also reached
              <span class="font-mono">{formal.join(", ")}</span>, which was
              empty on both sides. Nothing about it changed.
            </p>
          {/if}
        </div>
      </div>

      <div class="mt-4 grid gap-4 lg:grid-cols-2">
        <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="text-lg font-semibold text-gray-900">
            The permissions it runs with
          </h3>
          {#if carries.length === 0}
            <p class="mt-2 text-sm leading-6 text-gray-600">
              None. The application starts with no access to the host at all.
            </p>
          {:else}
            <ul class="mt-3 flex flex-wrap gap-2">
              {#each carries as key}
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
                <li class="font-mono text-xs text-gray-800">
                  {grant.path} ({grant.access})
                </li>
              {/each}
            </ul>
          {/if}
        </div>

        <div class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 class="text-lg font-semibold text-gray-900">
            What that mounts here
          </h3>
          <p class="mt-2 text-sm leading-6 text-gray-600">
            The paths this policy binds into the namespace on the host above. A
            permission is not a flag consulted later: it is one of these.
          </p>
          <div class="mt-3">
            <Lines
              label="Mounts"
              items={policy.mounts}
              empty="This policy mounts nothing."
            />
          </div>
          <h4 class="mt-5 text-sm font-semibold text-gray-900">Broker shims</h4>
          <p class="mt-1 text-sm leading-6 text-gray-600">
            Commands the container gets instead of the host programs they are
            named after. Nothing is exposed: the request is forwarded.
          </p>
          <div class="mt-3">
            <Lines
              label="Broker shims"
              items={policy.shims}
              empty="No shims: this policy forwards nothing to the host."
              height="max-h-40"
            />
          </div>
          <p class="mt-4 text-xs leading-5 text-gray-500">
            The filesystem grants are not in this list. They are resolved
            against the real home directory when the container is built, which
            is a machine this page does not have.
          </p>
        </div>
      </div>
    {/if}
  </section>

  <section class="mt-12 border-t border-slate-200 pt-8">
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
        class="font-medium text-[#4670EC] hover:underline"
        >managed deployment</a
      >
      and
      <a href="/docs/permissions" class="font-medium text-[#4670EC] hover:underline"
        >permissions</a
      >.
    </p>
  </section>
</div>
