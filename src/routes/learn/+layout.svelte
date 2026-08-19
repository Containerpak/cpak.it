<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import type { LayoutData } from "./$types";

  let { data, children }: { data: LayoutData; children: import("svelte").Snippet } =
    $props();
</script>

<div class="flex min-h-screen flex-col">
  <Header account={data.account} />
  <main class="flex-1 bg-white">
    {@render children()}
  </main>
  <Footer />
</div>
