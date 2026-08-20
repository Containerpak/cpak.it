<script lang="ts">
  import type { ActionData } from "./$types";
  import * as m from "$lib/paraglide/messages.js";

  let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
  <title>Verify a result - cpak</title>
</svelte:head>

<section class="border-b border-slate-200 bg-white">
  <div class="mx-auto max-w-3xl px-6 py-16 sm:py-20">
    <p class="text-sm font-semibold tracking-[0.16em] text-[#4670EC] uppercase">
      {m.verify_eyebrow()}
    </p>
    <h1 class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">
      {m.verify_lookup_title()}
    </h1>
    <p class="mt-5 text-lg leading-8 text-gray-600">
      {m.verify_lookup_intro()}
    </p>

    <form method="POST" class="mt-8">
      <label for="code" class="block text-sm font-medium text-gray-900">
        {m.verify_code_address()}
      </label>
      <div class="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id="code"
          name="code"
          required
          maxlength="200"
          autocomplete="off"
          spellcheck="false"
          value={form?.given ?? ""}
          placeholder="ABCD-EFGH-JKMN-PQRS"
          aria-describedby={form?.problem ? "problem" : undefined}
          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-gray-900 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none"
        />
        <button
          type="submit"
          class="shrink-0 rounded-full bg-[#4670EC] px-6 py-3 text-sm font-semibold text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
        >
          {m.verify_look_up()}
        </button>
      </div>
      {#if form?.problem}
        <p
          id="problem"
          class="mt-3 text-sm leading-6 text-red-700"
          role="alert"
        >
          {form.problem}
        </p>
      {:else}
        <p class="mt-3 text-sm leading-6 text-gray-500">
          {m.verify_code_help()}
        </p>
      {/if}
    </form>
  </div>
</section>

<section class="mx-auto max-w-3xl px-6 py-14">
  <h2 class="text-2xl font-semibold text-gray-900">{m.verify_record_says()}</h2>
  <p class="mt-4 leading-7 text-gray-600">
    {m.verify_record_says_text()}
  </p>
  <p class="mt-4 leading-7 text-gray-600">
    {m.verify_record_permanent()}
  </p>

  <h2 class="mt-10 text-2xl font-semibold text-gray-900">
    {m.verify_code_only()}
  </h2>
  <p class="mt-4 leading-7 text-gray-600">
    {m.verify_code_only_text()}
  </p>
</section>
