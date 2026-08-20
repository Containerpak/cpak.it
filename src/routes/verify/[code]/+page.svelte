<script lang="ts">
  import CredentialRecord from "$lib/components/learn/CredentialRecord.svelte";
  import * as m from "$lib/paraglide/messages.js";
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
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-12 sm:py-16">
  <p class="text-sm font-semibold tracking-[0.16em] text-[#4670EC] uppercase">
    {m.verify_eyebrow()}
  </p>
  <h1 class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">
    {data.held ? m.verify_record_title() : m.verify_missing_title()}
  </h1>

  {#if data.held}
    <p class="mt-4 text-lg leading-8 text-gray-600">
      {m.verify_record_intro()}
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
        {m.verify_for_someone()}
      </h2>
      <p class="mt-2 text-sm leading-6 text-gray-600">
        {m.verify_for_someone_text()}
      </p>
      <p class="mt-3 text-sm leading-6 text-gray-600">
        {m.verify_material_text()}
        <a
          href="/learn"
          class="text-[#3158c7] underline underline-offset-2 hover:no-underline focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
          >cpak Learn</a
        >.
      </p>
    </section>
  {:else}
    <p class="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
      {m.verify_missing_intro({ code: data.given })}
    </p>
    <p class="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
      {m.verify_missing_reuse()}
    </p>
    <a
      href="/verify"
      class="mt-8 inline-block rounded-full bg-[#4670EC] px-6 py-3 text-sm font-semibold text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
    >
      {m.verify_try_another()}
    </a>
  {/if}
</div>
