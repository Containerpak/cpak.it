<script lang="ts">
  import { onMount } from "svelte";
  import * as m from "$lib/paraglide/messages.js";

  type ThemePreference = "system" | "light" | "dark";

  const options: { value: ThemePreference; label: string; icon: string }[] = [
    { value: "system", label: m.theme_system(), icon: "brightness_auto" },
    { value: "light", label: m.theme_light(), icon: "light_mode" },
    { value: "dark", label: m.theme_dark(), icon: "dark_mode" },
  ];

  let preference: ThemePreference = "system";
  let menu: HTMLDetailsElement;
  let media: MediaQueryList;

  function resolvedTheme(value: ThemePreference) {
    if (value !== "system") return value;
    return media.matches ? "dark" : "light";
  }

  function apply(value: ThemePreference, persist = true) {
    preference = value;
    const theme = resolvedTheme(value);
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.themePreference = value;
    document.documentElement.style.colorScheme = theme;
    if (persist) localStorage.setItem("cpak-theme", value);
  }

  function select(value: ThemePreference) {
    apply(value);
    menu.open = false;
  }

  onMount(() => {
    media = window.matchMedia("(prefers-color-scheme: dark)");
    const stored = localStorage.getItem("cpak-theme");
    preference = stored === "light" || stored === "dark" ? stored : "system";
    apply(preference, false);

    const handleSystemChange = () => {
      if (preference === "system") apply("system", false);
    };

    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  });

  $: current =
    options.find((option) => option.value === preference) ?? options[0];
</script>

<details bind:this={menu} class="theme-picker relative">
  <summary
    class="theme-trigger flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full transition hover:shadow-sm"
    aria-label={m.theme_menu({ theme: current.label })}
    title={m.theme_menu({ theme: current.label })}
  >
    <span class="material-symbols-outlined text-[21px]">{current.icon}</span>
  </summary>

  <div
    class="theme-popover absolute top-12 right-0 z-50 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
  >
    {#each options as option}
      <button
        type="button"
        on:click={() => select(option.value)}
        aria-current={preference === option.value ? "true" : undefined}
        class:theme-option-selected={preference === option.value}
        class="theme-option flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition"
      >
        <span class="material-symbols-outlined text-[20px]">{option.icon}</span>
        <span class="flex-1">{option.label}</span>
        {#if preference === option.value}
          <span class="material-symbols-outlined text-[18px]">check</span>
        {/if}
      </button>
    {/each}
  </div>
</details>

<style>
  .theme-trigger,
  .theme-option {
    color: #374151;
  }

  .theme-option:hover {
    background: #f1f5f9;
  }

  .theme-option-selected {
    color: #3568d1;
    font-weight: 600;
  }

  :global(html[data-theme="dark"]) .theme-trigger,
  :global(html[data-theme="dark"]) .theme-option {
    color: #e2e8f0;
  }

  :global(html[data-theme="dark"]) .theme-option:hover {
    background: #1e293b;
  }

  :global(html[data-theme="dark"]) .theme-option-selected {
    color: #8aa8ff;
  }
</style>
