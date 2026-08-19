<script lang="ts">
  // One credential, drawn the same way wherever it is read. The private page
  // and the public page share this so the two can never describe the same
  // record in different words.
  import {
    CLAIM,
    IMMUTABLE,
    STANDING_CHIP,
    STANDING_WORD,
    issuerLine,
    longDate,
    standing,
    standingLine,
    tokenPath,
    verifyPath,
    type Held,
  } from "$lib/learn/credential";

  let {
    held,
    successorIssuedAt = null,
  }: { held: Held; successorIssuedAt?: string | null } = $props();

  let state = $derived(standing(held));
</script>

<article class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div class="min-w-0">
      <p class="text-xs font-semibold tracking-wider text-gray-500 uppercase">
        Exam result
      </p>
      <h2 class="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
        {held.title}
      </h2>
      <p class="mt-1 text-lg text-gray-700">{held.result}</p>
    </div>
    <span
      class={`shrink-0 rounded-full border px-3 py-1 text-sm font-semibold ${STANDING_CHIP[state]}`}
    >
      {STANDING_WORD[state]}
    </span>
  </div>

  <p class="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
    {standingLine(held)}
    {#if state === "superseded" && successorIssuedAt}
      The later result was issued on {longDate(successorIssuedAt)}.
    {/if}
  </p>

  <dl class="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
    <div>
      <dt class="text-xs font-semibold tracking-wider text-gray-500 uppercase">
        Account named
      </dt>
      <dd class="mt-1 text-sm break-words text-gray-900">{issuerLine(held)}</dd>
    </div>
    <div>
      <dt class="text-xs font-semibold tracking-wider text-gray-500 uppercase">
        Code
      </dt>
      <dd class="mt-1 font-mono text-sm break-all text-gray-900">
        {held.code}
      </dd>
    </div>
    <div>
      <dt class="text-xs font-semibold tracking-wider text-gray-500 uppercase">
        Issued
      </dt>
      <dd class="mt-1 text-sm text-gray-900">{longDate(held.issuedAt)}</dd>
    </div>
    <div>
      <dt class="text-xs font-semibold tracking-wider text-gray-500 uppercase">
        Expiry
      </dt>
      <dd class="mt-1 text-sm text-gray-900">{longDate(held.expiresAt)}</dd>
    </div>
  </dl>

  {#if held.supersededBy}
    <p class="mt-6 text-sm leading-6 text-gray-600">
      The result that replaced it is at
      <a
        href={verifyPath(held.supersededBy)}
        class="font-mono text-[#3158c7] underline underline-offset-2 hover:no-underline focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
        >{held.supersededBy}</a
      >. This one is not deleted, and stays readable here.
    </p>
  {/if}

  {#if held.signed}
    <p class="mt-6 max-w-2xl text-sm leading-6 text-gray-600">
      This record is also published in a signed form, at
      <a
        href={tokenPath(held.code)}
        class="text-[#3158c7] underline underline-offset-2 hover:no-underline focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
        >{tokenPath(held.code)}</a
      >. Anybody can check it against the key at
      <a
        href="/.well-known/jwks.json"
        class="text-[#3158c7] underline underline-offset-2 hover:no-underline focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
        >/.well-known/jwks.json</a
      >
      without asking this site anything, which is what makes it worth keeping a copy
      of.
    </p>
  {/if}

  <div class="mt-8 space-y-3 border-t border-slate-200 pt-6">
    <p class="max-w-2xl text-sm leading-6 text-gray-600">{CLAIM}</p>
    <p class="max-w-2xl text-sm leading-6 text-gray-600">{IMMUTABLE}</p>
  </div>
</article>
