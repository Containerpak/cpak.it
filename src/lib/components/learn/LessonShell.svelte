<script lang="ts">
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
  import * as m from "$lib/paraglide/messages.js";

  let {
    course,
    lesson,
    playground = null,
    playgroundTitle = "",
    playgroundLink = null,
    playgroundStatus = null,
    playgroundWideOnly = false,
    children,
  }: {
    course: Course;
    lesson: Lesson;
    playground?: Snippet | null;
    playgroundTitle?: string;
    playgroundLink?: { href: string; label: string } | null;
    playgroundStatus?: PlaygroundStatus | null;
    playgroundWideOnly?: boolean;
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
    } catch {}
    done = completedIn(course);
  });

  function toggleRail() {
    railShown = !railShown;
    try {
      localStorage.setItem(RAIL, railShown ? "shown" : "collapsed");
    } catch {}
  }

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

<div class="flex min-h-[calc(100vh-4rem)]">
  {#if railShown}
    <aside
      class="hidden w-72 shrink-0 self-stretch border-r border-slate-200 bg-slate-50 lg:block"
    >
      <div class="sticky top-0 max-h-screen overflow-y-auto px-5 py-8">
        <CourseRail {course} current={lesson.slug} {done} />
      </div>
    </aside>
  {/if}

  <div class="flex min-w-0 flex-1 flex-col px-4 py-8 sm:px-8 lg:py-10">
    <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
      <nav aria-label="Breadcrumb" class="min-w-0 text-sm">
        <ol class="flex flex-wrap items-center gap-2 text-slate-500">
          <li>
            <a href="/learn" class="font-medium text-[#4670EC] hover:underline"
              >{m.learn()}</a
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
            {m.lesson_position({ current: String(place.number), total: String(place.total) })}
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
        {railShown ? m.full_width() : m.show_course()}
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
          ? "min-w-0 py-2"
          : "mx-auto w-full max-w-3xl min-w-0 py-2"}
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
          class="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 {playgroundWideOnly
            ? 'hidden xl:block'
            : ''}"
        >
          <div
            class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
          >
            <h2
              id="playground-heading"
              class="text-sm font-semibold text-gray-900"
            >
              {playgroundTitle || m.playground()}
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
                {m.cpak_ready()}
              {:else if playgroundStatus.phase === "loading"}
                {m.cpak_loading()}
              {:else}
                {playgroundStatus.error ||
                  m.cpak_failed()}
                <button
                  type="button"
                  onclick={() => playgroundStatus?.retry()}
                  class="font-medium text-[#4670EC] hover:underline"
                >
                  {m.try_again()}
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
          <span class="truncate">{m.previous()}</span>
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
            <span class="sm:hidden">{m.overview()}</span>
            <span class="hidden sm:inline">{m.course_overview()}</span>
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
            {m.next_page()}<span class="hidden sm:inline">: {place.next.title}</span>
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
          <span class="truncate">{m.finish_course()}</span>
          <span class="material-symbols-outlined text-[18px]" aria-hidden="true"
            >arrow_forward</span
          >
        </a>
      {/if}
    </div>
  </div>
</div>
