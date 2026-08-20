<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<Seo
  title="Exams - cpak"
  description="Sit a cpak exam for a credential. Open book, unproctored, on your own machine, and what it attests is an exam result under an account and nothing more."
  path="/learn/exams"
/>

<section class="border-b border-slate-200 bg-slate-50">
  <div class="mx-auto max-w-5xl px-6 py-14 lg:py-16">
    <nav aria-label="Breadcrumb" class="text-sm text-slate-500">
      <a href="/learn" class="hover:underline">Learn</a>
      <span aria-hidden="true" class="px-1.5">/</span>
      <span aria-current="page">Exams</span>
    </nav>
    <h1
      class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 lg:text-5xl"
    >
      Exams
    </h1>
    <p class="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
      A quiz tells you whether you understood a course. An exam decides
      something: pass one and a credential is issued under your account, with a
      page anyone can read.
    </p>
  </div>
</section>

<section class="mx-auto max-w-5xl px-6 py-12">
  <ul class="grid gap-4 sm:grid-cols-2">
    {#each data.exams as exam (exam.id)}
      <li
        class="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6"
      >
        <h2 class="text-xl font-bold text-gray-900">{exam.title}</h2>
        <p class="mt-2 flex-1 text-sm leading-6 text-gray-600">
          {exam.questions} questions, {Math.round(exam.pass * 100)} per cent to
          pass. It follows
          <a href={exam.course.href} class="font-medium text-[#4670EC] hover:underline"
            >{exam.course.title}</a
          >.
        </p>
        <a
          href="/learn/exams/{exam.id}"
          class="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-[#4670EC] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3158c7]"
        >
          Sit it
          <span class="material-symbols-outlined text-base" aria-hidden="true"
            >arrow_forward</span
          >
        </a>
      </li>
    {/each}
  </ul>

  <div class="mt-10 max-w-2xl">
    <h2 class="text-lg font-semibold text-gray-900">What a credential says</h2>
    <p class="mt-2 text-sm leading-6 text-gray-600">
      That the account named passed that exam on that date, and nothing else.
      The exam is open book, taken on your own machine, with nobody watching.
      Nothing checks who is at the keyboard, so it cannot tell anyone that the
      person handing them the link is the person it names.
    </p>
    <p class="mt-3 text-sm leading-6 text-gray-600">
      You may sit an exam as many times as you like. A later pass supersedes the
      earlier one, and the earlier one stays readable at its own address rather
      than disappearing. Anyone can check a credential at
      <a href="/verify" class="font-medium text-[#4670EC] hover:underline"
        >/verify</a
      >.
    </p>
    {#if !data.signedIn}
      <p class="mt-3 text-sm leading-6 text-gray-600">
        You can read any exam without an account. Handing one in needs one,
        because the credential names a handle.
      </p>
    {/if}
  </div>
</section>
