<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import { enhance } from "$app/forms";
  import type { ActionData, PageData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let exam = $derived(data.exam);
  let marked = $derived(form?.marked ?? null);
  let code = $derived(form?.code ?? "");
  let sending = $state(false);
  let share = $derived(Math.round(exam.pass * 100));
</script>

<Seo
  title="{exam.title} - cpak"
  description="Sit the {exam.title} exam. Open book, unproctored, on your own machine, and the result attests an exam result and nothing more."
  path="/learn/exams/{exam.id}"
/>

<div class="mx-auto max-w-3xl px-6 py-12 lg:py-16">
  <nav aria-label="Breadcrumb" class="text-sm text-slate-500">
    <a href="/learn" class="hover:underline">Learn</a>
    <span aria-hidden="true" class="px-1.5">/</span>
    <a href="/learn#credentials" class="hover:underline">Credentials</a>
    <span aria-hidden="true" class="px-1.5">/</span>
    <span aria-current="page">{exam.title}</span>
  </nav>

  <h1 class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">
    {exam.title}
  </h1>

  {#if code}
    <div class="mt-8 rounded-2xl border border-emerald-300 bg-emerald-50 p-6">
      <p class="text-lg font-semibold text-emerald-900">
        {marked?.right} of {marked?.total} right. Passed.
      </p>
      <p class="mt-2 text-sm leading-6 text-emerald-900">
        A credential has been issued under your account. It has a page anyone
        can read without signing in.
      </p>
      <a
        href="/learn/account/credentials/{code}"
        class="mt-5 inline-flex items-center gap-2 rounded-full bg-[#4670EC] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3158c7]"
      >
        Read your credential
        <span class="material-symbols-outlined text-lg" aria-hidden="true"
          >arrow_forward</span
        >
      </a>
    </div>
  {:else}
    <p class="mt-4 text-lg leading-8 text-gray-600">
      {exam.questions.length} questions. {share} per cent to pass. You may take it
      again as many times as you like, and a later pass replaces an earlier one.
    </p>

    <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <p class="text-sm font-semibold text-gray-900">What this is</p>
      <p class="mt-2 text-sm leading-6 text-gray-600">
        Open book, taken on your own machine, with nobody watching. Nothing
        checks who is at the keyboard, so what you earn attests an exam result
        under an account and nothing more. Read
        <a
          href={exam.course.href}
          class="font-medium text-[#4670EC] hover:underline">{exam.course.title}</a
        > first if you have not.
      </p>
      <p class="mt-3 text-sm leading-6 text-gray-600">
        Answers are marked on the server, so nothing on this page tells you
        which one is right, and nothing is recorded for a sitting that does not
        pass.
      </p>
    </div>

    {#if marked}
      <div class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
        <p class="text-lg font-semibold text-red-900">
          {marked.right} of {marked.total} right. Not passed.
        </p>
        <p class="mt-2 text-sm leading-6 text-red-900">
          {share} per cent is the bar, and nothing was recorded. Go back through
          <a
            href={exam.course.href}
            class="font-medium underline underline-offset-2">{exam.course.title}</a
          >
          and sit it again. Which questions you missed is deliberately not shown:
          it is the same exam next time.
        </p>
      </div>
    {/if}

    {#if form?.problem}
      <p
        class="mt-6 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm leading-6 text-yellow-900"
      >
        {form.problem}
      </p>
    {/if}

    {#if !data.signedIn}
      <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <p class="text-sm leading-6 text-gray-600">
          A credential names an account, so you need one before sitting this.
          Reading the questions does not.
        </p>
        <a
          href="/learn/account#signin"
          class="mt-4 inline-flex items-center gap-2 rounded-full bg-[#4670EC] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3158c7]"
          >Sign in</a
        >
      </div>
    {/if}

    <form
      method="POST"
      action="?/sit"
      use:enhance={() => {
        sending = true;
        return async ({ update }) => {
          await update();
          sending = false;
          window.scrollTo({ top: 0, behavior: "smooth" });
        };
      }}
    >
      <ol class="mt-10 space-y-10">
        {#each exam.questions as question, index (question.asks)}
          <li>
            <fieldset>
              <legend class="text-lg font-semibold text-gray-900">
                <span class="text-slate-400">{index + 1}.</span>
                {question.asks}
              </legend>
              <div class="mt-4 space-y-2">
                {#each question.choices as choice, at (choice)}
                  <label
                    class="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-gray-900 transition hover:border-slate-400 hover:bg-slate-50 has-[:checked]:border-[#3E7BFF] has-[:checked]:bg-[#3E7BFF]/5"
                  >
                    <input
                      type="radio"
                      name="q{index}"
                      value={at}
                      required
                      class="mt-1.5 accent-[#3E7BFF]"
                    />
                    <span>{choice}</span>
                  </label>
                {/each}
              </div>
            </fieldset>
          </li>
        {/each}
      </ol>

      <button
        type="submit"
        disabled={sending || !data.signedIn}
        class="mt-10 inline-flex items-center gap-2 rounded-full bg-[#4670EC] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3158c7] disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {sending ? "Marking" : "Hand it in"}
        <span class="material-symbols-outlined text-lg" aria-hidden="true"
          >arrow_forward</span
        >
      </button>
      {#if !data.signedIn}
        <p class="mt-3 text-sm text-slate-500">Sign in to hand it in.</p>
      {/if}
    </form>
  {/if}
</div>

<style>
  ol {
    list-style: none;
    padding: 0;
  }
</style>
