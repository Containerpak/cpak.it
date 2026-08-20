<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { CoreError, loadCore, type Core } from "$lib/learn/core";
  import type { PlaygroundStatus } from "$lib/learn/playgrounds";
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
    type Manifest,
  } from "$lib/learn/play/permissions/fixture";

  type TranscriptLine = {
    text: string;
    tone: "command" | "answer" | "error" | "muted";
  };

  const STARTING_PERMISSIONS = [
    "socketWayland",
    "socketPulseAudio",
    "notification",
    "openURI",
    "network",
  ];

  let { onstatus = () => {} }: { onstatus?: (state: PlaygroundStatus) => void } =
    $props();

  let core = $state<Core | null>(null);
  let status = $state<"loading" | "ready" | "failed">("loading");
  let failure = $state("");
  let permissions = $state<Permission[]>([]);
  let command = $state("");
  let text = $state(startingManifest());
  let transcript = $state<TranscriptLine[]>([
    { text: "$ cpak validate", tone: "command" },
    { text: "Loading cpak's decision module...", tone: "muted" },
  ]);

  onMount(load);

  async function load() {
    status = "loading";
    failure = "";
    try {
      const loaded = await loadCore();
      const answer = loaded.ask<Catalog>("permissionCatalog", {});
      if (!answer.ok) throw new CoreError("start", answer.error);
      core = loaded;
      permissions = answer.result.permissions.filter(
        (permission) => permission.stated,
      );
      status = "ready";
      transcript = [
        { text: "$ cpak validate", tone: "command" },
        { text: "cpak.json is valid.", tone: "answer" },
      ];
    } catch (error) {
      failure = error instanceof Error ? error.message : String(error);
      status = "failed";
      transcript = [
        { text: "$ cpak validate", tone: "command" },
        { text: failure, tone: "error" },
      ];
    }
  }

  function startingManifest(): string {
    const ticks = Object.fromEntries(
      STARTING_PERMISSIONS.map((permission) => [permission, true]),
    );
    return format(manifestFor(STARTING_PERMISSIONS, ticks, false));
  }

  const manifest = $derived.by<Manifest | null>(() => {
    try {
      const value = JSON.parse(text) as unknown;
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
      }
      return value as Manifest;
    } catch {
      return null;
    }
  });

  const parseError = $derived.by(() => {
    if (manifest) return "";
    try {
      const value = JSON.parse(text) as unknown;
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return "cpak.json must contain one JSON object.";
      }
      return "";
    } catch (error) {
      return error instanceof Error ? error.message : String(error);
    }
  });

  const validation = $derived.by<Validation | null>(() => {
    if (!core || status !== "ready" || !manifest) return null;
    const answer = core.ask<Validation>("validateManifest", { manifest });
    if (!answer.ok) {
      return {
        valid: false,
        manifestVersion: "",
        legacyFields: [],
        stage: "rules",
        error: answer.error,
      };
    }
    return answer.result;
  });

  const policy = $derived.by<Policy | null>(() => {
    if (!core || !manifest || !validation?.valid) return null;
    const answer = core.ask<Policy>("effectivePolicy", {
      manifest,
      host: FIXTURE.host,
    });
    return answer.ok ? answer.result : null;
  });

  const ungranted = $derived.by<string[]>(() => {
    if (!core || !manifest || !validation?.valid) return [];
    const answer = core.ask<{ permissions: string[] }>(
      "ungrantedPermissions",
      { manifest },
    );
    return answer.ok ? answer.result.permissions : [];
  });

  const requested = $derived.by(() => {
    if (!policy) return [];
    return permissions
      .filter((permission) => policy.requested[permission.key] === true)
      .map((permission) => permission.key);
  });

  function submit(event: SubmitEvent) {
    event.preventDefault();
    const entered = command.trim();
    if (!entered) return;
    run(entered);
    command = "";
  }

  function run(entered: string) {
    const next: TranscriptLine[] = [
      ...transcript,
      { text: `$ ${entered}`, tone: "command" },
    ];

    if (entered === "clear") {
      transcript = [];
      return;
    }
    if (entered === "help") {
      transcript = [
        ...next,
        { text: "cpak init", tone: "answer" },
        { text: "cpak validate", tone: "answer" },
        { text: "cat cpak.json", tone: "answer" },
        { text: "clear", tone: "answer" },
      ];
      return;
    }
    if (entered === "cpak init") {
      text = startingManifest();
      transcript = [
        ...next,
        { text: "Created cpak.json in the browser workspace.", tone: "answer" },
      ];
      return;
    }
    if (entered === "cat cpak.json") {
      transcript = [
        ...next,
        ...text.split("\n").map(
          (line): TranscriptLine => ({ text: line, tone: "answer" }),
        ),
      ];
      return;
    }
    if (entered === "cpak validate") {
      if (!manifest) {
        transcript = [
          ...next,
          { text: parseError || "cpak.json is not valid JSON.", tone: "error" },
        ];
        return;
      }
      if (!validation?.valid) {
        transcript = [
          ...next,
          {
            text: validation?.error || "cpak refused this manifest.",
            tone: "error",
          },
        ];
        return;
      }
      transcript = [
        ...next,
        {
          text: `cpak.json is valid for manifest ${validation.manifestVersion}.`,
          tone: "answer",
        },
      ];
      return;
    }
    transcript = [
      ...next,
      {
        text: "That command is not available in this browser workspace. Run help.",
        tone: "error",
      },
    ];
  }

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

<div class="@container">
  <section
    aria-labelledby="workspace-heading"
    class="overflow-hidden rounded-2xl border border-slate-300 bg-slate-950 shadow-sm"
  >
    <header class="border-b border-slate-800 px-4 py-3 sm:px-5">
      <div>
        <h2 id="workspace-heading" class="font-semibold text-white">
          Package workspace
        </h2>
        <p class="mt-0.5 text-xs text-slate-400">
          Edit the manifest, then validate it without leaving the browser.
        </p>
      </div>
    </header>

    <div class="grid min-h-[34rem] @4xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
      <div class="min-w-0 border-b border-slate-800 @4xl:border-r @4xl:border-b-0">
        <div
          class="flex h-10 items-center border-b border-slate-800 bg-slate-900 px-4"
        >
          <span class="font-mono text-xs text-slate-200">cpak.json</span>
          {#if !manifest}
            <span class="ml-auto text-xs text-red-300">JSON error</span>
          {:else if validation && !validation.valid}
            <span class="ml-auto text-xs text-amber-300">Refused</span>
          {:else if validation?.valid}
            <span class="ml-auto text-xs text-emerald-300">Valid</span>
          {/if}
        </div>
        <label for="permissions-manifest" class="sr-only">cpak manifest</label>
        <textarea
          id="permissions-manifest"
          bind:value={text}
          rows="24"
          wrap="off"
          spellcheck="false"
          autocapitalize="off"
          class="block min-h-[32rem] w-full resize-y border-0 bg-slate-950 p-4 font-mono text-[13px] leading-6 text-slate-100 focus:ring-0 focus:outline-none sm:p-5"
        ></textarea>
      </div>

      <aside class="min-w-0 bg-slate-900/70" aria-live="polite">
        <div class="border-b border-slate-800 px-4 py-3 sm:px-5">
          <h3 class="text-sm font-semibold text-white">What cpak decides</h3>
          <p class="mt-1 text-xs leading-5 text-slate-400">
            {FIXTURE.summary}. The browser sends this manifest to cpak's pinned WebAssembly core.
          </p>
        </div>

        <div class="space-y-6 px-4 py-5 sm:px-5">
          {#if status === "loading"}
            <p class="text-sm text-slate-400">Loading the decision module...</p>
          {:else if status === "failed"}
            <div>
              <p class="text-sm font-semibold text-red-300">The core did not start</p>
              <p class="mt-1 font-mono text-xs leading-5 text-slate-300">{failure}</p>
            </div>
          {:else if !manifest}
            <div>
              <p class="text-sm font-semibold text-red-300">cpak.json is not readable</p>
              <p class="mt-1 font-mono text-xs leading-5 text-slate-300">{parseError}</p>
            </div>
          {:else if validation && !validation.valid}
            <div>
              <p class="text-sm font-semibold text-amber-300">cpak refuses this manifest</p>
              <p class="mt-1 font-mono text-xs leading-5 text-slate-300">
                {validation.error || "The manifest failed validation."}
              </p>
            </div>
          {:else if policy}
            <div>
              <p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                Requested permissions
              </p>
              {#if requested.length > 0}
                <div class="mt-2 flex flex-wrap gap-1.5">
                  {#each requested as permission (permission)}
                    <code class="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-200">
                      {permission}
                    </code>
                  {/each}
                </div>
              {:else}
                <p class="mt-2 text-sm text-slate-300">None.</p>
              {/if}
            </div>

            <div>
              <p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                Host paths
              </p>
              {#if policy.mounts.length > 0}
                <ul class="mt-2 space-y-2">
                  {#each policy.mounts as path (path)}
                    <li class="font-mono text-xs break-all text-slate-200">{path}</li>
                  {/each}
                </ul>
              {:else}
                <p class="mt-2 text-sm text-slate-300">No host path is bound.</p>
              {/if}
            </div>

            {#if policy.shims.length > 0}
              <div>
                <p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Broker commands
                </p>
                <ul class="mt-2 space-y-2">
                  {#each policy.shims as shim (shim)}
                    <li class="font-mono text-xs text-slate-200">{shim}</li>
                  {/each}
                </ul>
              </div>
            {/if}

            <details class="border-t border-slate-800 pt-4">
              <summary class="cursor-pointer text-sm font-medium text-slate-200">
                {ungranted.length} permissions were not requested
              </summary>
              <div class="mt-3 columns-2 gap-4">
                {#each ungranted as permission (permission)}
                  <code class="block break-inside-avoid text-[11px] leading-5 text-slate-500">
                    {permission}
                  </code>
                {/each}
              </div>
            </details>
          {/if}
        </div>
      </aside>
    </div>

    <div class="border-t border-slate-800 bg-[#090d18]">
      <div class="max-h-56 overflow-y-auto px-4 py-4 font-mono text-xs leading-6 sm:px-5">
        {#each transcript as line, index (`${index}-${line.text}`)}
          <div
            class={line.tone === "command"
              ? "text-slate-100"
              : line.tone === "error"
                ? "text-red-300"
                : line.tone === "muted"
                  ? "text-slate-500"
                  : "text-emerald-300"}
          >{line.text || " "}</div>
        {/each}
      </div>
      <form onsubmit={submit} class="relative flex items-center border-t border-slate-800 px-4 sm:px-5">
        <span class="font-mono text-sm text-[#7DA2FF]" aria-hidden="true">$</span>
        <label for="playground-command" class="sr-only">Run a command</label>
        <input
          id="playground-command"
          bind:value={command}
          autocomplete="off"
          spellcheck="false"
          placeholder="help"
          class="min-w-0 flex-1 border-0 bg-transparent px-3 py-3 pr-24 font-mono text-sm text-white placeholder:text-slate-600 focus:ring-0 focus:outline-none"
        />
        <span class="pointer-events-none absolute right-5 hidden text-xs text-slate-600 sm:inline">Enter to run</span>
      </form>
    </div>
  </section>

  <details class="mt-5 rounded-2xl border border-slate-200 bg-white px-5 py-4">
    <summary class="cursor-pointer font-semibold text-gray-900">
      Permission names available in this build
    </summary>
    <p class="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
      Add a key under <code>override</code>, save nothing, and watch the result above change immediately.
    </p>
    <dl class="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {#each permissions as permission (permission.key)}
        <div>
          <dt class="font-mono text-sm text-gray-900">{permission.key}</dt>
          <dd class="mt-1 text-sm leading-6 text-gray-600">{permission.description}</dd>
        </div>
      {/each}
    </dl>
  </details>
</div>
