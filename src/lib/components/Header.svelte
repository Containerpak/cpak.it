<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { searchQuery } from "$lib/stores/search";
  import ThemePicker from "$lib/components/ThemePicker.svelte";
  import { packageSlug } from "$lib/store";

  // Who is signed in, when the page is one of Learn's. The rest of the site
  // has no account, so it passes nothing and no profile is drawn.
  export let account: {
    handle: string;
    avatar: string;
    provider: string;
  } | null = null;

  let query = "";
  let showDropdown = false;
  let showMobileMenu = false;
  let showAccountMenu = false;

  // Inside Learn the account menu is the only thing on the right, so it has to
  // close the way every other menu on the web closes: a click anywhere else,
  // or Escape.
  function closeAccountMenu(event: Event) {
    const target = event.target as HTMLElement | null;
    if (target?.closest?.("[data-account-menu]")) return;
    showAccountMenu = false;
  }

  function accountMenuKey(event: KeyboardEvent) {
    if (event.key === "Escape") showAccountMenu = false;
  }

  interface DocItem {
    title: string;
    url: string;
    description: string;
    searchText: string;
  }
  interface AppItem {
    name: string;
    url: string;
    icon: string;
  }

  let docsIndex: DocItem[] = [];
  let appIndex: AppItem[] = [];
  let results = { docs: [] as DocItem[], apps: [] as AppItem[] };

  function debounce<T extends (...args: any[]) => void>(fn: T, ms = 200) {
    let t: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  onMount(async () => {
    const [storeRes, docsRes] = await Promise.all([
      fetch(
        "https://raw.githubusercontent.com/Containerpak/store/main/index.json",
      ),
      fetch("/docs-index.json"),
    ]);

    if (docsRes.ok) docsIndex = (await docsRes.json()) as DocItem[];

    if (storeRes.ok) {
      const storeIndex = (await storeRes.json()) as Record<
        string,
        Record<string, { name: string; manifest: string }>
      >;
      const apps: AppItem[] = [];
      for (const entries of Object.values(storeIndex)) {
        for (const [origin, entry] of Object.entries(entries)) {
          const base = entry.manifest.replace(/\/[^/]+$/, "");
          apps.push({
            name: entry.name,
            url: `/store/apps/${packageSlug(origin)}`,
            icon: `${base}/icon.svg`,
          });
        }
      }
      appIndex = apps;
    }
  });

  const doSearch = () => {
    const q = query.trim().toLowerCase();
    if (!q) {
      showDropdown = false;
      results = { docs: [], apps: [] };
      searchQuery.set("");
      return;
    }
    showDropdown = true;
    searchQuery.set(q);
    results.docs = docsIndex.filter((d) => d.searchText.includes(q));
    results.apps = appIndex.filter((a) => a.name.toLowerCase().includes(q));
  };
  const handleInput = debounce(doSearch, 150);

  function select(item: DocItem | AppItem) {
    window.location.href = item.url;
    showDropdown = false;
  }

  $: current = $page.url.pathname;
  $: inLearn = current === "/learn" || current.startsWith("/learn/");
</script>

<svelte:window on:click={closeAccountMenu} on:keydown={accountMenuKey} />

<nav class="relative w-full bg-slate-50">
  <div class="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:gap-6 sm:px-6">
    {#if current !== "/"}
      <button
        on:click={() => history.back()}
        aria-label="Back"
        class="hidden cursor-pointer items-center rounded-full bg-transparent p-2 text-gray-700 shadow-none transition duration-200 hover:bg-white hover:shadow-sm sm:flex"
      >
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
    {/if}
    <div class="flex shrink-0 items-center gap-2 sm:gap-3">
      <a href="/" class="flex shrink-0 items-center gap-2">
        <!-- The wordmark stays at every width, inside Learn as well. Dropping
             it to the icon on a narrow screen left the mark beside it reading
             as the name of the product, which is the one thing the pipe was
             there to prevent. -->
        <img src="/cpak-brand.svg" alt="cpak logo" class="theme-logo-light" />
        <img
          src="/presskit/full/cpak-brand-dark.svg"
          alt="cpak logo"
          class="theme-logo-dark h-[46px] w-[104px] object-contain"
        />
      </a>
      {#if inLearn}
        <span
          aria-hidden="true"
          class="h-6 w-0 shrink-0 border-l border-slate-200"
        ></span>
        <a
          href="/learn"
          aria-current={current === "/learn" ? "page" : undefined}
          style="font-family: 'Outfit', sans-serif"
          class="shrink-0 rounded-sm text-lg font-bold text-gray-900 hover:underline focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
          >learn</a
        >
      {/if}
    </div>
    <div class="flex flex-grow justify-end lg:justify-center">
      <input
        type="search"
        bind:value={query}
        on:input={handleInput}
        placeholder="Search docs & apps"
        class="hidden h-12 w-full max-w-[480px] rounded-full border border-slate-200 bg-white px-5 text-sm placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none lg:block xl:max-w-[560px]"
      />
      {#if showDropdown}
        <div
          class="absolute top-full z-20 mt-2 max-h-96 w-[640px] overflow-auto rounded-lg bg-white shadow-lg"
        >
          {#if results.docs.length}
            <div class="border-b px-4 py-2">
              <h4 class="text-sm font-semibold text-gray-700">Documentation</h4>
              {#each results.docs as d}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                  class="mt-2 flex cursor-pointer items-center gap-3 px-2 py-1 hover:bg-slate-100"
                  on:click={() => select(d)}
                >
                  <span class="material-symbols-outlined text-gray-500"
                    >menu_book</span
                  >
                  <span>
                    <span class="block text-sm text-gray-800">{d.title}</span>
                    <span class="line-clamp-1 block text-xs text-gray-500"
                      >{d.description}</span
                    >
                  </span>
                </div>
              {/each}
            </div>
          {/if}
          {#if results.apps.length}
            <div class="px-4 py-2">
              <h4 class="text-sm font-semibold text-gray-700">Apps</h4>
              {#each results.apps as a}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                  class="mt-2 flex cursor-pointer items-center gap-3 px-2 py-1 hover:bg-slate-100"
                  on:click={() => select(a)}
                >
                  <img src={a.icon} alt="" class="h-5 w-5 rounded-sm" />
                  <span class="text-sm text-gray-800">{a.name}</span>
                </div>
              {/each}
            </div>
          {/if}
          {#if !results.docs.length && !results.apps.length}
            <div class="p-4 text-center text-sm text-gray-500">
              No results found
            </div>
          {/if}
        </div>
      {/if}
    </div>
    <div class="flex shrink-0 items-center gap-6">
      <ThemePicker />
      <button
        class="flex items-center justify-center rounded-full bg-transparent p-2 text-gray-700 shadow-none transition duration-200 hover:bg-white hover:shadow-sm lg:hidden"
        on:click={() => (showMobileMenu = !showMobileMenu)}
      >
        <span class="material-symbols-outlined">menu</span>
      </button>
      {#if inLearn}
        <!-- Learn keeps its own nav. Somebody reading a lesson is not shopping
             the rest of the site, and the one thing they cannot find without a
             control is their own account. -->
        <div class="hidden items-center gap-6 lg:flex">
          <a
            href="/docs"
            class="text-sm font-medium text-gray-900 hover:underline">Docs</a
          >
          {#if account}
            <div class="relative" data-account-menu>
              <button
                type="button"
                on:click={() => (showAccountMenu = !showAccountMenu)}
                aria-expanded={showAccountMenu}
                aria-haspopup="menu"
                class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-gray-700 transition hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
              >
                {#if account.avatar}
                  <img
                    src={account.avatar}
                    alt=""
                    class="h-full w-full object-cover"
                  />
                {:else}
                  {account.handle.slice(0, 1).toUpperCase()}
                {/if}
                <span class="sr-only">Your account, {account.handle}</span>
              </button>

              {#if showAccountMenu}
                <div
                  role="menu"
                  class="absolute right-0 z-30 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                >
                  <p class="px-4 py-2 text-xs text-gray-500">
                    Signed in as
                    <span class="font-medium text-gray-900">{account.handle}</span>
                  </p>
                  <div class="my-1 border-t border-slate-100"></div>
                  <a
                    role="menuitem"
                    href="/learn/account#completed"
                    on:click={() => (showAccountMenu = false)}
                    class="block px-4 py-2 text-sm text-gray-900 hover:bg-slate-100"
                    >Your courses</a
                  >
                  <a
                    role="menuitem"
                    href="/learn/account#hold"
                    on:click={() => (showAccountMenu = false)}
                    class="block px-4 py-2 text-sm text-gray-900 hover:bg-slate-100"
                    >Your credentials</a
                  >
                  <a
                    role="menuitem"
                    href="/learn/account#data"
                    on:click={() => (showAccountMenu = false)}
                    class="block px-4 py-2 text-sm text-gray-900 hover:bg-slate-100"
                    >Settings</a
                  >
                  <div class="my-1 border-t border-slate-100"></div>
                  <form method="POST" action="/learn/account?/signout">
                    <button
                      role="menuitem"
                      type="submit"
                      class="block w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-slate-100"
                      >Sign out</button
                    >
                  </form>
                </div>
              {/if}
            </div>
          {:else}
            <a
              href="/learn/account#signin"
              class="rounded-full bg-[#3E7BFF]/20 px-4 py-2 text-sm font-semibold text-[#3E7BFF] transition hover:bg-[#3E7BFF]/30"
              >Sign in</a
            >
          {/if}
        </div>
      {:else}
        <div class="hidden items-center gap-6 lg:flex">
          <a
            href="/docs"
            class="text-sm font-medium text-gray-900 hover:underline">Docs</a
          >
          <a
            href="/learn"
            class="text-sm font-medium text-gray-900 hover:underline">Learn</a
          >
          <a
            href="/announcements"
            class="text-sm font-medium text-gray-900 hover:underline"
            >Announcements</a
          >
          <a
            href="/support"
            class="text-sm font-medium text-gray-900 hover:underline">Support</a
          >
          <a
            href="https://github.com/containerpak/cpak"
            class="text-sm font-medium text-gray-900 hover:underline">GitHub</a
          >
          <a
            href="/docs/quick-start"
            class="rounded-full bg-[#3E7BFF]/20 px-4 py-2 text-sm font-semibold text-[#3E7BFF] transition hover:bg-[#3E7BFF]/30"
          >
            Get started
          </a>
        </div>
      {/if}
    </div>
  </div>
  {#if showMobileMenu}
    <div class="absolute top-full left-0 w-full bg-white shadow-md lg:hidden">
      <a
        href="/docs"
        class="block px-6 py-4 text-sm font-medium text-gray-900 hover:bg-slate-100"
        >Docs</a
      >
      {#if inLearn}
        {#if account}
          <p class="border-t border-slate-100 px-6 pt-4 text-xs text-gray-500">
            Signed in as <span class="font-medium text-gray-900">{account.handle}</span>
          </p>
          <a
            href="/learn/account#completed"
            class="block px-6 py-4 text-sm font-medium text-gray-900 hover:bg-slate-100"
            >Your courses</a
          >
          <a
            href="/learn/account#hold"
            class="block px-6 py-4 text-sm font-medium text-gray-900 hover:bg-slate-100"
            >Your credentials</a
          >
          <a
            href="/learn/account#data"
            class="block px-6 py-4 text-sm font-medium text-gray-900 hover:bg-slate-100"
            >Settings</a
          >
          <form method="POST" action="/learn/account?/signout">
            <button
              type="submit"
              class="block w-full px-6 py-4 text-left text-sm font-medium text-gray-900 hover:bg-slate-100"
              >Sign out</button
            >
          </form>
        {:else}
          <a
            href="/learn/account#signin"
            class="block px-6 py-4 text-sm font-medium text-[#3E7BFF] hover:bg-slate-100"
            >Sign in</a
          >
        {/if}
      {:else}
        <a
          href="/learn"
          class="block px-6 py-4 text-sm font-medium text-gray-900 hover:bg-slate-100"
          >Learn</a
        >
        <a
          href="/announcements"
          class="block px-6 py-4 text-sm font-medium text-gray-900 hover:bg-slate-100"
          >Announcements</a
        >
        <a
          href="/support"
          class="block px-6 py-4 text-sm font-medium text-gray-900 hover:bg-slate-100"
          >Support</a
        >
        <a
          href="https://github.com/containerpak/cpak"
          class="block px-6 py-4 text-sm font-medium text-gray-900 hover:bg-slate-100"
          >GitHub</a
        >
        <a
          href="/docs/quick-start"
          class="block px-6 py-4 text-sm font-medium text-[#3E7BFF] hover:bg-slate-100"
        >
          Get started
        </a>
      {/if}
      <input
        type="search"
        bind:value={query}
        on:input={handleInput}
        placeholder="Search docs & apps"
        class="block w-full border-t border-slate-200 px-6 py-4 text-sm focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
      />
    </div>
  {/if}
</nav>
