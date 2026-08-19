<script lang="ts">
  // One editable input of a board. The line under the box says what the box
  // currently means, or why it cannot mean anything yet, so a reader never has
  // to look elsewhere to find out whether their typing was understood.
  let {
    id,
    label,
    note,
    state = "",
    rows = 10,
    value = $bindable(""),
    error = "",
    onclear = null,
  }: {
    id: string;
    label: string;
    note: string;
    state?: string;
    rows?: number;
    value?: string;
    error?: string;
    onclear?: (() => void) | null;
  } = $props();

  let described = $derived(error ? `${id}-note ${id}-state` : `${id}-note`);
</script>

<div class="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white">
  <div
    class="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3"
  >
    <div class="min-w-0">
      <label for={id} class="block text-sm font-semibold text-gray-900"
        >{label}</label
      >
      <p id={`${id}-note`} class="mt-0.5 text-xs leading-5 text-gray-500">
        {note}
      </p>
    </div>
    {#if onclear && value.trim() !== ""}
      <button
        type="button"
        onclick={onclear}
        class="shrink-0 rounded-full px-2 py-1 text-xs font-medium text-gray-500 hover:bg-slate-100 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
      >
        Clear
      </button>
    {/if}
  </div>

  <div class="flex min-w-0 flex-1 flex-col p-3">
    <textarea
      {id}
      {rows}
      bind:value
      spellcheck="false"
      autocapitalize="off"
      autocomplete="off"
      aria-describedby={described}
      aria-invalid={error ? "true" : "false"}
      class="w-full flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-5 text-gray-800 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
    ></textarea>
    <p
      id={`${id}-state`}
      class={`mt-2 flex items-start gap-1.5 text-xs leading-5 ${
        error ? "text-red-600" : "text-gray-500"
      }`}
    >
      {#if error}
        <span class="material-symbols-outlined text-[16px] leading-5"
          >error</span
        >
        <span>Not JSON yet: {error}</span>
      {:else}
        <span>{state}</span>
      {/if}
    </p>
  </div>
</div>
