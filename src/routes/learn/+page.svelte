<script lang="ts">
  // The way in. It answers one question before anything else: what is this.
  //
  // Every section is the same shape, because the reader learns it once: what
  // this is on the left, and on the right the one way in with the size of it
  // written next to the button. Nothing is announced without being shown, so
  // the exams and the playgrounds are listed here rather than linked to.
  import Seo from "$lib/components/Seo.svelte";
  import { PLAYGROUNDS, type PlaygroundId } from "$lib/learn/playgrounds";
  import { shapeOf } from "$lib/learn/course";
  import { COURSE as START } from "./start/course";
  import { COURSE as PACKAGING } from "./packaging/course";
  import { COURSE as ADMINISTRATION } from "./administration/course";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const ORDER: PlaygroundId[] = [
    "permissions",
    "filesystem",
    "ceiling",
    "migration",
    "desktop-entry",
  ];

  // Read off the courses themselves, so a count here cannot drift from the
  // count on the course page.
  function saying(course: typeof START) {
    const shape = shapeOf(course);
    const lessons = `${shape.lessons} ${shape.lessons === 1 ? "lesson" : "lessons"}`;
    const quizzes = shape.quizzes === 1 ? "a quiz" : `${shape.quizzes} quizzes`;
    return shape.quizzes === 0
      ? `${lessons}, about ${shape.minutes} minutes`
      : `${lessons} and ${quizzes}, about ${shape.minutes} minutes`;
  }

  const AUDIENCES = [
    {
      course: PACKAGING,
      heading: "Packaging an application",
      sentence:
        "Write a manifest cpak accepts, ask for the access your program needs, and ship a desktop entry that survives being exported.",
      action: "Start the packaging course",
      reference: { href: "/docs/manifest", label: "Read the manifest reference" },
      ground: "audience-blue",
      note: "The filesystem and desktop entry playgrounds sit beside the text.",
    },
    {
      course: ADMINISTRATION,
      heading: "Running cpak on machines you look after",
      sentence:
        "Set one policy for other people's installations, and be able to say exactly what it closes and what it leaves open.",
      action: "Start the administration course",
      reference: {
        href: "/docs/managed-deployment",
        label: "Read the docs on managed deployment",
      },
      ground: "audience-green",
      note: "The ceiling playground sits beside the text.",
    },
  ];
</script>

<Seo
  title="Learn - cpak"
  description="Learn cpak by changing something and reading what it decides. Courses that assume nothing, playgrounds that run cpak's own decision code in the page, and exams that issue a credential."
  path="/learn"
/>

<section class="border-b border-slate-200 bg-slate-50">
  <div
    class="mx-auto grid max-w-6xl gap-x-12 gap-y-10 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-center lg:py-20"
  >
    <div class="min-w-0">
      <h1
        class="text-5xl font-extrabold tracking-tight text-gray-900 lg:text-6xl"
      >
        Learn cpak
      </h1>
      <p class="mt-6 text-xl leading-9 text-gray-600">
        cpak installs applications that start with nothing and get only what
        they asked for in writing. Here you change that writing and read what
        cpak decides, in the page.
      </p>
      <p class="mt-8 text-xs font-bold tracking-wide text-slate-500 uppercase">
        New to cpak
      </p>
      <h2 class="mt-2 text-2xl font-bold text-gray-900">{START.title}</h2>
      <p class="mt-2 max-w-xl leading-7 text-gray-600">
        Assuming nothing. What cpak is, what you are shown before you install
        something, and what an application is allowed to do afterwards.
      </p>
    </div>

    <div class="lg:text-right">
      <a
        href={START.href}
        class="inline-flex items-center gap-2 rounded-full bg-[#4670EC] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3158c7] focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Start the course
        <span class="material-symbols-outlined text-lg" aria-hidden="true"
          >arrow_forward</span
        >
      </a>
      <p class="mt-3 text-sm text-slate-600">{saying(START)}</p>
    </div>
  </div>
</section>

{#each AUDIENCES as audience (audience.heading)}
  <section class="{audience.ground} border-b border-slate-200">
    <div
      class="mx-auto grid max-w-6xl gap-x-12 gap-y-8 px-6 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-center"
    >
      <div class="min-w-0">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900">
          {audience.heading}
        </h2>
        <p class="mt-3 text-lg leading-8 text-gray-700">{audience.sentence}</p>
        <p class="mt-3 text-sm leading-6 text-gray-600">{audience.note}</p>
      </div>

      <div class="lg:text-right">
        <a
          href={audience.course.href}
          class="audience-action inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {audience.action}
          <span class="material-symbols-outlined text-base" aria-hidden="true"
            >arrow_forward</span
          >
        </a>
        <p class="mt-3 text-sm text-slate-600">{saying(audience.course)}</p>
        <a
          href={audience.reference.href}
          class="audience-reference mt-3 inline-block text-sm font-medium underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
        >
          {audience.reference.label}
        </a>
      </div>
    </div>
  </section>
{/each}

<section class="border-b border-slate-200 bg-slate-50">
  <div class="mx-auto max-w-6xl px-6 py-14">
    <div class="max-w-2xl">
      <h2 class="text-3xl font-bold tracking-tight text-gray-900">Exams</h2>
      <p class="mt-3 text-lg leading-8 text-gray-700">
        A quiz tells you whether you understood a course. An exam decides
        something: pass one and a credential is issued under your account, with
        a page anyone can read.
      </p>
    </div>

    <ul class="mt-8 grid gap-4 sm:grid-cols-2">
      {#each data.exams as exam (exam.id)}
        <li>
          <a
            href="/learn/exams/{exam.id}"
            class="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
          >
            <span class="text-lg font-semibold text-gray-900">{exam.title}</span
            >
            <span class="mt-2 text-sm text-slate-600">
              {exam.questions} questions, {Math.round(exam.pass * 100)} per cent
              to pass
            </span>
            <span class="mt-2 flex-1 text-sm leading-6 text-gray-600">
              Follows {exam.course.title}.
            </span>
            <span
              class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#4670EC]"
            >
              Sit it
              <span class="material-symbols-outlined text-base" aria-hidden="true"
                >arrow_forward</span
              >
            </span>
          </a>
        </li>
      {/each}
    </ul>
  </div>
</section>

<section id="playgrounds" class="mx-auto max-w-6xl px-6 py-16">
  <div class="max-w-2xl">
    <h2 class="text-3xl font-bold tracking-tight text-gray-900">Playgrounds</h2>
    <p class="mt-3 text-lg leading-8 text-gray-600">
      Five tools you can open on their own. Each one asks cpak a question and
      shows you the answer, the same way it would answer on your machine.
    </p>
  </div>

  <ul class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each ORDER as id (id)}
      {@const tool = PLAYGROUNDS[id]}
      <li>
        <a
          href={tool.href}
          class="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
        >
          <span class="text-lg font-semibold text-gray-900">{tool.title}</span>
          <span class="mt-2 flex-1 text-sm leading-6 text-gray-600"
            >{tool.sentence}</span
          >
          <span
            class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#4670EC]"
          >
            Open
            <span class="material-symbols-outlined text-base" aria-hidden="true"
              >arrow_forward</span
            >
          </span>
        </a>
      </li>
    {/each}
  </ul>
</section>

<style>
  .audience-blue {
    background: #eef2fd;
  }
  .audience-green {
    background: #eaf4ef;
  }
  :global(html[data-theme="dark"]) .audience-blue {
    background: #131c33;
  }
  :global(html[data-theme="dark"]) .audience-green {
    background: #10231c;
  }

  /* Sits on a white card inside a tinted section, so it takes its own colours
     rather than the page's. */
  .audience-action {
    border-color: #0f172a;
    color: #0f172a;
  }
  .audience-action:hover {
    background: #0f172a;
    color: #fff;
  }
  :global(html[data-theme="dark"]) .audience-action {
    border-color: #cbd5e1;
    color: #f1f5f9;
  }
  :global(html[data-theme="dark"]) .audience-action:hover {
    background: #e2e8f0;
    color: #0f172a;
  }

  .audience-reference {
    color: #334155;
  }
  .audience-reference:hover {
    color: #0f172a;
  }
  :global(html[data-theme="dark"]) .audience-reference {
    color: #cbd5e1;
  }
  :global(html[data-theme="dark"]) .audience-reference:hover {
    color: #fff;
  }
</style>
