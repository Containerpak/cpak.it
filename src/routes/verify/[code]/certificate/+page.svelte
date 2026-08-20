<script lang="ts">
  import CredentialCertificate from "$lib/components/learn/CredentialCertificate.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{data.held.title} certificate - cpak</title>
</svelte:head>

<div class="certificate-page mx-auto max-w-6xl px-6 py-12 sm:py-16">
  <div class="certificate-heading mb-8">
    <a
      href="/verify/{data.held.code}"
      class="text-sm font-semibold text-[#3158c7] hover:no-underline focus-visible:ring-2 focus-visible:ring-[#3E7BFF] focus-visible:outline-none"
    >
      {m.certificate_back()}
    </a>
    <h1 class="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">
      {m.certificate_title()}
    </h1>
    <p class="mt-3 max-w-2xl text-lg leading-8 text-gray-600">
      {m.certificate_intro()}
    </p>
  </div>

  <CredentialCertificate held={data.held} />
</div>
