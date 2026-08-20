<script lang="ts">
  import { page } from "$app/state";
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import type { LayoutData } from "./$types";

  let { data, children }: { data: LayoutData; children: import("svelte").Snippet } =
    $props();

  let academyHome = $derived(page.url.pathname === "/learn");
</script>

<div class:academy-home={academyHome} class="flex min-h-screen flex-col">
  <Header account={data.account} academy={academyHome} />
  <main class={academyHome ? "flex-1 bg-transparent" : "flex-1 bg-white"}>
    {@render children()}
  </main>
  <Footer />
</div>

<style>
  .academy-home {
    background-image:
      radial-gradient(circle at 78% 18%, rgb(70 112 236 / 28%), transparent 30rem),
      linear-gradient(135deg, #0b1328 0%, #111c39 58%, #0a1020 100%);
    background-repeat: no-repeat;
    background-size: 100% 48rem;
  }
</style>
