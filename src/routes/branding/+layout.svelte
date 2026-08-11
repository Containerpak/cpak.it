<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { page } from "$app/state";

  function isActive(base: string, exact: boolean = false) {
    return exact
      ? page.url.pathname === base
      : page.url.pathname === base || page.url.pathname.startsWith(base + "/");
  }
</script>

<div class="flex min-h-screen flex-col">
  <Header />

  <nav class="bg-white shadow">
    <div class="scrollbar-hidden mx-auto max-w-7xl overflow-x-auto px-6">
      <ul class="flex w-max space-x-8 py-4">
        <li>
          <a
            href="/branding"
            class={`border-0 border-b-3 pb-4 font-medium hover:text-[#3E7BFF] ${
              isActive("/branding", true)
                ? "border-b-2 border-[#3E7BFF] text-[#3E7BFF]"
                : "border-transparent text-gray-900"
            }`}>Overview</a
          >
        </li>
        <li>
          <a
            href="/branding/presskit"
            class={`border-0 border-b-3 pb-4 font-medium hover:text-[#3E7BFF] ${
              isActive("/branding/presskit")
                ? "border-b-2 border-[#3E7BFF] text-[#3E7BFF]"
                : "border-transparent text-gray-900"
            }`}>Press Kit</a
          >
        </li>
        <li>
          <a
            href="/branding/guidelines"
            class={`border-0 border-b-3 pb-4 font-medium hover:text-[#3E7BFF] ${
              isActive("/branding/guidelines")
                ? "border-b-2 border-[#3E7BFF] text-[#3E7BFF]"
                : "border-transparent text-gray-900"
            }`}>Guidelines</a
          >
        </li>
        <li>
          <a
            href="/branding/badges"
            class={`border-0 border-b-3 pb-4 font-medium hover:text-[#3E7BFF] ${
              isActive("/branding/badges")
                ? "border-b-2 border-[#3E7BFF] text-[#3E7BFF]"
                : "border-transparent text-gray-900"
            }`}>Badges</a
          >
        </li>
      </ul>
    </div>
  </nav>

  <main class="flex-1">
    <slot />
  </main>

  <Footer />
</div>
