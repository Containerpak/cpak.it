<script lang="ts">
  import type { ActionData } from "./$types";

  let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
  <title>Verify a result - cpak</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="border-b border-slate-200 bg-white">
  <div class="mx-auto max-w-3xl px-6 py-16 sm:py-20">
    <p class="text-sm font-semibold tracking-[0.16em] text-[#4670EC] uppercase">
      Verification
    </p>
    <h1 class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">
      Check a result
    </h1>
    <p class="mt-5 text-lg leading-8 text-gray-600">
      Paste the code you were given, or the address it came in, and this page
      shows you the whole record it names.
    </p>

    <form method="POST" class="mt-8">
      <label for="code" class="block text-sm font-medium text-gray-900">
        Code or address
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
          Look it up
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
          Case does not matter, and the dashes are optional.
        </p>
      {/if}
    </form>
  </div>
</section>

<section class="mx-auto max-w-3xl px-6 py-14">
  <h2 class="text-2xl font-semibold text-gray-900">What a record here says</h2>
  <p class="mt-4 leading-7 text-gray-600">
    That the account named passed that exam on that date, and nothing else. The
    exam is taken online, on the candidate's own machine, with the book open and
    nobody watching. Nothing checks who is at the keyboard, so the record cannot
    tell you that the person handing you the link is the person it names, or
    what was read while the answers were being given.
  </p>
  <p class="mt-4 leading-7 text-gray-600">
    A record is written once. It is never reworded and never withdrawn. A later
    result for the same exam supersedes it and a record stops being current on
    its expiry date, and the page says which of those has happened while still
    showing what was earned and when.
  </p>

  <h2 class="mt-10 text-2xl font-semibold text-gray-900">
    A code is the only way in
  </h2>
  <p class="mt-4 leading-7 text-gray-600">
    There is no list of records on this site and no way to search one out by
    name. Somebody has to give you their code, which is the same as giving you
    the record, and the number of codes this page will answer for from one
    address in a minute is small.
  </p>
</section>
