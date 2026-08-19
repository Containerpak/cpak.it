<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import Quiz from "$lib/components/learn/Quiz.svelte";
  import PermissionsPlayground from "$lib/components/learn/playgrounds/PermissionsPlayground.svelte";
  import { PLAYGROUNDS, waiting, type PlaygroundStatus } from "$lib/learn/playgrounds";
  import { COURSE } from "../course";
  import { QUESTIONS } from "./questions";

  const meta = PLAYGROUNDS.permissions;
  const lesson = COURSE.modules[2].lessons[0];
  let status = $state<PlaygroundStatus>(waiting());
</script>

<Seo
  title="Check what you know - cpak"
  description="Six questions on the cpak course: what an ordinary install can reach, what a manifest that says nothing grants, what one permission really opens, and what a ceiling does."
  path="/learn/start/check-what-you-know"
/>

<LessonShell
  course={COURSE}
  {lesson}
  playgroundTitle={meta.title}
  playgroundLink={{ href: meta.href, label: "Open on its own" }}
  playgroundStatus={status}
>
  {#snippet playground()}
    <PermissionsPlayground onstatus={(next) => (status = next)} />
  {/snippet}

  <Quiz questions={QUESTIONS} />
</LessonShell>
