<script lang="ts">
  import { onMount, tick } from "svelte";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { page } from "$app/state";
  import { badgesFrom } from "$lib/learn/badges";
  import {
    byTrack,
    forgetLocal,
    pushLocal,
    readLocal,
    type Done,
  } from "$lib/learn/progress";
  import {
    STANDING_CHIP,
    longDate,
    standing,
    standingLine,
    standingWord,
  } from "$lib/learn/credential";
  import * as m from "$lib/paraglide/messages.js";
  import type { ActionData, PageData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let local = $state<Done[] | null>(null);
  let carrying = $state(false);

  let signedOutProblem = $derived(page.url.searchParams.get("problem") ?? "");
  let problem = $derived(
    (form && "problem" in form ? (form.problem as string) : "") ||
      signedOutProblem,
  );
  let erased = $derived(form && "erased" in form ? form.erased : null);

  let entries = $derived<Done[]>(data.account ? data.completed : (local ?? []));
  let courses = $derived(byTrack(entries));
  let badges = $derived(badgesFrom(entries));
  let earned = $derived(badges.filter((badge) => badge.earned));
  let started = $derived(badges.filter((badge) => !badge.earned));

  let confirming = $state(false);
  let working = $state("");

  let confirmButton = $state<HTMLButtonElement | null>(null);

  async function askFirst() {
    confirming = true;
    await tick();
    confirmButton?.focus();
  }

  onMount(() => {
    local = readLocal();
  });

  let carried = false;

  $effect(() => {
    if (!data.account || carried) return;
    if (page.url.searchParams.get("welcome") !== "1") return;
    carried = true;
    void carryUp();
  });

  async function carryUp() {
    if (readLocal().length === 0) return;
    carrying = true;
    await pushLocal();
    carrying = false;
    await invalidateAll();
  }

  function submitting(name: string) {
    working = name;
    return async ({ update }: { update: () => Promise<void> }) => {
      await update();
      working = "";
    };
  }
</script>

<svelte:head>
  <title>{m.account_page_title()} - cpak Learn</title>
</svelte:head>

<section class="border-b border-slate-200 bg-white">
  <div class="mx-auto max-w-4xl px-6 py-12 sm:py-14">
    <a
      href="/learn"
      class="text-sm font-medium text-[#4670EC] hover:underline focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
    >
      Learn
    </a>
    <div
      class="mt-4 flex flex-wrap items-start justify-between gap-x-8 gap-y-6"
    >
      <div class="min-w-0">
        <h1 class="text-4xl font-extrabold tracking-tight text-gray-900">
          {m.account_page_title()}
        </h1>
        <p class="mt-3 max-w-2xl text-lg leading-8 text-gray-600">
          {m.account_intro()}
        </p>
      </div>

      {#if data.account}
        <div class="flex min-w-0 items-center gap-4">
          {#if data.account.avatar}
            <img
              src={data.account.avatar}
              alt=""
              width="48"
              height="48"
              class="h-12 w-12 rounded-full border border-slate-200"
            />
          {:else}
            <span
              class="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-lg font-semibold text-gray-500"
              aria-hidden="true"
            >
              {data.account.handle.slice(0, 1).toUpperCase()}
            </span>
          {/if}
          <div class="min-w-0">
            <p class="truncate font-semibold text-gray-900">
              {data.account.handle}
            </p>
            <p class="text-sm text-gray-600">
              {m.account_here_since({
                account: data.account.provider === "github"
                  ? m.account_github_label()
                  : m.account_local_label(),
                date: longDate(data.account.createdAt),
              })}
            </p>
            <form
              method="POST"
              action="?/signout"
              use:enhance={() => submitting("signout")}
              class="mt-2"
            >
              <button
                type="submit"
                disabled={working === "signout"}
                class="text-sm font-medium text-[#3158c7] underline underline-offset-2 hover:no-underline focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none disabled:opacity-60"
              >
                {working === "signout" ? m.account_signing_out() : m.sign_out()}
              </button>
            </form>
          </div>
        </div>
      {/if}
    </div>
    {#if carrying}
      <p class="mt-6 text-sm text-gray-600" role="status">
        {m.account_saving_progress()}
      </p>
    {/if}
  </div>
</section>

{#if problem}
  <div class="border-b border-red-200 bg-red-100" role="alert">
    <div class="mx-auto max-w-4xl px-6 py-5">
      <p class="text-sm font-semibold text-red-700">{m.account_error()}</p>
      <p class="mt-1 text-sm leading-6 text-red-700">{problem}</p>
    </div>
  </div>
{/if}

{#if erased}
  <div class="border-b border-slate-200 bg-white" role="status">
    <div class="mx-auto max-w-4xl px-6 py-6">
      <h2 class="text-lg font-semibold text-gray-900">{m.account_deleted()}</h2>
      <p class="mt-2 text-sm leading-6 text-gray-600">
        {m.account_erased_summary({
          completions: String(erased.completions),
          sessions: String(erased.sessions),
          accounts: String(erased.account),
        })}
      </p>
      {#if erased.credentials > 0}
        <p class="mt-3 text-sm leading-6 text-gray-600">
          {m.account_erased_credentials({ count: String(erased.credentials) })}
        </p>
      {/if}
      {#if !erased.durable}
        <p class="mt-3 text-sm leading-6 text-gray-600">
          {m.account_memory_server()}
        </p>
      {/if}
    </div>
  </div>
{/if}

{#if !data.durable}
  <div class="border-b border-yellow-200 bg-yellow-100">
    <div class="mx-auto max-w-4xl px-6 py-4">
      <p class="text-sm leading-6 text-yellow-800">
        {m.account_no_database()}
      </p>
    </div>
  </div>
{/if}

{#if !data.account}
  <section aria-labelledby="here" class="border-b border-slate-200">
    <div class="mx-auto max-w-4xl px-6 py-12">
      <h2 id="here" class="text-2xl font-semibold text-gray-900">
        {m.account_browser_remembers()}
      </h2>
      <p class="mt-3 max-w-2xl leading-7 text-gray-600">
        {m.account_browser_intro()}
      </p>

      {#if local === null}
        <div
          class="mt-6 animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div class="h-4 w-48 rounded bg-slate-100"></div>
          <div class="mt-4 h-3 w-full rounded bg-slate-100"></div>
          <div class="mt-2 h-3 w-2/3 rounded bg-slate-100"></div>
        </div>
      {:else if courses.length === 0}
        <p
          class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-6 text-gray-600"
        >
          {m.account_nothing_yet()}
        </p>
      {:else}
        {@render completedList(courses)}
      {/if}
    </div>
  </section>

  <section aria-labelledby="signin" class="bg-white">
    <div class="mx-auto max-w-4xl px-6 py-12">
      <h2 id="signin" class="text-2xl font-semibold text-gray-900">
        {m.account_signing_in()}
      </h2>
      <p class="mt-3 max-w-2xl leading-7 text-gray-600">
        {m.account_signin_intro()}
      </p>

      {#if data.github}
        <p class="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
          {m.account_github_public()}
        </p>
        <a
          href={`/learn/account/auth/github${data.returnTo ? `?returnTo=${encodeURIComponent(data.returnTo)}` : ""}`}
          data-sveltekit-reload
          class="mt-6 inline-flex items-center gap-2 rounded-full bg-[#4670EC] px-6 py-3 text-sm font-semibold text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
        >
          <span class="material-symbols-outlined text-[18px]">login</span>
          {m.account_continue_github()}
        </a>
        <p class="mt-3 text-xs leading-5 text-gray-500">
          {m.account_github_scope()}
        </p>
      {:else if data.local}
        <form
          method="POST"
          action="?/local"
          use:enhance={() => submitting("local")}
          class="mt-6 max-w-2xl"
        >
          {#if data.returnTo}<input type="hidden" name="returnTo" value={data.returnTo} />{/if}
          <p
            class="rounded-xl border border-yellow-200 bg-yellow-100 p-4 text-sm leading-6 text-yellow-800"
          >
            {m.account_local_warning()}
          </p>
          <label
            for="handle"
            class="mt-5 block text-sm font-medium text-gray-900"
          >
            {m.account_handle_label()}
          </label>
          <div class="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="handle"
              name="handle"
              required
              maxlength="39"
              autocomplete="off"
              placeholder="packager"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#3E7BFF] focus:outline-none sm:max-w-xs"
            />
            <button
              type="submit"
              disabled={working === "local"}
              class="shrink-0 rounded-full bg-[#4670EC] px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none disabled:opacity-60"
            >
              {working === "local" ? m.account_signing_in_progress() : m.account_signin_local()}
            </button>
          </div>
        </form>
      {:else}
        <p
          class="mt-6 max-w-2xl rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-gray-600"
        >
          {m.account_signin_unavailable()}
        </p>
      {/if}
    </div>
  </section>
{:else}
  <section aria-labelledby="completed" class="border-b border-slate-200">
    <div class="mx-auto max-w-4xl px-6 py-12">
      <h2 id="completed" class="text-2xl font-semibold text-gray-900">
        {m.account_worked_through()}
      </h2>
      <p class="mt-3 max-w-2xl leading-7 text-gray-600">
        {m.account_worked_intro()}
      </p>
      {#if courses.length === 0}
        <p
          class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-6 text-gray-600"
        >
          {m.account_start_anywhere()}
        </p>
      {:else}
        {@render completedList(courses)}
      {/if}

      <h3 class="mt-10 text-lg font-semibold text-gray-900">{m.account_badges()}</h3>
      <p class="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
        {m.account_badges_intro()}
      </p>

      {#if badges.length === 0}
        <p class="mt-4 text-sm leading-6 text-gray-600">
          {m.account_badges_none()}
        </p>
      {:else}
        {#if earned.length > 0}
          <ul class="mt-4 grid gap-4 sm:grid-cols-2">
            {#each earned as badge (badge.course)}
              <li class="rounded-2xl border border-slate-200 bg-white p-5">
                <div class="flex items-center gap-4">
                  <img
                    src="/learn/badges/{badge.course}.png"
                    alt={m.account_badge_alt({ title: badge.title })}
                    width="96"
                    height="96"
                    class="h-24 w-24 shrink-0"
                  />
                  <div class="min-w-0">
                    <p class="font-semibold text-gray-900">{badge.title}</p>
                    <p class="mt-1 text-sm text-gray-600">
                      {m.account_badge_done({ total: String(badge.total), date: longDate(badge.at) })}
                    </p>
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
        {#if started.length > 0}
          <h4 class="mt-6 text-sm font-semibold text-gray-900">
            {m.account_started_not_finished()}
          </h4>
          <ul class="mt-3 space-y-2">
            {#each started as badge (badge.course)}
              <li class="text-sm text-gray-600">
                {badge.title}, {m.account_course_progress_short({ done: String(badge.done), total: String(badge.total) })}
              </li>
            {/each}
          </ul>
        {/if}
      {/if}
    </div>
  </section>

  <section aria-labelledby="hold" class="border-b border-slate-200 bg-white">
    <div class="mx-auto max-w-4xl px-6 py-12">
      <h2 id="hold" class="text-2xl font-semibold text-gray-900">
        {m.account_credentials_title()}
      </h2>
      <p class="mt-3 max-w-2xl leading-7 text-gray-600">
        {m.account_credentials_intro()}
      </p>

      {#if data.credentials.length === 0}
        <p
          class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm leading-6 text-gray-600"
        >
          {m.account_credentials_none()}
        </p>
      {:else}
        <ul class="mt-6 space-y-4">
          {#each data.credentials as held (held.code)}
            <li>
              <a
                href="/learn/account/credentials/{held.code}"
                class="block rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:bg-white focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
              >
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-semibold text-gray-900">{held.title}</p>
                    <p class="mt-1 text-sm text-gray-600">
                      {m.account_credential_issued({ result: held.result, date: longDate(held.issuedAt) })}
                    </p>
                    <p class="mt-1 text-sm text-gray-500">
                      {standingLine(held)}
                    </p>
                  </div>
                  <span
                    class={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${STANDING_CHIP[standing(held)]}`}
                  >
                    {standingWord(standing(held))}
                  </span>
                </div>
                <p class="mt-3 font-mono text-xs break-all text-gray-500">
                  {held.code}
                </p>
              </a>
            </li>
          {/each}
        </ul>
      {/if}

      <p class="mt-6 text-sm leading-6 text-gray-600">
        <a
          href="/learn#credentials"
          class="font-medium text-[#4670EC] hover:underline">{m.account_view_exams()}</a
        >. {m.account_exams_repeat()}
      </p>
    </div>
  </section>

  <section aria-labelledby="data">
    <div class="mx-auto max-w-4xl px-6 py-12">
      <h2 id="data" class="text-2xl font-semibold text-gray-900">{m.account_data()}</h2>
      <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <p class="text-sm font-semibold text-gray-900">{m.account_data_kept()}</p>
        <ul class="mt-3 space-y-2 text-sm leading-6 text-gray-600">
          <li>
            {m.account_data_identity({ provider: data.account.provider === "github" ? "GitHub" : "local" })}
          </li>
          <li>
            {m.account_data_progress()}
          </li>
          <li>
            {m.account_data_sessions()}
          </li>
          <li>
            {m.account_data_credentials()}
          </li>
        </ul>
        <p class="mt-4 text-sm leading-6 text-gray-600">
          {m.account_data_visibility()}
        </p>
      </div>

      <div class="mt-6 rounded-2xl border border-red-200 bg-white p-6">
        <p class="text-sm font-semibold text-gray-900">{m.account_delete()}</p>
        <p class="mt-2 text-sm leading-6 text-gray-600">
          {m.account_delete_intro()}
        </p>
        {#if data.credentials.length > 0}
          <p class="mt-3 text-sm leading-6 text-gray-600">
            {m.account_delete_credentials({ count: String(data.credentials.length) })}
          </p>
        {/if}

        {#if !confirming}
          <button
            type="button"
            onclick={askFirst}
            class="mt-4 rounded-full border border-red-200 bg-red-100 px-5 py-2.5 text-sm font-semibold text-red-700 hover:brightness-95 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
          >
            {m.account_delete_my_data()}
          </button>
        {:else}
          <form
            method="POST"
            action="?/erase"
            use:enhance={() => {
              working = "erase";
              return async ({ update }) => {
                await update();
                forgetLocal();
                local = [];
                confirming = false;
                working = "";
              };
            }}
            class="mt-4 flex flex-wrap items-center gap-3"
          >
            <button
              type="submit"
              bind:this={confirmButton}
              disabled={working === "erase"}
              class="rounded-full border border-red-200 bg-red-100 px-5 py-2.5 text-sm font-semibold text-red-700 hover:brightness-95 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none disabled:opacity-60"
            >
              {working === "erase" ? m.account_deleting() : m.account_delete_confirm()}
            </button>
            <button
              type="button"
              onclick={() => (confirming = false)}
              class="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
            >
              {m.account_keep()}
            </button>
          </form>
        {/if}
      </div>
    </div>
  </section>
{/if}

{#snippet completedList(groups: ReturnType<typeof byTrack>)}
  <div class="mt-6 space-y-6">
    {#each groups as group (group.course)}
      <div class="rounded-2xl border border-slate-200 bg-white p-6">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h3 class="text-lg font-semibold text-gray-900">{group.title}</h3>
          <p class="text-sm text-gray-500">
            {m.account_done_count({ done: String(group.entries.length), total: String(group.total) })}
          </p>
        </div>
        <ul class="mt-4 divide-y divide-slate-200 border-t border-slate-200">
          {#each group.entries as entry (entry.lesson)}
            <li
              class="flex flex-wrap items-baseline justify-between gap-2 py-3"
            >
              <span class="text-sm text-gray-900">{entry.title}</span>
              <span class="text-sm text-gray-500"
                >{longDate(entry.completedAt)}</span
              >
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
{/snippet}
