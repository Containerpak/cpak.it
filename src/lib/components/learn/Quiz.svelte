<script lang="ts">
  import { placements, shuffled } from "$lib/learn/shuffle";
  import type { QuizQuestion } from "$lib/learn/quiz";
  import * as m from "$lib/paraglide/messages.js";

  let {
    questions,
    tool = null,
    toolAfter = 0,
    lessons,
    usesPlayground = false,
  }: {
    questions: QuizQuestion[];
    lessons: number;
    usesPlayground?: boolean;
    tool?: import("svelte").Snippet | null;
    toolAfter?: number;
  } = $props();

  // svelte-ignore state_referenced_locally
  let answers = $state<(string | null)[]>(questions.map(() => null));
  let right = $derived(
    answers.filter(
      (given, index) =>
        given !== null &&
        questions[index].choices.find((choice) => choice.text === given)?.correct,
    ).length,
  );
  let answered = $derived(answers.filter((given) => given !== null).length);
  let done = $derived(answered === questions.length);

  function answer(question: number, choice: string) {
    if (answers[question] !== null) return;
    answers[question] = choice;
  }

  let columns = $derived(
    placements(
      questions.map((q) => q.asks).join("|"),
      questions.length,
      Math.max(...questions.map((q) => q.choices.length)),
    ),
  );

  function again() {
    answers = questions.map(() => null);
  }
</script>

<div class="not-prose">
  <p class="text-base leading-7 text-gray-600">
    {m.quiz_intro({ questions: String(questions.length), lessons: String(lessons) })}
    {#if usesPlayground} {m.quiz_intro_playground()}{/if}
  </p>

  <ol class="quiz-questions mt-8 space-y-10">
    {#each questions as question, index (question.asks)}
      {@const given = answers[index]}
      {@const choices = shuffled(
        question.asks,
        question.choices,
        question.choices.findIndex((c) => c.correct),
        columns[index] % question.choices.length,
      )}
      <li>
        <fieldset>
          <legend class="text-lg font-semibold text-gray-900">
            <span class="text-slate-400">{index + 1}.</span>
            {question.asks}
          </legend>
          <div class="mt-4 space-y-2">
            {#each choices as choice (choice.text)}
              {@const chosen = given === choice.text}
              {@const reveal = given !== null}
              <button
                type="button"
                onclick={() => answer(index, choice.text)}
                disabled={reveal}
                aria-pressed={chosen}
                class="choice {reveal && choice.correct
                  ? 'is-right'
                  : chosen
                    ? 'is-wrong'
                    : reveal
                      ? 'is-passed'
                      : 'is-open'}"
              >
                <span class="flex items-start gap-3">
                  {#if reveal}
                    <span
                      class="material-symbols-outlined shrink-0 text-[20px] {choice.correct
                        ? 'mark-right'
                        : chosen
                          ? 'mark-wrong'
                          : 'opacity-0'}"
                      aria-hidden="true"
                    >
                      {choice.correct ? "check_circle" : "cancel"}
                    </span>
                  {:else}
                    <span
                      class="mt-1 h-4 w-4 shrink-0 rounded-full border border-slate-300"
                      aria-hidden="true"
                    ></span>
                  {/if}
                  <span class="min-w-0">
                    {choice.text}
                    {#if reveal && (choice.correct || chosen)}
                      <span class="mt-1 block text-sm opacity-90">{choice.why}</span>
                    {/if}
                  </span>
                </span>
              </button>
            {/each}
          </div>
        </fieldset>

        {#if tool && toolAfter === index + 1}
          <div class="mt-5 rounded-2xl border border-slate-200 bg-white p-4 xl:hidden">
            <p class="text-sm font-semibold text-gray-900">
              {m.quiz_tool_title()}
            </p>
            {@render tool()}
          </div>
        {/if}
      </li>
    {/each}
  </ol>

  <div
    class="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6"
    role="status"
    aria-live="polite"
  >
    {#if !done}
      <p class="text-sm text-gray-600">
        {m.quiz_answered_status({ answered: String(answered), total: String(questions.length) })}
      </p>
    {:else}
      <p class="text-lg font-semibold text-gray-900">
        {m.quiz_result({ right: String(right), total: String(questions.length) })}
      </p>
      <p class="mt-2 text-sm leading-6 text-gray-600">
        {#if right === questions.length}
          {m.quiz_perfect()}
        {:else if right >= questions.length - 1}
          {m.quiz_one_wrong()}
        {:else}
          {m.quiz_retry_help()}
        {/if}
      </p>
      <button
        type="button"
        onclick={again}
        class="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
      >
        <span class="material-symbols-outlined text-[18px]" aria-hidden="true"
          >restart_alt</span
        >
        {m.quiz_restart()}
      </button>
    {/if}
  </div>
</div>

<style>
  .choice {
    display: block;
    width: 100%;
    border-radius: 0.75rem;
    border: 1px solid;
    padding: 0.75rem 1rem;
    text-align: left;
    font-size: 0.875rem;
    line-height: 1.5rem;
    transition:
      background-color 120ms,
      border-color 120ms;
  }
  .choice:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #3e7bff;
  }

  .is-open {
    border-color: #e2e8f0;
    color: #111827;
  }
  .is-open:hover {
    border-color: #94a3b8;
    background: #f8fafc;
  }
  .is-passed {
    border-color: #e2e8f0;
    color: #6b7280;
  }
  .is-right {
    border-color: #6ee7b7;
    background: #ecfdf5;
    color: #064e3b;
  }
  .is-wrong {
    border-color: #fca5a5;
    background: #fef2f2;
    color: #7f1d1d;
  }
  .mark-right {
    color: #059669;
  }
  .mark-wrong {
    color: #dc2626;
  }

  :global(html[data-theme="dark"]) .is-open {
    border-color: #334155;
    color: #e2e8f0;
  }
  :global(html[data-theme="dark"]) .is-open:hover {
    border-color: #64748b;
    background: #1e293b;
  }
  :global(html[data-theme="dark"]) .is-passed {
    border-color: #334155;
    color: #94a3b8;
  }
  :global(html[data-theme="dark"]) .is-right {
    border-color: #047857;
    background: #052e23;
    color: #d1fae5;
  }
  :global(html[data-theme="dark"]) .is-wrong {
    border-color: #b91c1c;
    background: #3b0d0d;
    color: #fee2e2;
  }
  :global(html[data-theme="dark"]) .mark-right {
    color: #34d399;
  }
  :global(html[data-theme="dark"]) .mark-wrong {
    color: #f87171;
  }

  ol.quiz-questions {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  ol.quiz-questions > :global(li) {
    margin: 0;
    padding: 0;
  }
</style>
