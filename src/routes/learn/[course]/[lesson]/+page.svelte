<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import Quiz from "$lib/components/learn/Quiz.svelte";
  import CeilingPlayground from "$lib/components/learn/playgrounds/CeilingPlayground.svelte";
  import DesktopEntryPlayground from "$lib/components/learn/playgrounds/DesktopEntryPlayground.svelte";
  import FilesystemPlayground from "$lib/components/learn/playgrounds/FilesystemPlayground.svelte";
  import PermissionsPlayground from "$lib/components/learn/playgrounds/PermissionsPlayground.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import {
    PLAYGROUNDS,
    waiting,
    type PlaygroundStatus,
  } from "$lib/learn/playgrounds";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let status = $state<PlaygroundStatus>(waiting());
  let meta = $derived(data.playground ? PLAYGROUNDS[data.playground] : null);
</script>

{#snippet playground()}
  {#if data.playground === "permissions"}
    <PermissionsPlayground onstatus={(next) => (status = next)} />
  {:else if data.playground === "filesystem"}
    <FilesystemPlayground onstatus={(next) => (status = next)} />
  {:else if data.playground === "ceiling"}
    <CeilingPlayground onstatus={(next) => (status = next)} />
  {:else if data.playground === "desktop-entry"}
    <DesktopEntryPlayground onstatus={(next) => (status = next)} />
  {/if}
{/snippet}

<Seo
  title="{data.lesson.title} - cpak"
  description={data.description}
  path={data.lesson.href}
/>

<LessonShell
  course={data.course}
  lesson={data.lesson}
  playground={meta ? playground : null}
  playgroundTitle={meta?.title ?? ""}
  playgroundLink={meta ? { href: meta.href, label: m.open_on_its_own() } : null}
  playgroundStatus={meta ? status : null}
  playgroundWideOnly={data.playgroundWideOnly}
>
  {#if data.body}
    {@html data.body}
  {/if}
  {#if data.quiz}
    <Quiz
      questions={data.quiz}
      lessons={data.course.modules.flatMap((module) => module.lessons).length -
        1}
      usesPlayground={Boolean(meta)}
      tool={meta ? playground : null}
      toolAfter={meta ? 4 : 0}
    />
  {/if}
</LessonShell>
