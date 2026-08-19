<script lang="ts">
  // The shell every lesson and every test sits in.
  //
  // Three columns. The rail on the left is the course and it never goes away,
  // not while a lesson is read and not while a test is sat, because somebody
  // who does not pass has to be able to walk back into the lesson they missed
  // and come out again without leaving the course. The centre is the text and
  // it is a text column: one measure, one heading hierarchy, nothing else. The
  // right is the playground, and only when the lesson names one. A lesson that
  // names none does not get an empty panel: the centre takes the width.
  //
  // A reader who wants none of the furniture collapses the rail, and that
  // choice is remembered, so it is made once rather than on every lesson.
  import { onMount, type Snippet } from "svelte";
  import CourseRail from "$lib/components/learn/CourseRail.svelte";
  import {
    completedIn,
    lessonKey,
    lessonsOf,
    positionOf,
    type Course,
    type Lesson,
  } from "$lib/learn/course";
  import { markDone } from "$lib/learn/progress";
  import type { PlaygroundStatus } from "$lib/learn/playgrounds";

  let {
    course,
    lesson,
    playground = null,
    playgroundTitle = "",
    playgroundLink = null,
    playgroundStatus = null,
    children,
  }: {
    course: Course;
    /** The lesson being read. It has to be one of the course's own. */
    lesson: Lesson;
    /** The board, when this lesson has one. Absent is the common case. */
    playground?: Snippet | null;
    playgroundTitle?: string;
    /** Where the same board lives on its own, for somebody who wants it alone. */
    playgroundLink?: { href: string; label: string } | null;
    /** What the board says about the decision module, said once, here. */
    playgroundStatus?: PlaygroundStatus | null;
    children: Snippet;
  } = $props();

  const RAIL = "cpak-learn-rail";

  let railShown = $state(true);
  let panelOpen = $state(false);
  let done = $state(new Set<string>());

  let place = $derived(positionOf(course, lesson.slug));
  let module = $derived(
    course.modules.find((group) =>
      group.lessons.some((entry) => entry.slug === lesson.slug),
    ),
  );
  let total = $derived(lessonsOf(course).length);

  onMount(() => {
    try {
      railShown = localStorage.getItem(RAIL) !== "collapsed";
    } catch {
      // A browser that will not remember it still shows the rail.
    }
    done = completedIn(course);
  });

  function toggleRail() {
    railShown = !railShown;
    try {
      localStorage.setItem(RAIL, railShown ? "shown" : "collapsed");
    } catch {
      // The choice still holds for this page.
    }
  }

  // Reaching the next lesson is what marks this one read. Nothing here checks
  // that it was understood, and the account page says so in those words.
  function advance() {
    const key = lessonKey(course, lesson);
    done = new Set([...done, key]);
    void markDone({
      lesson: key,
      title: lesson.title,
      course: course.slug,
      courseTitle: course.title,
      courseTotal: total,
    });
  }
</script>

<div class="mx-auto flex max-w-[110rem] gap-8 px-4 py-8 sm:px-6 lg:py-10">
  {#if railShown}
    <aside class="hidden w-64 shrink-0 lg:block">
      <div class="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto pr-4">
        <CourseRail {course} current={lesson.slug} {done} />
      </div>
    </aside>
  {/if}

  <div class="flex min-w-0 flex-1 flex-col">
    <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
      <nav aria-label="Breadcrumb" class="min-w-0 text-sm">
        <ol class="flex flex-wrap items-center gap-2 text-slate-500">
          <li>
            <a href="/learn" class="font-medium text-[#4670EC] hover:underline"
              >Learn</a
            >
          </li>
          <li aria-hidden="true">/</li>
          <li class="min-w-0">
            <a
              href={course.href}
              class="font-medium text-[#4670EC] hover:underline"
            >
              {course.title}
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">
            Lesson {place.number} of {place.total}
          </li>
        </ol>
      </nav>

      <button
        type="button"
        onclick={toggleRail}
        aria-pressed={!railShown}
        class="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none lg:inline-flex"
      >
        <span class="material-symbols-outlined text-[18px]" aria-hidden="true">
          {railShown ? "open_in_full" : "close_fullscreen"}
        </span>
        {railShown ? "Full width" : "Show the course"}
      </button>
    </div>

    <div class="mt-4 lg:hidden">
      <button
        type="button"
        onclick={() => (panelOpen = !panelOpen)}
        aria-expanded={panelOpen}
        aria-controls="course-panel"
        class="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-900"
      >
        <span class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px]" aria-hidden="true"
            >list</span
          >
          {course.title}
        </span>
        <span class="material-symbols-outlined text-[20px]" aria-hidden="true">
          {panelOpen ? "expand_less" : "expand_more"}
        </span>
      </button>
      {#if panelOpen}
        <div
          id="course-panel"
          class="mt-3 rounded-2xl border border-slate-200 bg-white p-4"
        >
          <CourseRail
            {course}
            current={lesson.slug}
            {done}
            onnavigate={() => (panelOpen = false)}
          />
        </div>
      {/if}
    </div>

    <div
      class={playground
        ? "mt-5 grid items-start gap-6 xl:grid-cols-[minmax(0,34rem)_minmax(0,1fr)]"
        : "mt-5"}
    >
      <article
        class={playground
          ? "min-w-0 rounded-2xl border border-slate-200 bg-white px-6 py-8 sm:px-8"
          : "mx-auto w-full max-w-3xl min-w-0 rounded-2xl border border-slate-200 bg-white px-6 py-8 sm:px-8"}
      >
        {#if module}
          <p class="text-xs font-bold tracking-wide text-slate-500 uppercase">
            {module.title}
          </p>
        {/if}
        <h1
          class="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
        >
          {lesson.title}
        </h1>
        <div class="doc-body mt-6">
          {@render children()}
        </div>
      </article>

      {#if playground}
        <section
          aria-labelledby="playground-heading"
          class="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
        >
          <div
            class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
          >
            <h2
              id="playground-heading"
              class="text-sm font-semibold text-gray-900"
            >
              {playgroundTitle || "Playground"}
            </h2>
            {#if playgroundLink}
              <a
                href={playgroundLink.href}
                class="text-sm font-medium text-[#4670EC] hover:underline"
              >
                {playgroundLink.label}
              </a>
            {/if}
          </div>

          {#if playgroundStatus}
            <p
              class="mt-1 text-xs leading-5 text-gray-500"
              role="status"
              aria-live="polite"
            >
              {#if playgroundStatus.phase === "ready"}
                Answered by cpak {playgroundStatus.version} running in this tab. Nothing
                you type is sent anywhere.
              {:else if playgroundStatus.phase === "loading"}
                Loading cpak's decision module.
              {:else}
                {playgroundStatus.error ||
                  "The decision module could not be loaded."}
                <button
                  type="button"
                  onclick={() => playgroundStatus?.retry()}
                  class="font-medium text-[#4670EC] hover:underline"
                >
                  Try again
                </button>
              {/if}
            </p>
          {/if}

          <div class="mt-4">
            {@render playground()}
          </div>
        </section>
      {/if}
    </div>

    <div
      class="sticky bottom-0 z-10 mt-8 flex items-center justify-between gap-4 border-t border-slate-200 bg-white py-3"
    >
      {#if place.previous}
        <a
          href={place.previous.href}
          class="inline-flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-slate-100"
        >
          <span class="material-symbols-outlined text-[18px]" aria-hidden="true"
            >arrow_back</span
          >
          <span class="truncate">Previous</span>
        </a>
      {:else}
        <a
          href={course.href}
          class="inline-flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-slate-100"
        >
          <span class="material-symbols-outlined text-[18px]" aria-hidden="true"
            >arrow_back</span
          >
          <span class="truncate">
            <span class="sm:hidden">Overview</span>
            <span class="hidden sm:inline">Course overview</span>
          </span>
        </a>
      {/if}

      {#if place.next}
        <a
          href={place.next.href}
          onclick={advance}
          class="inline-flex min-w-0 items-center gap-2 rounded-full bg-[#3E7BFF] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          <span class="truncate">
            Next<span class="hidden sm:inline">: {place.next.title}</span>
          </span>
          <span class="material-symbols-outlined text-[18px]" aria-hidden="true"
            >arrow_forward</span
          >
        </a>
      {:else}
        <a
          href={course.href}
          onclick={advance}
          class="inline-flex min-w-0 items-center gap-2 rounded-full bg-[#3E7BFF] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          <span class="truncate">Finish the course</span>
          <span class="material-symbols-outlined text-[18px]" aria-hidden="true"
            >arrow_forward</span
          >
        </a>
      {/if}
    </div>
  </div>
</div>
