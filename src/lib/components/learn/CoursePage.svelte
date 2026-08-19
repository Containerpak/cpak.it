<script lang="ts">
  // The overview of a course: what it is, how far you are, and one way in.
  //
  // The curriculum is the page rather than something behind a tab, because what
  // you will do is a better reason to start than a paragraph about what the
  // course is. The paragraph is above it and it is short.
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
    minutes,
    summary,
    audience,
  }: {
    course: Course;
    /** Honest, and rounded to something a person would say. */
    minutes: number;
    /** Two sentences at most. What somebody gets out of it. */
    summary: string;
    /** Who it is for, and what it assumes. */
    audience: string;
  } = $props();

  let order = $derived(lessonsOf(course));

  let done = $state(new Set<string>());
  $effect(() => {
    done = completedIn(course);
  });

  let finished = $derived(done.size);
  // Where the primary action goes: the first lesson not yet marked through, or
  // the beginning again once the whole course is done.
  let next = $derived(
    order.find((lesson) => !done.has(lessonKey(course, lesson))) ?? order[0],
  );
  let started = $derived(finished > 0);

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
          {order.length}
          {order.length === 1 ? "lesson" : "lessons"}, about {minutes} minutes
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
          {started ? "Resume" : "Start the course"}
          <span class="material-symbols-outlined text-lg" aria-hidden="true"
            >arrow_forward</span
          >
        </a>
        {#if started}
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
      {/if}
    {/each}
  </div>
</section>
