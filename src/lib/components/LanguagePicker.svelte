<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import {
    getLocale,
    setLocale,
    type Locale,
  } from "$lib/paraglide/runtime.js";

  const options: { value: Locale; label: string; short: string }[] = [
    { value: "en", label: "English", short: "EN" },
    { value: "it", label: "Italiano", short: "IT" },
    { value: "es", label: "Español", short: "ES" },
  ];

  let menu: HTMLDetailsElement;
  let locale = getLocale();

  function select(value: Locale) {
    if (value === locale) {
      menu.open = false;
      return;
    }
    setLocale(value);
  }

  $: current = options.find((option) => option.value === locale) ?? options[0];
</script>

<details bind:this={menu} class="language-picker relative">
  <summary
    class="language-trigger flex h-10 min-w-10 cursor-pointer list-none items-center justify-center rounded-full px-2 text-sm font-semibold transition hover:shadow-sm"
    aria-label={m.language_menu({ language: current.label })}
    title={m.language_menu({ language: current.label })}
  >
    {current.short}
  </summary>

  <div
    class="language-popover absolute top-12 right-0 z-50 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
  >
    {#each options as option}
      <button
        type="button"
        on:click={() => select(option.value)}
        lang={option.value}
        aria-current={locale === option.value ? "true" : undefined}
        class:language-option-selected={locale === option.value}
        class="language-option flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition"
      >
        <span class="flex-1">{option.label}</span>
        {#if locale === option.value}
          <span class="material-symbols-outlined text-[18px]">check</span>
        {/if}
      </button>
    {/each}
  </div>
</details>

<style>
  .language-trigger,
  .language-option {
    color: #374151;
  }

  .language-option:hover {
    background: #f1f5f9;
  }

  .language-option-selected {
    color: #3568d1;
    font-weight: 600;
  }

  :global(html[data-theme="dark"]) .language-trigger,
  :global(html[data-theme="dark"]) .language-option {
    color: #e2e8f0;
  }

  :global(html[data-theme="dark"]) .language-option:hover {
    background: #1e293b;
  }

  :global(html[data-theme="dark"]) .language-option-selected {
    color: #8aa8ff;
  }
</style>
