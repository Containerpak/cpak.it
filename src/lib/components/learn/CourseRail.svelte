<script lang="ts">
  // The course, listed. The same list serves the column on a wide screen and
  // the panel a phone opens, so there is one place where a lesson's state is
  // decided and one place to fix when it is wrong.
  import {
    lessonKey,
    lessonsOf,
    progressLine,
    type Course,
    type Lesson,
    type LessonState,
  } from "$lib/learn/course";

  let {
    course,
    current,
    done = new Set<string>(),
    onnavigate = () => {},
  }: {
    course: Course;
    /** The slug of the lesson being read. */
    current: string;
    /** Lesson keys this browser has been marked through. */
    done?: Set<string>;
    /** The phone panel closes itself when a lesson is chosen. */
    onnavigate?: () => void;
  } = $props();

  let total = $derived(lessonsOf(course).length);
  let finished = $derived(done.size);

  function stateOf(lesson: Lesson): LessonState {
    if (lesson.slug === current) return "current";
    return done.has(lessonKey(course, lesson)) ? "done" : "not started";
  }

  const MARK: Record<LessonState, string> = {
    done: "check_circle",
    current: "radio_button_checked",
    "not started": "radio_button_unchecked",
  };
</script>

<nav aria-label={course.title}>
  <p class="text-xs font-bold tracking-wide text-slate-500 uppercase">Course</p>
  <a
    href={course.href}
    class="mt-1 block text-base leading-6 font-semibold text-gray-900 hover:underline"
  >
    {course.title}
  </a>
  <a
    href={course.href}
    class="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#4670EC] hover:underline"
  >
    <span class="material-symbols-outlined text-base" aria-hidden="true"
      >grid_view</span
    >
    Course overview
  </a>

  <p class="mt-4 text-xs text-gray-500">{progressLine(finished, total)}</p>
  <div
    class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax={total}
    aria-valuenow={finished}
    aria-label="Lessons completed"
  >
    <div
      class="h-full rounded-full bg-[#4670EC]"
      style={`width: ${total === 0 ? 0 : Math.round((finished / total) * 100)}%`}
    ></div>
  </div>

  <div class="mt-7 space-y-7">
    {#each course.modules as module (module.title)}
      <div>
        <p
          class="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase"
        >
          {module.title}
        </p>
        <ul class="space-y-0.5">
          {#each module.lessons as lesson (lesson.slug)}
            {@const state = stateOf(lesson)}
            <li>
              <a
                href={lesson.href}
                onclick={onnavigate}
                aria-current={state === "current" ? "page" : undefined}
                class="flex items-start gap-2 rounded-lg px-3 py-2 text-sm leading-5 transition {state ===
                'current'
                  ? 'bg-[#4670EC]/10 font-semibold text-[#3158c7]'
                  : 'text-slate-600 hover:bg-white hover:text-slate-950'}"
              >
                <span
                  class="material-symbols-outlined mt-px shrink-0 text-[16px] leading-5 {state ===
                  'done'
                    ? 'text-[#4670EC]'
                    : 'text-slate-400'}"
                  aria-hidden="true"
                >
                  {MARK[state]}
                </span>
                <span class="min-w-0">
                  {lesson.title}
                  {#if lesson.kind === "test"}
                    <span class="block text-xs font-normal text-slate-500">
                      The test
                    </span>
                  {/if}
                  <span class="sr-only">, {state}</span>
                </span>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</nav>
