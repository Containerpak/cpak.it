<script lang="ts">
  import {
    completedIn,
    lessonKey,
    lessonsOf,
    progressLine,
    type Course,
    type Lesson,
  } from "$lib/learn/course";

  let {
    course,
    summary,
    audience,
    exam = null,
  }: {
    course: Course;
    summary: string;
    audience: string;
    exam?: { id: string; title: string } | null;
  } = $props();

  let order = $derived(lessonsOf(course));

  let done = $state(new Set<string>());
  $effect(() => {
    done = completedIn(course);
  });

  let finished = $derived(done.size);
  let quizzes = $derived(order.filter((entry) => entry.kind === "test").length);
  let reading = $derived(order.length - quizzes);
  let shape = $derived(
    quizzes === 0
      ? `${reading} ${reading === 1 ? "lesson" : "lessons"}`
      : `${reading} ${reading === 1 ? "lesson" : "lessons"} and ${quizzes === 1 ? "a quiz" : `${quizzes} quizzes`}`,
  );
  let next = $derived(
    order.find((lesson) => !done.has(lessonKey(course, lesson))) ?? order[0],
  );
  let started = $derived(finished > 0);
  let complete = $derived(order.length > 0 && finished === order.length);
  let way = $derived(
    complete ? "Read it again" : started ? "Resume" : "Start the course",
  );

  function isDone(lesson: Lesson): boolean {
    return done.has(lessonKey(course, lesson));
  }
</script>

<section class="border-b border-slate-200 bg-slate-50">
  <div class="mx-auto max-w-5xl px-6 py-12 lg:py-16">
    <nav aria-label="Breadcrumb" class="text-sm text-slate-500">
      <a href="/learn" class="hover:underline">Learn</a>
      <span aria-hidden="true" class="px-1.5">/</span>
      <span aria-current="page">{course.title}</span>
    </nav>

    <div class="mt-4 gap-10 lg:flex lg:items-start lg:justify-between">
      <div class="max-w-2xl">
        <h1
          class="text-4xl font-extrabold tracking-tight text-balance text-gray-900"
        >
          {course.title}
        </h1>
        <p class="mt-4 text-lg leading-8 text-gray-600">{summary}</p>
        <p class="mt-3 text-sm text-slate-500">{audience}</p>
      </div>

      <div class="mt-8 w-full shrink-0 lg:mt-1 lg:w-72">
        <p class="text-sm text-slate-600">
          {shape}, about {course.minutes} minutes
        </p>
        <p class="mt-3 text-sm text-slate-500">
          {progressLine(finished, order.length)}
        </p>
        <div
          class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax={order.length}
          aria-valuenow={finished}
          aria-label="Lessons completed"
        >
          <div
            class="h-full rounded-full bg-[#4670EC] transition-[width]"
            style={`width: ${order.length === 0 ? 0 : Math.round((finished / order.length) * 100)}%`}
          ></div>
        </div>
        <a
          href={next?.href}
          class="mt-5 inline-flex items-center gap-2 rounded-full bg-[#4670EC] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3158c7] focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {way}
          <span class="material-symbols-outlined text-lg" aria-hidden="true"
            >arrow_forward</span
          >
        </a>
        {#if complete}
          <p class="mt-3 text-xs text-slate-500">
            Every lesson marked done. Nothing here checked that you understood
            them, and the questions at the end are the closest it comes.
          </p>
        {:else if started}
          <p class="mt-3 text-xs text-slate-500">Next: {next?.title}</p>
        {/if}
      </div>
    </div>
  </div>
</section>

<section class="mx-auto max-w-5xl px-6 py-12">
  <h2 class="text-sm font-bold tracking-wide text-slate-500 uppercase">
    What you will do
  </h2>

  <div class="mt-6 space-y-10">
    {#each course.modules as module, index (module.title)}
      <div>
        <h3 class="text-xl font-bold text-gray-900">
          {module.title}
        </h3>
        <ol class="mt-3 divide-y divide-slate-200 border-y border-slate-200">
          {#each module.lessons as lesson (lesson.slug)}
            <li>
              <a
                href={lesson.href}
                class="group flex items-center gap-3 py-3.5 transition hover:bg-slate-50"
              >
                <span
                  class="material-symbols-outlined shrink-0 text-[20px] {isDone(
                    lesson,
                  )
                    ? 'text-[#4670EC]'
                    : 'text-slate-300'}"
                  aria-hidden="true"
                >
                  {isDone(lesson) ? "check_circle" : "radio_button_unchecked"}
                </span>
                <span class="min-w-0 flex-1 text-gray-900 group-hover:underline"
                  >{lesson.title}</span
                >
                {#if lesson.kind === "test"}
                  <span
                    class="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                    >Quiz</span
                  >
                {/if}
                <span class="sr-only"
                  >, {isDone(lesson) ? "completed" : "not started"}</span
                >
              </a>
            </li>
          {/each}
        </ol>
      </div>
      {#if index === course.modules.length - 1}
        <p class="text-sm text-slate-500">
          Marking a lesson done is kept in this browser. An account keeps it
          across machines, and you can read every lesson without one.
        </p>
        {#if exam}
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p class="text-xs font-bold tracking-wide text-slate-500 uppercase">
              After the course
            </p>
            <h3 class="mt-2 text-xl font-bold text-gray-900">{exam.title}</h3>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              The quiz above tells you whether you understood this. The exam
              decides something: pass it and a credential is issued under your
              account, with a page anyone can read.
            </p>
            <a
              href="/learn/exams/{exam.id}"
              class="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
            >
              Sit the exam
              <span class="material-symbols-outlined text-base" aria-hidden="true"
                >arrow_forward</span
              >
            </a>
          </div>
        {/if}
      {/if}
    {/each}
  </div>
</section>
