<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import type { PageData } from "./$types";
  import { extractHeadings, groupedArticles, renderMarkdown } from "$lib/docs";

  let { data }: { data: PageData } = $props();
  let documentationNavigation: HTMLElement;
  let article = $derived(data.article);
  let body = $derived(renderMarkdown(article.body));
  let headings = $derived(extractHeadings(article.body));

  afterNavigate(() => {
    const active = documentationNavigation.querySelector<HTMLElement>(
      '[aria-current="page"]',
    );
    if (!active) return;
    documentationNavigation.scrollTop = Math.max(
      0,
      active.offsetTop -
        documentationNavigation.clientHeight / 2 +
        active.clientHeight / 2,
    );
  });
</script>

<svelte:head>
  <title>{article.title} - Documentation - cpak</title>
  <meta name="description" content={article.description} />
</svelte:head>

<div
  class="mx-auto grid max-w-[92rem] grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-[15rem_minmax(0,48rem)] xl:grid-cols-[15rem_minmax(0,48rem)_13rem]"
>
  <aside class="hidden lg:block">
    <nav
      bind:this={documentationNavigation}
      class="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto pr-5"
      aria-label="Documentation"
    >
      <a
        href="/docs"
        class="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#4670EC]"
      >
        <span class="material-symbols-outlined text-lg">grid_view</span>
        Documentation home
      </a>
      <div class="space-y-7">
        {#each groupedArticles as group}
          {#if group.articles.length}
            <div>
              <p
                class="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase"
              >
                {group.title}
              </p>
              <ul class="space-y-0.5">
                {#each group.articles as item}
                  <li>
                    <a
                      href={`/docs/${item.slug}`}
                      aria-current={item.slug === article.slug
                        ? "page"
                        : undefined}
                      class="block rounded-lg px-3 py-2 text-sm leading-5 transition {item.slug ===
                      article.slug
                        ? 'bg-[#4670EC]/10 font-semibold text-[#3158c7]'
                        : 'text-slate-600 hover:bg-white hover:text-slate-950'}"
                    >
                      {item.title}
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        {/each}
      </div>
    </nav>
  </aside>

  <main class="min-w-0">
    <div class="flex items-center gap-2 text-sm text-slate-500">
      <a href="/docs" class="hover:text-[#4670EC]">Docs</a>
      <span class="material-symbols-outlined text-base">chevron_right</span>
      <span
        >{groupedArticles.find((group) => group.id === article.section)
          ?.title}</span
      >
    </div>
    <h1
      class="mt-6 text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl"
    >
      {article.title}
    </h1>
    <p class="mt-5 text-xl leading-8 text-gray-600">{article.description}</p>

    <article class="doc-body mt-12">
      {@html body}
    </article>

    <div class="mt-14 grid gap-4 border-t border-slate-200 pt-8 sm:grid-cols-2">
      {#if data.previous}
        <a href={`/docs/${data.previous.slug}`} class="doc-pagination">
          <span
            class="text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >Previous</span
          >
          <span class="mt-1 font-semibold text-gray-950"
            >{data.previous.title}</span
          >
        </a>
      {:else}<span></span>{/if}
      {#if data.next}
        <a href={`/docs/${data.next.slug}`} class="doc-pagination text-right">
          <span
            class="text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >Next</span
          >
          <span class="mt-1 font-semibold text-gray-950">{data.next.title}</span
          >
        </a>
      {/if}
    </div>

    <div
      class="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500"
    >
      <span>Found a mistake?</span>
      <a
        href={`https://github.com/Containerpak/cpak.it/edit/main/src/content/docs/${article.slug}.md`}
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 font-medium text-[#4670EC] hover:underline"
      >
        Edit this page on GitHub
        <span class="material-symbols-outlined text-base">open_in_new</span>
      </a>
    </div>
  </main>

  <aside class="hidden xl:block">
    <nav class="sticky top-6" aria-label="On this page">
      <p class="text-xs font-bold tracking-wide text-slate-500 uppercase">
        On this page
      </p>
      <ul class="mt-3 space-y-2 border-l border-slate-200 pl-4">
        {#each headings as heading}
          <li class:pl-3={heading.level === 3}>
            <a
              href={`#${heading.id}`}
              class="text-sm leading-5 text-slate-600 hover:text-[#4670EC]"
            >
              {heading.title}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  </aside>
</div>
