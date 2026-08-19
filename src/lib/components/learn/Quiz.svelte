<script lang="ts">
  // A quiz at the end of a course.
  //
  // It exists to make somebody answer, not to grade them. Every question is
  // one a reader who understood the course can answer and a reader who skimmed
  // it cannot, which is why the wrong answers are the things people actually
  // believe about cpak rather than nonsense nobody would pick. Answering shows
  // why, straight away: being told a week later is being told nothing.
  //
  // Nothing is recorded anywhere and no credential comes out of it. That is
  // what separates a quiz from an exam here, and the page says so rather than
  // leaving somebody to wonder what they have just signed up for.

  export type Choice = { text: string; correct?: boolean; why: string };
  export type Question = { asks: string; choices: Choice[] };

  let { questions }: { questions: Question[] } = $props();

  // One slot per question, all unanswered. Read from the prop once, which is
  // what it is for: a page shows one quiz and never swaps the questions under
  // the reader.
  // svelte-ignore state_referenced_locally
  let answers = $state<(number | null)[]>(questions.map(() => null));
  let right = $derived(
    answers.filter(
      (given, index) => given !== null && questions[index].choices[given].correct,
    ).length,
  );
  let answered = $derived(answers.filter((given) => given !== null).length);
  let done = $derived(answered === questions.length);

  function answer(question: number, choice: number) {
    if (answers[question] !== null) return; // one answer per question
    answers[question] = choice;
  }

  function again() {
    answers = questions.map(() => null);
  }
</script>

<div class="not-prose">
  <p class="text-base leading-7 text-gray-600">
    {questions.length} questions on what you have just read. Nothing is recorded
    and nothing is issued for it: it is here so you find out which of the four
    lessons to read again, while you still have them open in the rail. One of
    them needs the playground beside this text.
  </p>

  <ol class="quiz-questions mt-8 space-y-10">
    {#each questions as question, index (question.asks)}
      {@const given = answers[index]}
      <li>
        <fieldset>
          <legend class="text-lg font-semibold text-gray-900">
            <span class="text-slate-400">{index + 1}.</span>
            {question.asks}
          </legend>
          <div class="mt-4 space-y-2">
            {#each question.choices as choice, at (choice.text)}
              {@const chosen = given === at}
              {@const reveal = given !== null}
              <button
                type="button"
                onclick={() => answer(index, at)}
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
        {answered} of {questions.length} answered.
      </p>
    {:else}
      <p class="text-lg font-semibold text-gray-900">
        {right} of {questions.length} right.
      </p>
      <p class="mt-2 text-sm leading-6 text-gray-600">
        {#if right === questions.length}
          Every one. You can read a manifest and say what the application will
          be able to do, which is the whole point of the course.
        {:else if right >= questions.length - 1}
          One to look at again. The answer above says which lesson it came from.
        {:else}
          Worth another pass. The rail on the left keeps every lesson, and
          nothing here is lost by going back.
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
        Start the quiz again
      </button>
    {/if}
  </div>
</div>

<style>
  /* An answered choice has to stay readable on both grounds. The light and the
     dark set are written out rather than left to a single pair of utilities:
     a dark green word on a dark green card is the same mistake as a pale one
     on white, and only one of the two is ever visible to whoever wrote it. */
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

  /* The lesson body styles every ol as prose. These are questions, not a
     numbered list: the number is inside the question, where it can sit next
     to the words rather than in the margin beside a group of buttons. */
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
