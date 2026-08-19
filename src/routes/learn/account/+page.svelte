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
    STANDING_WORD,
    longDate,
    standing,
    standingLine,
  } from "$lib/learn/credential";
  import type { ActionData, PageData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  // Progress kept in this browser. It is what the signed-out page has to show,
  // and it is also what gets carried up the first time someone signs in.
  let local = $state<Done[] | null>(null);
  let carrying = $state(false);

  let signedOutProblem = $derived(page.url.searchParams.get("problem") ?? "");
  let problem = $derived(
    (form && "problem" in form ? (form.problem as string) : "") ||
      signedOutProblem,
  );
  let erased = $derived(form && "erased" in form ? form.erased : null);

  let entries = $derived<Done[]>(data.account ? data.completed : (local ?? []));
  let tracks = $derived(byTrack(entries));
  let badges = $derived(badgesFrom(entries));
  let earned = $derived(badges.filter((badge) => badge.earned));
  let started = $derived(badges.filter((badge) => !badge.earned));

  let confirming = $state(false);
  let working = $state("");

  // The button that opens the confirmation is removed when it opens, so
  // without this a keyboard is left at the top of the document.
  let confirmButton = $state<HTMLButtonElement | null>(null);

  async function askFirst() {
    confirming = true;
    await tick();
    confirmButton?.focus();
  }

  onMount(() => {
    local = readLocal();
  });

  // Signing in lands back here rather than on a new page, so this cannot hang
  // off onMount: the component is already mounted when the session appears.
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
  <title>Your account - cpak Learn</title>
</svelte:head>

<!-- Who you are here, and the one control that changes it. -->
<section class="border-b border-slate-200 bg-white">
  <div class="mx-auto max-w-4xl px-6 py-12 sm:py-14">
    <a
      href="/learn"
      class="text-sm font-medium text-[#4670EC] hover:underline focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
    >
      cpak Learn
    </a>
    <div
      class="mt-4 flex flex-wrap items-start justify-between gap-x-8 gap-y-6"
    >
      <div class="min-w-0">
        <h1 class="text-4xl font-extrabold tracking-tight text-gray-900">
          Your account
        </h1>
        <p class="mt-3 max-w-2xl text-lg leading-8 text-gray-600">
          What you have worked through, and what you hold.
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
              {data.account.provider === "github"
                ? "GitHub account"
                : "Local development account"}, here since {longDate(
                data.account.createdAt,
              )}
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
                {working === "signout" ? "Signing out..." : "Sign out"}
              </button>
            </form>
          </div>
        </div>
      {/if}
    </div>
    {#if carrying}
      <p class="mt-6 text-sm text-gray-600" role="status">
        Carrying up what this browser had marked done.
      </p>
    {/if}
  </div>
</section>

{#if problem}
  <div class="border-b border-red-200 bg-red-100" role="alert">
    <div class="mx-auto max-w-4xl px-6 py-5">
      <p class="text-sm font-semibold text-red-700">That did not work</p>
      <p class="mt-1 text-sm leading-6 text-red-700">{problem}</p>
    </div>
  </div>
{/if}

{#if erased}
  <div class="border-b border-slate-200 bg-white" role="status">
    <div class="mx-auto max-w-4xl px-6 py-6">
      <h2 class="text-lg font-semibold text-gray-900">Deleted</h2>
      <p class="mt-2 text-sm leading-6 text-gray-600">
        {erased.completions}
        {erased.completions === 1 ? "lesson" : "lessons"} marked done, {erased.sessions}
        {erased.sessions === 1 ? "session" : "sessions"} and
        {erased.account === 1 ? "the account record" : "no account record"} are gone
        from the server. This browser's copy was cleared too. You are signed out.
      </p>
      {#if erased.credentials > 0}
        <p class="mt-3 text-sm leading-6 text-gray-600">
          What could not be deleted: {erased.credentials}
          {erased.credentials === 1 ? "credential" : "credentials"}. Each one is
          a public record at its own address and someone may be holding the
          link, so it stays. Sign in with the same account and it will be listed
          here again.
        </p>
      {/if}
      {#if !erased.durable}
        <p class="mt-3 text-sm leading-6 text-gray-600">
          This server keeps accounts in memory, so nothing was written to a
          database in the first place.
        </p>
      {/if}
    </div>
  </div>
{/if}

<!-- A condition of the whole deployment, so it is a strip across the page and
     not a note on one card. -->
{#if !data.durable}
  <div class="border-b border-yellow-200 bg-yellow-100">
    <div class="mx-auto max-w-4xl px-6 py-4">
      <p class="text-sm leading-6 text-yellow-800">
        No database is bound to this deployment, so accounts, progress and
        credentials are held in the server's memory and are lost when it
        restarts. Bind LEARN_DB to keep them.
      </p>
    </div>
  </div>
{/if}

{#if !data.account}
  <!-- Signed out. What this browser has is the content and comes first; the
       sign-in is how you keep it and comes after. -->
  <section aria-labelledby="here" class="border-b border-slate-200">
    <div class="mx-auto max-w-4xl px-6 py-12">
      <h2 id="here" class="text-2xl font-semibold text-gray-900">
        What this browser remembers
      </h2>
      <p class="mt-3 max-w-2xl leading-7 text-gray-600">
        Marking a lesson done works signed out. It is written here, in this
        browser, and it goes no further: another machine knows nothing about it,
        and clearing site data ends it. Signing in carries it up once, and after
        that the account is what a second machine reads.
      </p>

      {#if local === null}
        <div
          class="mt-6 animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div class="h-4 w-48 rounded bg-slate-100"></div>
          <div class="mt-4 h-3 w-full rounded bg-slate-100"></div>
          <div class="mt-2 h-3 w-2/3 rounded bg-slate-100"></div>
        </div>
      {:else if tracks.length === 0}
        <p
          class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-6 text-gray-600"
        >
          Nothing yet. Open a lesson or a workbench and mark it done, and it
          will be listed here.
        </p>
      {:else}
        {@render completedList(tracks)}
      {/if}
    </div>
  </section>

  <section aria-labelledby="signin" class="bg-white">
    <div class="mx-auto max-w-4xl px-6 py-12">
      <h2 id="signin" class="text-2xl font-semibold text-gray-900">
        Signing in
      </h2>
      <p class="mt-3 max-w-2xl leading-7 text-gray-600">
        Nothing here is needed to read a lesson or open a workbench. An account
        exists so a credential has an account to name.
      </p>

      {#if data.github}
        <p class="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
          GitHub is what cpak asks for: the people who take these exams already
          have a handle there, and it is a name a reader can look up. It proves
          the handle and nothing else, which is exactly as much as a credential
          from here claims.
        </p>
        <a
          href="/learn/account/auth/github"
          data-sveltekit-reload
          class="mt-6 inline-flex items-center gap-2 rounded-full bg-[#4670EC] px-6 py-3 text-sm font-semibold text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
        >
          <span class="material-symbols-outlined text-[18px]">login</span>
          Continue with GitHub
        </a>
        <p class="mt-3 text-xs leading-5 text-gray-500">
          cpak asks GitHub for your handle, your numeric id and your avatar.
          Nothing else, and it can write nothing.
        </p>
      {:else if data.local}
        <form
          method="POST"
          action="?/local"
          use:enhance={() => submitting("local")}
          class="mt-6 max-w-2xl"
        >
          <p
            class="rounded-xl border border-yellow-200 bg-yellow-100 p-4 text-sm leading-6 text-yellow-800"
          >
            Development sign-in. GitHub is not configured on this machine, so
            this form stands in for it: it opens a real session against a real
            account row, and it checks nothing about the handle you type.
            Credentials issued to it say so wherever they appear, and this form
            disappears the moment GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are
            set.
          </p>
          <label
            for="handle"
            class="mt-5 block text-sm font-medium text-gray-900"
          >
            A handle to work under
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
              {working === "local" ? "Signing in..." : "Sign in locally"}
            </button>
          </div>
        </form>
      {:else}
        <p
          class="mt-6 max-w-2xl rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-gray-600"
        >
          Sign-in is not configured on this deployment yet, so there is no way
          to open an account here at the moment. Everything else in cpak Learn
          works without one.
        </p>
      {/if}
    </div>
  </section>
{:else}
  <section aria-labelledby="completed" class="border-b border-slate-200">
    <div class="mx-auto max-w-4xl px-6 py-12">
      <h2 id="completed" class="text-2xl font-semibold text-gray-900">
        What you have worked through
      </h2>
      <p class="mt-3 max-w-2xl leading-7 text-gray-600">
        Lessons you marked done. They are recorded against the account, so they
        follow you to another machine. The account does not watch you read; a
        lesson is here because you said it was.
      </p>
      {#if tracks.length === 0}
        <p
          class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-6 text-gray-600"
        >
          Nothing yet. Start anywhere in
          <a
            href="/learn"
            class="text-[#3158c7] underline underline-offset-2 hover:no-underline focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
            >cpak Learn</a
          > and what you mark done appears here.
        </p>
      {:else}
        {@render completedList(tracks)}
      {/if}

      <!-- Badges are read off the same completions, so they belong under them
           rather than beside them. -->
      <h3 class="mt-10 text-lg font-semibold text-gray-900">Badges</h3>
      <p class="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
        One per track you finish. A badge is a note to yourself and is worth
        exactly that: it is here because you marked every lesson in the track
        done, and nothing checked that you read them. So it lives on this page
        only. There is no public badge page, no address to send anyone and no
        image to embed, because there is nothing here for a badge to attest. A
        credential is the part that attests something.
      </p>

      {#if badges.length === 0}
        <p class="mt-4 text-sm leading-6 text-gray-600">
          None yet. Finishing every lesson in a track puts its badge here.
        </p>
      {:else}
        {#if earned.length > 0}
          <ul class="mt-4 grid gap-4 sm:grid-cols-2">
            {#each earned as badge (badge.track)}
              <li
                class="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5"
              >
                <span
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#3E7BFF] bg-[#3E7BFF]/10"
                  aria-hidden="true"
                >
                  <span
                    class="material-symbols-outlined text-[20px] text-[#3158c7]"
                    >check</span
                  >
                </span>
                <div class="min-w-0">
                  <p class="font-semibold text-gray-900">{badge.title}</p>
                  <p class="mt-1 text-sm text-gray-600">
                    All {badge.total} marked done, last on {longDate(badge.at)}.
                  </p>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
        {#if started.length > 0}
          <h4 class="mt-6 text-sm font-semibold text-gray-900">
            Started, not finished
          </h4>
          <ul class="mt-3 space-y-2">
            {#each started as badge (badge.track)}
              <li class="text-sm text-gray-600">
                {badge.title}, {badge.done} of {badge.total}
              </li>
            {/each}
          </ul>
        {/if}
      {/if}
    </div>
  </section>

  <!-- The only thing on this page anybody else can read, so it gets a room of
       its own. -->
  <section aria-labelledby="hold" class="border-b border-slate-200 bg-white">
    <div class="mx-auto max-w-4xl px-6 py-12">
      <h2 id="hold" class="text-2xl font-semibold text-gray-900">
        What you hold
      </h2>
      <p class="mt-3 max-w-2xl leading-7 text-gray-600">
        A credential records an exam result under this account. Each one has a
        page anyone can read without signing in, and the account named is the
        only part of it that was authenticated.
      </p>

      {#if data.credentials.length === 0}
        <p
          class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm leading-6 text-gray-600"
        >
          None yet. Passing an exam while signed in writes one here.
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
                      {held.result}, issued {longDate(held.issuedAt)}
                    </p>
                    <p class="mt-1 text-sm text-gray-500">
                      {standingLine(held)}
                    </p>
                  </div>
                  <span
                    class={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${STANDING_CHIP[standing(held)]}`}
                  >
                    {STANDING_WORD[standing(held)]}
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

      {#if data.sampling}
        <form
          method="POST"
          action="?/sample"
          use:enhance={() => submitting("sample")}
          class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"
        >
          <p class="text-sm leading-6 text-gray-600">
            Development only. The exam pages are not built yet, so this issues a
            real credential record against your account to make the pages that
            show one reachable. Doing it twice supersedes the first, which is
            what a retake does.
          </p>
          <button
            type="submit"
            disabled={working === "sample"}
            class="mt-4 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none disabled:opacity-60"
          >
            {working === "sample" ? "Issuing..." : "Issue a credential"}
          </button>
        </form>
      {/if}
    </div>
  </section>

  <section aria-labelledby="data">
    <div class="mx-auto max-w-4xl px-6 py-12">
      <h2 id="data" class="text-2xl font-semibold text-gray-900">Your data</h2>
      <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <p class="text-sm font-semibold text-gray-900">What is kept</p>
        <ul class="mt-3 space-y-2 text-sm leading-6 text-gray-600">
          <li>
            Your {data.account.provider === "github" ? "GitHub" : "local"} handle,
            the account's numeric id and the avatar address. No email address is
            asked for or stored.
          </li>
          <li>
            One row per lesson you marked done, with the title it had at the
            time and the date.
          </li>
          <li>
            One row per open session, holding a hash of the cookie rather than
            the cookie, valid for thirty days and then dropped.
          </li>
          <li>
            One row per credential, kept for as long as the credential is
            readable, which is indefinitely.
          </li>
        </ul>
        <p class="mt-4 text-sm leading-6 text-gray-600">
          Nothing here is shared with anyone, and the pages you read are not
          recorded.
        </p>
      </div>

      <div class="mt-6 rounded-2xl border border-red-200 bg-white p-6">
        <p class="text-sm font-semibold text-gray-900">Delete it</p>
        <p class="mt-2 text-sm leading-6 text-gray-600">
          This removes the account record, everything you marked done and every
          open session, on the server and in this browser, and signs you out.
        </p>
        {#if data.credentials.length > 0}
          <p class="mt-3 text-sm leading-6 text-gray-600">
            It does not remove your {data.credentials.length}
            {data.credentials.length === 1 ? "credential" : "credentials"}. Each
            is a public record someone may be holding a link to, and it is not
            rewritten or withdrawn. Signing in again with the same account lists
            them here again.
          </p>
        {/if}

        {#if !confirming}
          <button
            type="button"
            onclick={askFirst}
            class="mt-4 rounded-full border border-red-200 bg-red-100 px-5 py-2.5 text-sm font-semibold text-red-700 hover:brightness-95 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
          >
            Delete my data
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
              {working === "erase" ? "Deleting..." : "Yes, delete it now"}
            </button>
            <button
              type="button"
              onclick={() => (confirming = false)}
              class="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
            >
              Keep it
            </button>
          </form>
        {/if}
      </div>
    </div>
  </section>
{/if}

{#snippet completedList(groups: ReturnType<typeof byTrack>)}
  <div class="mt-6 space-y-6">
    {#each groups as group (group.track)}
      <div class="rounded-2xl border border-slate-200 bg-white p-6">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h3 class="text-lg font-semibold text-gray-900">{group.title}</h3>
          <p class="text-sm text-gray-500">
            {group.entries.length} of {group.total} done
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
