<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import Quiz from "$lib/components/learn/Quiz.svelte";
  import { COURSE } from "../course";
  import { QUESTIONS } from "./questions";

  const lesson = COURSE.modules[2].lessons[0];
</script>

<Seo
  title="Check what you know - packaging with cpak"
  description="Five questions on packaging with cpak: which filesystem entries to ask for, why a user directory is written by name, and what cpak does to the desktop entry you ship."
  path="/learn/packaging/check-what-you-know"
/>

<LessonShell course={COURSE} {lesson}>
  <Quiz questions={QUESTIONS} lessons={3} />
</LessonShell>
