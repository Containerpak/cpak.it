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
    Five questions on what you have just read. Nothing is recorded and no
    certificate comes out of it: it is here so you find out which of the four
    lessons to read again, while you still have them open in the rail.
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
                class="block w-full rounded-xl border px-4 py-3 text-left text-sm leading-6 transition
                  {reveal && choice.correct
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : chosen
                    ? 'border-red-300 bg-red-50 text-red-900'
                    : reveal
                      ? 'border-slate-200 text-gray-500'
                      : 'border-slate-200 text-gray-900 hover:border-slate-400 hover:bg-slate-50'}
                  focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
              >
                <span class="flex items-start gap-3">
                  {#if reveal}
                    <span
                      class="material-symbols-outlined shrink-0 text-[20px] {choice.correct
                        ? 'text-emerald-600'
                        : chosen
                          ? 'text-red-600'
                          : 'text-transparent'}"
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
