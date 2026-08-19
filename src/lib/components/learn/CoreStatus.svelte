<script lang="ts">
  import { CORE_MODULE } from "$lib/learn/core";

  let {
    state,
    version = "",
    error = "",
    onretry = () => {},
  }: {
    state: "loading" | "ready" | "failed";
    version?: string;
    error?: string;
    onretry?: () => void;
  } = $props();

  const megabytes = (CORE_MODULE.bytes / 1024 / 1024).toFixed(1);
  let digest = $derived(`${CORE_MODULE.digest.slice(0, 12)}…`);
</script>

<div
  class="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm"
  role="status"
  aria-live="polite"
>
  {#if state === "loading"}
    <p class="flex items-center gap-2 font-medium text-gray-900">
      <span class="material-symbols-outlined animate-spin text-[18px]"
        >progress_activity</span
      >
      Loading the cpak decision module, {megabytes} MB.
    </p>
    <p class="mt-1 text-gray-600">
      The page checks it against the digest it was built with before running it.
    </p>
  {:else if state === "ready"}
    <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-600">
      <span class="material-symbols-outlined text-[18px] text-[#3E7BFF]"
        >verified</span
      >
      <span class="font-medium text-gray-900">
        Answered by cpak {version}
      </span>
      <span>
        running here, from the build
        <code class="font-mono text-xs">{digest}</code>. Nothing is sent
        anywhere.
      </span>
    </p>
  {:else}
    <p class="flex items-start gap-2 font-medium text-red-600">
      <span class="material-symbols-outlined text-[18px]">error</span>
      <span>{error || "The decision module could not be loaded."}</span>
    </p>
    <p class="mt-1 text-gray-600">
      Nothing on this page can be answered without it, so the boards below stay
      empty.
    </p>
    <button
      type="button"
      onclick={onretry}
      class="mt-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-slate-100"
    >
      Try again
    </button>
  {/if}
</div>
