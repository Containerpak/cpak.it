<script lang="ts">
  import { onMount } from "svelte";
  import Seo from "$lib/components/Seo.svelte";
  import {
    completedIn,
    lessonKey,
    lessonsOf,
    progressLine,
  } from "$lib/learn/course";
  import { COURSE } from "./course";

  let done = $state(new Set<string>());
  onMount(() => (done = completedIn(COURSE)));

  const order = lessonsOf(COURSE);
  let next = $derived(
    order.find((lesson) => !done.has(lessonKey(COURSE, lesson))) ?? order[0],
  );
  let started = $derived(done.size > 0);
</script>

<Seo
  title="Two lessons on cpak permissions - cpak"
  description="A short course: what a cpak permission grants, and why an administrator's ceiling can only narrow it."
  path="/learn/example"
/>

<div class="mx-auto max-w-5xl px-6 py-10 lg:py-14">
  <nav aria-label="Breadcrumb" class="text-sm">
    <ol class="flex flex-wrap items-center gap-2 text-gray-500">
      <li>
        <a href="/learn" class="font-medium text-[#4670EC] hover:underline"
          >Learn</a
        >
      </li>
      <li aria-hidden="true">/</li>
      <li aria-current="page">{COURSE.title}</li>
    </ol>
  </nav>

  <div class="mt-4 flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
    <div class="min-w-0">
      <h1 class="text-4xl font-extrabold tracking-tight text-gray-900">
        {COURSE.title}
      </h1>
      <p class="mt-3 max-w-2xl text-lg leading-8 text-gray-600">
        What a cpak permission actually hands over, and why the ceiling an
        administrator writes can only take away.
      </p>
    </div>
    <div class="w-full max-w-xs">
      <p class="text-sm text-gray-600">
        {progressLine(done.size, order.length)}
      </p>
      <div
        class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax={order.length}
        aria-valuenow={done.size}
        aria-label="Lessons completed"
      >
        <div
          class="h-full rounded-full bg-[#4670EC]"
          style={`width: ${Math.round((done.size / order.length) * 100)}%`}
        ></div>
      </div>
    </div>
  </div>

  <a
    href={next.href}
    class="mt-8 inline-flex items-center gap-2 rounded-full bg-[#3E7BFF] px-8 py-3 font-semibold text-white transition hover:brightness-110"
  >
    {started ? "Resume" : "Start"}
    <span class="material-symbols-outlined text-[20px]" aria-hidden="true"
      >arrow_forward</span
    >
  </a>

  <h2 class="mt-14 text-sm font-semibold text-gray-900">Curriculum</h2>
  <div class="mt-4 space-y-8">
    {#each COURSE.chapters as chapter (chapter.title)}
      <section>
        <p class="text-xs font-bold tracking-wide text-slate-500 uppercase">
          {chapter.title}
        </p>
        <ul class="mt-3 divide-y divide-slate-200 rounded-2xl bg-white">
          {#each chapter.lessons as lesson (lesson.slug)}
            {@const finished = done.has(lessonKey(COURSE, lesson))}
            <li>
              <a
                href={lesson.href}
                class="flex items-center gap-3 px-5 py-4 hover:bg-slate-100"
              >
                <span
                  class="material-symbols-outlined text-[20px] {finished
                    ? 'text-[#4670EC]'
                    : 'text-slate-400'}"
                  aria-hidden="true"
                >
                  {finished ? "check_circle" : "radio_button_unchecked"}
                </span>
                <span class="min-w-0 flex-1 font-medium text-gray-900">
                  {lesson.title}
                </span>
                <span class="text-sm text-gray-500">
                  {finished ? "Done" : "Not started"}
                </span>
              </a>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  </div>

  <p class="mt-10 max-w-2xl text-sm leading-6 text-gray-500">
    A lesson is marked read by this browser when you press Next, and nothing
    here checks that it was understood. This course carries no test and issues
    nothing.
  </p>
</div>
