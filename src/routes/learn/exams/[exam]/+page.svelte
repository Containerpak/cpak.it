<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import { enhance } from "$app/forms";
  import { onMount, untrack } from "svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { ActionData, PageData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let exam = $derived(data.exam);
  let marked = $derived(form?.marked ?? null);
  let failed = $derived(form?.failed ?? false);
  let code = $derived(form?.code ?? "");
  let sending = $state(false);
  let share = $derived(Math.round(exam.pass * 100));
  let answers = $state<(number | null)[]>(
    untrack(() =>
      form && "given" in form && Array.isArray(form.given)
        ? form.given
        : exam.questions.map(() => null),
    ),
  );
  let answered = $derived(answers.filter((answer) => answer !== null).length);
  let complete = $derived(answered === exam.questions.length);
  let remaining = $derived(exam.questions.length - answered);
  let draftKey = $derived(`cpak-learn-exam:${exam.id}`);

  onMount(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey) ?? "null") as unknown;
      if (
        Array.isArray(saved) &&
        saved.length === exam.questions.length &&
        saved.every(
          (answer, index) =>
            answer === null ||
            (Number.isInteger(answer) && answer >= 0 && answer < exam.questions[index].choices.length),
        )
      ) {
        saved.forEach((answer, index) => {
          answers[index] = answer as number | null;
        });
      }
    } catch {
      localStorage.removeItem(draftKey);
    }
  });

  function saveAnswers() {
    try {
      localStorage.setItem(draftKey, JSON.stringify(answers));
    } catch {}
  }
</script>

<Seo
  title="{exam.title} - cpak"
  description="Sit the {exam.title} exam. Open book, unproctored, on your own machine, and the result attests an exam result and nothing more."
  path="/learn/exams/{exam.id}"
/>

<div class="mx-auto max-w-3xl px-6 py-12 lg:py-16">
  <nav aria-label="Breadcrumb" class="text-sm text-slate-500">
    <a href="/learn" class="hover:underline">{m.learn()}</a>
    <span aria-hidden="true" class="px-1.5">/</span>
    <a href="/learn#credentials" class="hover:underline">{m.credentials()}</a>
    <span aria-hidden="true" class="px-1.5">/</span>
    <span aria-current="page">{exam.title}</span>
  </nav>

  <h1 class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">
    {exam.title}
  </h1>

  {#if code}
    <div class="mt-8 rounded-2xl border border-emerald-300 bg-emerald-50 p-6">
      <p class="text-lg font-semibold text-emerald-900">
        {m.exam_passed({ right: String(marked?.right ?? 0), total: String(marked?.total ?? 0) })}
      </p>
      <p class="mt-2 text-sm leading-6 text-emerald-900">
        {m.credential_issued()}
      </p>
      <a
        href="/learn/account/credentials/{code}"
        class="mt-5 inline-flex items-center gap-2 rounded-full bg-[#4670EC] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3158c7]"
      >
        {m.read_credential()}
        <span class="material-symbols-outlined text-lg" aria-hidden="true"
          >arrow_forward</span
        >
      </a>
    </div>
  {:else}
    <p class="mt-4 text-lg leading-8 text-gray-600">
      {m.exam_attempt_intro({ questions: String(exam.questions.length), pass: String(share) })}
    </p>

    <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <p class="text-sm font-semibold text-gray-900">{m.exam_context_title()}</p>
      <p class="mt-2 text-sm leading-6 text-gray-600">
        {m.exam_context()} {m.read_again()}
        <a
          href={exam.course.href}
          class="font-medium text-[#4670EC] hover:underline">{exam.course.title}</a
        >.
      </p>
      <p class="mt-3 text-sm leading-6 text-gray-600">
        {m.exam_server_marking()}
      </p>
    </div>

    {#if failed}
      <div class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
        <p class="text-lg font-semibold text-red-900">
          {m.exam_failed()}
        </p>
        <p class="mt-2 text-sm leading-6 text-red-900">
          {m.exam_failed_help({ pass: String(share) })}
          <a
            href={exam.course.href}
            class="font-medium underline underline-offset-2">{exam.course.title}</a
          >.
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
        <p class="font-semibold text-gray-900">{m.keep_sitting()}</p>
        <p class="mt-2 text-sm leading-6 text-gray-600">
          {m.keep_sitting_intro()}
        </p>
      </div>
    {/if}

    <form
      method="POST"
      action="?/sit"
      use:enhance={() => {
        sending = true;
        return async ({ result, update }) => {
          if (result.type === "success" && result.data && "code" in result.data && result.data.code) {
            localStorage.removeItem(draftKey);
          }
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
                      bind:group={answers[index]}
                      onchange={saveAnswers}
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
        disabled={sending || !complete || !data.signedIn}
        class="mt-10 inline-flex items-center gap-2 rounded-full bg-[#4670EC] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3158c7] disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {sending ? m.marking() : m.hand_in()}
        <span class="material-symbols-outlined text-lg" aria-hidden="true"
          >arrow_forward</span
        >
      </button>
      {#if !complete}
        <p class="mt-3 text-sm text-slate-500">
          {m.answered_status({ answered: String(answered), total: String(exam.questions.length) })}
          {remaining === 1 ? m.finish_remaining_one() : m.finish_remaining_many({ remaining: String(remaining) })}
        </p>
      {:else if !data.signedIn}
        <p class="mt-3 text-sm text-slate-500">
          {m.answers_saved()}
          <a
            href={`/learn/account?returnTo=${encodeURIComponent(`/learn/exams/${exam.id}`)}#signin`}
            class="font-semibold text-[#3158c7] underline underline-offset-2 hover:no-underline"
          >{m.create_account_submit()}</a>
        </p>
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
