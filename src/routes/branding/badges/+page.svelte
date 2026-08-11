<script lang="ts">
  const baseUrl = "https://cpak.it";
  const installUrl = `${baseUrl}/install`;

  const badges = [
    {
      id: "dark",
      name: "Dark badge",
      description: "For light backgrounds",
      file: "/badges/get-it-with-cpak.svg",
      previewClass: "bg-[#EEF2F7]",
    },
    {
      id: "light",
      name: "Light badge",
      description: "For dark backgrounds",
      file: "/badges/get-it-with-cpak-light.svg",
      previewClass: "bg-[#1F2631]",
    },
  ];

  let copied = "";
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  function markdown(file: string) {
    return `[![Get it with cpak](${baseUrl}${file})](${installUrl})`;
  }

  function html(file: string) {
    return `<a href="${installUrl}"><img src="${baseUrl}${file}" alt="Get it with cpak" width="240"></a>`;
  }

  async function copy(value: string, key: string) {
    await navigator.clipboard.writeText(value);
    copied = key;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = ""), 1800);
  }
</script>

<svelte:head>
  <title>Badges | cpak</title>
  <meta
    name="description"
    content="Official cpak badges for project websites, documentation and README files."
  />
</svelte:head>

<section class="mx-auto max-w-7xl px-6 py-16 sm:py-20">
  <div class="max-w-3xl">
    <p
      class="mb-3 text-sm font-semibold tracking-wide text-[#4670EC] uppercase"
    >
      Brand resources
    </p>
    <h1
      class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl"
    >
      Official badges
    </h1>
    <p class="mt-5 text-lg leading-8 text-gray-600">
      Add a cpak badge to your project website, documentation or README and link
      it to the installation guide.
    </p>
  </div>

  <div class="mt-12 grid gap-8 lg:grid-cols-2">
    {#each badges as badge}
      <article
        class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div
          class={`flex min-h-56 items-center justify-center p-8 ${badge.previewClass}`}
        >
          <img
            src={badge.file}
            alt="Get it with cpak"
            class="h-auto w-60 max-w-full"
          />
        </div>

        <div class="p-6 sm:p-8">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{badge.name}</h2>
            <p class="mt-1 text-sm text-gray-600">{badge.description}</p>
          </div>

          <div class="mt-6 flex flex-wrap gap-3">
            <a
              href={badge.file}
              download
              class="inline-flex items-center gap-2 rounded-full bg-[#4670EC] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3568d1]"
            >
              <span class="material-symbols-outlined text-lg">download</span>
              Download SVG
            </a>
            <button
              type="button"
              on:click={() =>
                copy(markdown(badge.file), `${badge.id}-markdown`)}
              class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-[#4670EC] hover:text-[#3568d1]"
            >
              <span class="material-symbols-outlined text-lg">content_copy</span
              >
              {copied === `${badge.id}-markdown` ? "Copied" : "Copy Markdown"}
            </button>
            <button
              type="button"
              on:click={() => copy(html(badge.file), `${badge.id}-html`)}
              class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-[#4670EC] hover:text-[#3568d1]"
            >
              <span class="material-symbols-outlined text-lg">code</span>
              {copied === `${badge.id}-html` ? "Copied" : "Copy HTML"}
            </button>
          </div>
        </div>
      </article>
    {/each}
  </div>

  <div class="mt-12 border-t border-slate-200 pt-8">
    <h2 class="text-2xl font-semibold text-gray-900">Using the badge</h2>
    <p class="mt-3 max-w-3xl leading-7 text-gray-600">
      Keep the badge unchanged, add descriptive alternative text and link it to
      the cpak install page or to a package page in the Store. See the
      <a
        href="/branding/guidelines"
        class="font-medium text-[#3568d1] hover:underline">brand guidelines</a
      >
      for logo spacing and color rules.
    </p>
  </div>
</section>
