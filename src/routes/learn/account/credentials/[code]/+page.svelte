<script lang="ts">
  import { page } from "$app/state";
  import CredentialRecord from "$lib/components/learn/CredentialRecord.svelte";
  import { verifyPath } from "$lib/learn/credential";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  let path = $derived(verifyPath(data.held.code));
  let link = $derived(`${page.url.origin}${path}`);
  let copied = $state<"idle" | "done" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      copied = "done";
    } catch {
      copied = "failed";
    }
  }
</script>

<svelte:head>
  <title>{data.held.title} - cpak</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-12 sm:py-16">
  <a
    href="/learn/account"
    class="text-sm font-medium text-[#4670EC] hover:underline focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
  >
    Your account
  </a>
  <h1 class="mt-5 text-4xl font-extrabold tracking-tight text-gray-900">
    A credential you hold
  </h1>
  <p class="mt-4 text-lg leading-8 text-gray-600">
    This is the record as it was written. Nobody can edit it, including you, and
    nobody at cpak can reword it later. What you can do with it is hand out the
    link below.
  </p>

  <div class="mt-8">
    <CredentialRecord
      held={data.held}
      successorIssuedAt={data.successorIssuedAt}
    />
  </div>

  <section
    aria-labelledby="share"
    class="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6"
  >
    <h2 id="share" class="text-lg font-semibold text-gray-900">
      The page anyone can read
    </h2>
    <p class="mt-2 text-sm leading-6 text-gray-600">
      Everything on this page is also at the address below, without a sign-in.
      Give it to whoever asked. It names your {data.held.provider === "github"
        ? "GitHub handle"
        : "development handle"}, so handing it out is handing out that name.
    </p>
    <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <a
        href={path}
        class="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm break-all text-[#3158c7] hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
      >
        {link}
      </a>
      <button
        type="button"
        onclick={copy}
        class="shrink-0 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
      >
        Copy link
      </button>
    </div>
    <p class="mt-3 min-h-5 text-sm text-gray-600" aria-live="polite">
      {#if copied === "done"}Copied.{:else if copied === "failed"}This browser
        would not let the page write to the clipboard. Select the address and
        copy it.{/if}
    </p>
  </section>

  <section
    aria-labelledby="removal"
    class="mt-8 rounded-2xl border border-slate-200 bg-white p-6"
  >
    <h2 id="removal" class="text-lg font-semibold text-gray-900">
      This one is not yours to delete
    </h2>
    <p class="mt-2 text-sm leading-6 text-gray-600">
      Deleting your account data removes what you read and what you marked done.
      It does not remove this record, because someone may be holding the link
      and a verification that quietly stops working is worse than none. If you
      delete your account data and sign in again with the same {data.held
        .provider === "github"
        ? "GitHub account"
        : "handle"}, this credential is listed under it again.
    </p>
  </section>
</div>
