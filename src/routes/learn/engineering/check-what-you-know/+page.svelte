<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import Quiz from "$lib/components/learn/Quiz.svelte";
  import { COURSE } from "../course";
  import { QUESTIONS } from "./questions";

  const lesson = COURSE.modules[4].lessons[0];
</script>

<Seo
  title="Check what you know - cpak engineering"
  description="Ten questions on cpak launch boundaries, typed host actions, nested packages, storage drivers, runtime sources, integrity and addon provider slots."
  path="/learn/engineering/check-what-you-know"
/>

<LessonShell course={COURSE} {lesson}>
  <Quiz questions={QUESTIONS} lessons={8} />
</LessonShell>
