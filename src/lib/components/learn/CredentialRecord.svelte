<script lang="ts">
  import {
    STANDING_CHIP,
    claim,
    immutable,
    issuerLine,
    longDate,
    standing,
    standingLine,
    standingWord,
    tokenPath,
    verifyPath,
    type Held,
  } from "$lib/learn/credential";
  import * as m from "$lib/paraglide/messages.js";

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
        {m.credential_exam_result()}
      </p>
      <h2 class="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
        {held.title}
      </h2>
      <p class="mt-1 text-lg text-gray-700">{held.result}</p>
    </div>
    <span
      class={`shrink-0 rounded-full border px-3 py-1 text-sm font-semibold ${STANDING_CHIP[state]}`}
    >
      {standingWord(state)}
    </span>
  </div>

  <p class="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
    {standingLine(held)}
    {#if state === "superseded" && successorIssuedAt}
      {m.credential_later_result({ date: longDate(successorIssuedAt) })}
    {/if}
  </p>

  <dl class="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
    <div>
      <dt class="text-xs font-semibold tracking-wider text-gray-500 uppercase">
        {m.credential_account_named()}
      </dt>
      <dd class="mt-1 text-sm break-words text-gray-900">{issuerLine(held)}</dd>
    </div>
    <div>
      <dt class="text-xs font-semibold tracking-wider text-gray-500 uppercase">
        {m.credential_code()}
      </dt>
      <dd class="mt-1 font-mono text-sm break-all text-gray-900">
        {held.code}
      </dd>
    </div>
    <div>
      <dt class="text-xs font-semibold tracking-wider text-gray-500 uppercase">
        {m.credential_issued_label()}
      </dt>
      <dd class="mt-1 text-sm text-gray-900">{longDate(held.issuedAt)}</dd>
    </div>
    <div>
      <dt class="text-xs font-semibold tracking-wider text-gray-500 uppercase">
        {m.credential_expiry()}
      </dt>
      <dd class="mt-1 text-sm text-gray-900">{longDate(held.expiresAt)}</dd>
    </div>
  </dl>

  <a
    href="/verify/{held.code}/certificate"
    class="mt-6 inline-flex rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:ring-offset-2 focus-visible:outline-none"
  >
    {m.credential_view_certificate()}
  </a>

  {#if held.supersededBy}
    <p class="mt-6 text-sm leading-6 text-gray-600">
      {m.credential_replaced_at()}
      <a
        href={verifyPath(held.supersededBy)}
        class="font-mono text-[#3158c7] underline underline-offset-2 hover:no-underline focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
        >{held.supersededBy}</a
      >. {m.credential_replaced_suffix()}
    </p>
  {/if}

  {#if held.signed}
    <p class="mt-6 max-w-2xl text-sm leading-6 text-gray-600">
      {m.credential_signed_record()}:
      <a
        href={tokenPath(held.code)}
        class="text-[#3158c7] underline underline-offset-2 hover:no-underline focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
        >{tokenPath(held.code)}</a
      >. {m.credential_verification_key()}:
      <a
        href="/.well-known/jwks.json"
        class="text-[#3158c7] underline underline-offset-2 hover:no-underline focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
        >/.well-known/jwks.json</a
      >.
    </p>
  {/if}

  <div class="mt-8 space-y-3 border-t border-slate-200 pt-6">
    <p class="max-w-2xl text-xs leading-5 text-gray-500">{claim()}</p>
    <p class="max-w-2xl text-xs leading-5 text-gray-500">{immutable()}</p>
  </div>
</article>
