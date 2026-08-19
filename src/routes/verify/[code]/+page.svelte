<script lang="ts">
  import CredentialRecord from "$lib/components/learn/CredentialRecord.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title
    >{data.held
      ? `${data.held.title} - ${data.held.handle}`
      : "Credential not found"}
    - cpak</title
  >
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-12 sm:py-16">
  <p class="text-sm font-semibold tracking-[0.16em] text-[#4670EC] uppercase">
    Verification
  </p>
  <h1 class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">
    {data.held ? "Credential" : "No credential with that code"}
  </h1>

  {#if data.held}
    <p class="mt-4 text-lg leading-8 text-gray-600">
      This is the whole record. Read what it says carefully, including what it
      does not claim.
    </p>

    <div class="mt-8">
      <CredentialRecord
        held={data.held}
        successorIssuedAt={data.successorIssuedAt}
      />
    </div>

    <section
      aria-labelledby="reading"
      class="mt-8 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <h2 id="reading" class="text-lg font-semibold text-gray-900">
        If you are checking this on someone's behalf
      </h2>
      <p class="mt-2 text-sm leading-6 text-gray-600">
        The code above was generated when the result was written and this page
        is the only place it resolves. What it tells you is that the account
        named passed that exam on that date. It does not tell you who was at the
        keyboard, whether anything was looked up while answering, or that the
        person handing you the link is the person named.
      </p>
      <p class="mt-3 text-sm leading-6 text-gray-600">
        The exam and the material it covers are open to read at
        <a
          href="/learn"
          class="text-[#3158c7] underline underline-offset-2 hover:no-underline focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
          >cpak Learn</a
        >, so you can judge for yourself what passing it is worth.
      </p>
    </section>
  {:else}
    <p class="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
      Nothing here answers to
      <span class="font-mono text-base break-all">{data.given}</span>. A code is
      sixteen characters in four groups, and it is case-insensitive. Check it
      against the one you were given: a mistyped character reads as a code that
      was never issued, and so does one that was made up.
    </p>
    <p class="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
      Codes are never reused, so this answer will not change later.
    </p>
    <a
      href="/verify"
      class="mt-8 inline-block rounded-full bg-[#4670EC] px-6 py-3 text-sm font-semibold text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
    >
      Try another code
    </a>
  {/if}
</div>
