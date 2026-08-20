<script lang="ts">
  import { onMount, tick } from "svelte";

  export type SearchSelectOption = {
    value: string;
    label: string;
    keywords?: string;
  };

  let {
    id,
    label,
    value,
    options,
    onchange,
    searchLabel = "Search options",
  }: {
    id: string;
    label: string;
    value: string;
    options: SearchSelectOption[];
    onchange: (value: string) => void;
    searchLabel?: string;
  } = $props();

  let trigger: HTMLButtonElement;
  let menu: HTMLElement;
  let search: HTMLInputElement;
  let open = $state(false);
  let query = $state("");
  let active = $state(0);
  let position = $state("");

  let selected = $derived(options.find((option) => option.value === value));
  let filtered = $derived(
    options.filter((option) => {
      const term = query.trim().toLocaleLowerCase();
      if (!term) return true;
      return `${option.label} ${option.keywords ?? ""}`
        .toLocaleLowerCase()
        .includes(term);
    }),
  );

  function place() {
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const gap = 8;
    const edge = 12;
    const width = Math.min(
      Math.max(rect.width, 280),
      window.innerWidth - edge * 2,
    );
    const left = Math.min(
      Math.max(rect.left, edge),
      window.innerWidth - width - edge,
    );
    const roomBelow = window.innerHeight - rect.bottom - gap - edge;
    const maxHeight = Math.min(360, window.innerHeight - edge * 2);
    const top =
      roomBelow >= Math.min(260, maxHeight)
        ? rect.bottom + gap
        : Math.max(edge, rect.top - gap - maxHeight);
    position = `top:${top}px;left:${left}px;width:${width}px;max-height:${maxHeight}px`;
  }

  async function show() {
    query = "";
    active = Math.max(
      0,
      options.findIndex((option) => option.value === value),
    );
    place();
    menu.showPopover();
    open = true;
    await tick();
    search.focus();
  }

  function hide(focusTrigger = false) {
    if (!open) return;
    menu.hidePopover();
    open = false;
    if (focusTrigger) trigger.focus();
  }

  function toggle() {
    if (open) hide();
    else show();
  }

  function select(option: SearchSelectOption) {
    onchange(option.value);
    hide(true);
  }

  function move(step: number) {
    if (!filtered.length) return;
    active = (active + step + filtered.length) % filtered.length;
    document
      .getElementById(`${id}-option-${active}`)
      ?.scrollIntoView({ block: "nearest" });
  }

  function handleTriggerKey(event: KeyboardEvent) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    show();
  }

  function handleSearchKey(event: KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      active = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      active = Math.max(0, filtered.length - 1);
    } else if (event.key === "Enter" && filtered[active]) {
      event.preventDefault();
      select(filtered[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      hide(true);
    }
  }

  onMount(() => {
    const dismiss = (event: PointerEvent) => {
      if (
        !open ||
        trigger.contains(event.target as Node) ||
        menu.contains(event.target as Node)
      )
        return;
      hide();
    };
    const reposition = () => {
      if (open) place();
    };

    document.addEventListener("pointerdown", dismiss);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  });
</script>

<div class="relative">
  <button
    bind:this={trigger}
    type="button"
    {id}
    aria-label={label}
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-controls={`${id}-popover`}
    onclick={toggle}
    onkeydown={handleTriggerKey}
    class="flex min-w-44 items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 py-1.5 pr-2 pl-3 text-left text-xs text-slate-200 transition hover:border-slate-600 focus:border-[#7DA2FF] focus:ring-2 focus:ring-[#7DA2FF]/25 focus:outline-none"
  >
    <span class="min-w-0 flex-1 truncate">{selected?.label ?? value}</span>
    <span
      class={`material-symbols-outlined text-[17px] text-slate-400 transition ${open ? "rotate-180" : ""}`}
      >expand_more</span
    >
  </button>

  <div
    bind:this={menu}
    id={`${id}-popover`}
    popover="manual"
    style={position}
    role="dialog"
    aria-label={label}
    class="m-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-0 text-slate-100 shadow-2xl shadow-slate-950/50 backdrop:bg-transparent"
  >
    <div class="sticky top-0 border-b border-slate-700 bg-slate-900 p-2">
      <label for={`${id}-search`} class="sr-only">{searchLabel}</label>
      <div
        class="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-2.5 focus-within:border-[#7DA2FF] focus-within:ring-2 focus-within:ring-[#7DA2FF]/20"
      >
        <span class="material-symbols-outlined text-[17px] text-slate-500"
          >search</span
        >
        <input
          bind:this={search}
          id={`${id}-search`}
          type="search"
          bind:value={query}
          placeholder={searchLabel}
          autocomplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-activedescendant={filtered[active]
            ? `${id}-option-${active}`
            : undefined}
          oninput={() => (active = 0)}
          onkeydown={handleSearchKey}
          class="min-w-0 flex-1 border-0 bg-transparent px-0 py-2 text-sm text-white placeholder:text-slate-500 focus:ring-0 focus:outline-none"
        />
      </div>
    </div>

    <div
      id={`${id}-listbox`}
      role="listbox"
      aria-label={label}
      class="max-h-72 overflow-y-auto p-1.5"
    >
      {#each filtered as option, index (option.value)}
        <button
          id={`${id}-option-${index}`}
          type="button"
          role="option"
          aria-selected={option.value === value}
          onmouseenter={() => (active = index)}
          onclick={() => select(option)}
          class={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${active === index ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800/70 hover:text-white"}`}
        >
          <span class="min-w-0 flex-1 truncate">{option.label}</span>
          {#if option.value === value}
            <span class="material-symbols-outlined text-[18px] text-[#8AA8FF]"
              >check</span
            >
          {/if}
        </button>
      {:else}
        <p class="px-3 py-6 text-center text-sm text-slate-400">
          No options found.
        </p>
      {/each}
    </div>
  </div>
</div>
