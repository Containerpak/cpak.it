<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import Quiz from "$lib/components/learn/Quiz.svelte";
  import { COURSE } from "../course";
  import { QUESTIONS } from "./questions";

  const lesson = COURSE.modules[2].lessons[0];
</script>

<Seo
  title="Check what you know - cpak"
  description="Five questions on the cpak course: what an ordinary install can reach, what a manifest that says nothing grants, what one permission really opens, and what a ceiling does."
  path="/learn/start/check-what-you-know"
/>

<LessonShell course={COURSE} {lesson}>
  <Quiz questions={QUESTIONS} />
</LessonShell>
