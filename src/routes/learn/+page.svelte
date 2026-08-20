<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import { PLAYGROUNDS, type PlaygroundId } from "$lib/learn/playgrounds";
  import {
    completedIn,
    lessonKey,
    lessonsOf,
    shapeOf,
    type Course,
  } from "$lib/learn/course";
  import { COURSE as START } from "./start/course";
  import { COURSE as PACKAGING } from "./packaging/course";
  import { COURSE as ADMINISTRATION } from "./administration/course";
  import { COURSE as ENGINEERING } from "./engineering/course";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  let done = $state(new Map<string, Set<string>>());
  $effect(() => {
    const seen = new Map<string, Set<string>>();
    for (const course of [START, PACKAGING, ADMINISTRATION, ENGINEERING]) {
      seen.set(course.slug, completedIn(course));
    }
    done = seen;
  });

  type Standing = {
    label: string;
    note: string;
    next: string;
    completed: number;
    total: number;
  };

  function standing(course: Course, first: string): Standing {
    const shape = shapeOf(course);
    const order = lessonsOf(course);
    const marked = done.get(course.slug) ?? new Set<string>();
    const next = order.find((lesson) => !marked.has(lessonKey(course, lesson)));
    const lessons = `${shape.lessons} ${shape.lessons === 1 ? "lesson" : "lessons"}`;
    const quizzes = shape.quizzes === 1 ? "one quiz" : `${shape.quizzes} quizzes`;
    const size = shape.quizzes === 0 ? lessons : `${lessons}, ${quizzes}`;

    if (marked.size === 0) {
      return {
        label: first,
        note: `${size}, about ${shape.minutes} minutes`,
        next: "",
        completed: 0,
        total: order.length,
      };
    }
    if (!next) {
      return {
        label: "Read it again",
        note: `Completed, about ${shape.minutes} minutes`,
        next: "",
        completed: marked.size,
        total: order.length,
      };
    }
    return {
      label: "Resume",
      note: `${marked.size} of ${order.length} completed`,
      next: next.title,
      completed: marked.size,
      total: order.length,
    };
  }

  function into(course: Course): string {
    const order = lessonsOf(course);
    const marked = done.get(course.slug) ?? new Set<string>();
    if (marked.size === 0) return course.href;
    return (
      order.find((lesson) => !marked.has(lessonKey(course, lesson)))?.href ??
      course.href
    );
  }

  const COURSES = [
    {
      course: START,
      eyebrow: "New to cpak",
      title: "Start here",
      sentence:
        "Understand what cpak changes before installing your first application, then see what a permission actually opens.",
      action: "Start the course",
      icon: "deployed_code",
      art: "course-start",
    },
    {
      course: PACKAGING,
      eyebrow: "Package authors",
      title: "Packaging an application",
      sentence:
        "Build the image, write the manifest, ask for the right access and publish a package people can inspect before installing.",
      action: "Start the course",
      icon: "inventory_2",
      art: "course-package",
    },
    {
      course: ADMINISTRATION,
      eyebrow: "Administrators",
      title: "Running cpak on managed machines",
      sentence:
        "Set the limits of a host, decide who may publish to it and read why an application was refused.",
      action: "Start the course",
      icon: "policy",
      art: "course-admin",
    },
    {
      course: ENGINEERING,
      eyebrow: "Developers",
      title: "Engineering cpak integrations",
      sentence:
        "Trace the runtime, design typed host operations, implement storage drivers and compose optional providers without widening the sandbox.",
      action: "Start the course",
      icon: "developer_board",
      art: "course-engineering",
    },
  ];

  const ORDER: PlaygroundId[] = [
    "permissions",
    "filesystem",
    "ceiling",
    "migration",
    "desktop-entry",
  ];
</script>

<Seo
  title="Learn - cpak"
  description="Learn cpak through complete courses, browser workspaces powered by cpak's own core, role exams and verifiable credentials."
  path="/learn"
/>

<section class="academy-hero border-b border-slate-800 bg-slate-950">
  <div class="mx-auto max-w-6xl px-6 py-16 lg:py-24">
    <h1 class="mt-4 max-w-4xl text-5xl font-extrabold tracking-tight text-white lg:text-7xl">
      Learn how cpak works by making it decide.
    </h1>
    <p class="mt-6 max-w-3xl text-xl leading-9 text-slate-300">
      Follow a course, edit real manifests and run cpak's decision code in the browser. Read everything without an account, then sign in when you want progress across machines or a credential.
    </p>
  </div>
</section>

<section class="bg-white">
  <div class="mx-auto max-w-6xl px-6 py-16">
    <div class="max-w-3xl">
      <p class="text-xs font-bold tracking-wide text-slate-500 uppercase">Courses</p>
      <h2 class="mt-2 text-3xl font-bold tracking-tight text-gray-900">Choose where you are starting</h2>
      <p class="mt-4 text-lg leading-8 text-gray-600">
        Each path has its own curriculum and closing quiz. The professional paths continue into an exam.
      </p>
    </div>

  <div class="mt-8 grid gap-5 lg:grid-cols-2">
      {#each COURSES as item (item.course.slug)}
        {@const state = standing(item.course, item.action)}
      <article class="course-card flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm sm:flex-row">
          <div class="{item.art} relative h-24 shrink-0 overflow-hidden sm:h-auto sm:w-24">
            <span class="course-grid" aria-hidden="true"></span>
            <span class="course-symbols" aria-hidden="true">
              {#each Array(8) as _}
                <span class="material-symbols-outlined">{item.icon}</span>
              {/each}
            </span>
            <span class="absolute inset-0 z-10 flex items-center justify-center" aria-hidden="true">
              <span class="material-symbols-outlined leading-none text-white" style="font-size: 2.25rem">{item.icon}</span>
            </span>
          </div>
        <div class="flex min-w-0 flex-1 flex-col p-5">
          <p class="text-xs font-bold tracking-wide text-slate-500 uppercase">{item.eyebrow}</p>
          <h3 class="mt-2 text-2xl font-bold tracking-tight text-gray-900">{item.title}</h3>
          <p class="mt-3 flex-1 text-sm leading-6 text-gray-600">{item.sentence}</p>

          {#if state.completed > 0}
            <div class="mt-5">
              <div
                class="h-1.5 overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax={state.total}
                aria-valuenow={state.completed}
                aria-label="Course progress"
              >
                <div
                  class="h-full rounded-full bg-[#4670EC]"
                  style={`width: ${state.total === 0 ? 0 : Math.round((state.completed / state.total) * 100)}%`}
                ></div>
              </div>
            </div>
          {/if}

          <p class="mt-4 text-xs leading-5 text-slate-500">{state.note}</p>
          {#if state.next}
            <p class="mt-1 truncate text-xs text-slate-500">Next: {state.next}</p>
          {/if}
          <a
            href={into(item.course)}
            class="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#4670EC] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3158c7] focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {state.label}
            <span class="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
          </a>
        </div>
        </article>
      {/each}
    </div>
  </div>
</section>

<section id="credentials" class="border-y border-slate-200 bg-slate-50">
  <div class="mx-auto max-w-6xl px-6 py-16">
    <div class="max-w-3xl">
        <p class="text-xs font-bold tracking-wide text-slate-500 uppercase">Credentials</p>
        <h2 class="mt-2 text-3xl font-bold tracking-tight text-gray-900">Prove what you can operate</h2>
        <p class="mt-4 text-lg leading-8 text-gray-600">
          Course quizzes stay in the course. Role exams are marked on the server and issue a signed credential with a public verification page.
        </p>
    </div>

      <ul class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.exams as exam (exam.id)}
          <li>
            <a
              href="/learn/exams/{exam.id}"
              class="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-[#7DA2FF] hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
            >
              <span class="material-symbols-outlined text-3xl text-[#4670EC]" aria-hidden="true">workspace_premium</span>
              <span class="mt-5 text-xl font-bold text-gray-900">{exam.title}</span>
              <span class="mt-2 text-sm leading-6 text-gray-600">{exam.questions} questions, {Math.round(exam.pass * 100)} per cent to pass.</span>
              <span class="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#4670EC] no-underline group-hover:no-underline">
                View the exam
                <span class="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
              </span>
            </a>
          </li>
        {/each}
      </ul>
  </div>
</section>

<section id="playgrounds" class="bg-white">
  <div class="mx-auto max-w-6xl px-6 py-16">
    <div class="max-w-3xl">
    <p class="text-xs font-bold tracking-wide text-slate-500 uppercase">Workspaces</p>
    <h2 class="mt-2 text-3xl font-bold tracking-tight text-gray-900">Use cpak before touching your machine</h2>
    <p class="mt-4 text-lg leading-8 text-gray-600">
      These run a pinned build of cpak's own decision code in your browser. Write the input you would use on Linux and read the same validation, policy or migration answer.
    </p>
    </div>

    <ul class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each ORDER as id (id)}
        {@const tool = PLAYGROUNDS[id]}
        <li>
        <a
          href={tool.href}
          class="workspace-card group flex h-full min-h-56 flex-col rounded-2xl border border-slate-200 bg-white p-6 no-underline transition hover:border-[#7DA2FF] hover:no-underline hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
        >
          <span class="material-symbols-outlined text-3xl text-[#4670EC]" aria-hidden="true">terminal</span>
          <span class="mt-5 text-lg font-bold text-gray-900">{tool.title}</span>
          <span class="mt-2 flex-1 text-sm leading-6 text-gray-600">{tool.sentence}</span>
          <span class="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#4670EC] no-underline group-hover:no-underline">
            Open workspace
            <span class="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
          </span>
        </a>
        </li>
      {/each}
    </ul>
  </div>
</section>

<style>
  .academy-hero {
    background: transparent;
  }

  .course-start {
    background: linear-gradient(145deg, #3158c7, #7195ff);
  }

  .course-package {
    background: linear-gradient(145deg, #6844d5, #9f7aea);
  }

  .course-admin {
    background: linear-gradient(145deg, #08755c, #20a981);
  }

  .course-engineering {
    background: linear-gradient(145deg, #a33b1f, #f07a45);
  }

  .course-grid {
    position: absolute;
    inset: 0;
    opacity: 0.2;
    background-image:
      linear-gradient(rgb(255 255 255 / 45%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(255 255 255 / 45%) 1px, transparent 1px);
    background-size: 24px 24px;
    mask-image: linear-gradient(to top right, black, transparent 72%);
  }

  .workspace-card,
  .workspace-card:hover,
  .workspace-card:focus-visible,
  .workspace-card :global(*) {
    text-decoration: none;
  }

  .course-symbols {
    position: absolute;
    inset: 0;
    color: white;
    opacity: 0.1;
  }

  .course-symbols :global(.material-symbols-outlined) {
    position: absolute;
    font-size: 1.75rem;
  }

  .course-symbols :global(.material-symbols-outlined:nth-child(1)) {
    top: 4%;
    left: 10%;
    transform: rotate(-12deg);
  }

  .course-symbols :global(.material-symbols-outlined:nth-child(2)) {
    top: 17%;
    left: 58%;
    transform: rotate(9deg);
  }

  .course-symbols :global(.material-symbols-outlined:nth-child(3)) {
    top: 31%;
    left: 5%;
    transform: rotate(14deg);
  }

  .course-symbols :global(.material-symbols-outlined:nth-child(4)) {
    top: 43%;
    left: 62%;
    transform: rotate(-8deg);
  }

  .course-symbols :global(.material-symbols-outlined:nth-child(5)) {
    top: 58%;
    left: 16%;
    transform: rotate(-16deg);
  }

  .course-symbols :global(.material-symbols-outlined:nth-child(6)) {
    top: 69%;
    left: 56%;
    transform: rotate(12deg);
  }

  .course-symbols :global(.material-symbols-outlined:nth-child(7)) {
    top: 83%;
    left: 2%;
    transform: rotate(7deg);
  }

  .course-symbols :global(.material-symbols-outlined:nth-child(8)) {
    top: 91%;
    left: 66%;
    transform: rotate(-11deg);
  }

  @media (max-width: 639px) {
    .course-symbols :global(.material-symbols-outlined:nth-child(n)) {
      top: 34%;
    }

    .course-symbols :global(.material-symbols-outlined:nth-child(1)) { left: 3%; }
    .course-symbols :global(.material-symbols-outlined:nth-child(2)) { left: 16%; }
    .course-symbols :global(.material-symbols-outlined:nth-child(3)) { left: 29%; }
    .course-symbols :global(.material-symbols-outlined:nth-child(4)) { left: 42%; }
    .course-symbols :global(.material-symbols-outlined:nth-child(5)) { left: 55%; }
    .course-symbols :global(.material-symbols-outlined:nth-child(6)) { left: 68%; }
    .course-symbols :global(.material-symbols-outlined:nth-child(7)) { left: 81%; }
    .course-symbols :global(.material-symbols-outlined:nth-child(8)) { left: 94%; }
  }

  .course-card {
    transition:
      transform 160ms ease,
      box-shadow 160ms ease;
  }

  .course-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 40px rgb(15 23 42 / 10%);
  }

  @media (prefers-reduced-motion: reduce) {
    .course-card {
      transition: none;
    }

    .course-card:hover {
      transform: none;
    }
  }
</style>
