<script lang="ts">
  let {
    id,
    label,
    note,
    empty = "",
    rows = 12,
    value = $bindable(""),
    error = "",
    onclear = () => {},
  }: {
    id: string;
    label: string;
    note: string;
    empty?: string;
    rows?: number;
    value?: string;
    error?: string;
    onclear?: () => void;
  } = $props();

  let described = $derived(error ? `${id}-note ${id}-error` : `${id}-note`);
</script>

<div class="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
  <div class="flex items-start justify-between gap-3">
    <label for={id} class="text-sm font-semibold text-gray-900">{label}</label>
    {#if empty && value.trim() !== ""}
      <button
        type="button"
        onclick={onclear}
        class="shrink-0 rounded-full px-2 py-1 text-xs font-medium text-gray-500 hover:bg-slate-100 hover:text-gray-900"
      >
        Clear
      </button>
    {/if}
  </div>
  <p id={`${id}-note`} class="mt-1 text-xs leading-5 text-gray-500">{note}</p>
  <textarea
    {id}
    {rows}
    bind:value
    spellcheck="false"
    autocapitalize="off"
    aria-describedby={described}
    aria-invalid={error ? "true" : "false"}
    class="mt-3 w-full flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-5 text-gray-800 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
  ></textarea>
  {#if error}
    <p
      id={`${id}-error`}
      class="mt-2 flex items-start gap-1.5 text-xs leading-5 text-red-600"
    >
      <span class="material-symbols-outlined text-[16px] leading-5">error</span>
      <span>{error}</span>
    </p>
  {:else if empty && value.trim() === ""}
    <p class="mt-2 text-xs leading-5 text-gray-500">{empty}</p>
  {/if}
</div>
