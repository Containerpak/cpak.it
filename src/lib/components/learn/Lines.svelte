<script lang="ts">
  // A list of paths or commands. It scrolls inside itself, in both directions,
  // because a mount list is wide and a page that scrolls sideways is broken.
  let {
    label,
    items,
    empty,
    height = "max-h-56",
  }: {
    label: string;
    items: string[];
    empty: string;
    height?: string;
  } = $props();
</script>

{#if items.length === 0}
  <p class="text-sm text-gray-500">{empty}</p>
{:else}
  <!-- A region that scrolls has to be reachable from the keyboard. -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    role="region"
    aria-label={label}
    tabindex="0"
    class={`${height} min-w-0 overflow-auto rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none`}
  >
    <ul class="w-max min-w-full divide-y divide-slate-200">
      {#each items as item}
        <li class="px-3 py-2 font-mono text-xs whitespace-nowrap text-gray-800">
          {item}
        </li>
      {/each}
    </ul>
  </div>
{/if}
