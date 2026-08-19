<script lang="ts">
  // Verification has its own error page because the one thing that goes wrong
  // here has a plain explanation, and the site-wide page cannot give it.
  import { page } from "$app/state";
</script>

<svelte:head>
  <title>Verification - cpak</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-16 sm:py-24">
  <p class="text-sm font-semibold tracking-[0.16em] text-[#4670EC] uppercase">
    Verification
  </p>
  <h1 class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">
    {page.status === 429 ? "Too many at once" : "That did not work"}
  </h1>
  <p class="mt-5 text-lg leading-8 text-gray-600">
    {page.error?.message ?? "Something went wrong reading that code."}
  </p>
  <a
    href="/verify"
    class="mt-8 inline-block rounded-full bg-[#4670EC] px-6 py-3 text-sm font-semibold text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
  >
    Back to the field
  </a>
</div>
