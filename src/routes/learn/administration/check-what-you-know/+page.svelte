<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import Quiz from "$lib/components/learn/Quiz.svelte";
  import { COURSE } from "../course";
  import { QUESTIONS } from "./questions";

  const lesson = COURSE.modules[2].lessons[0];
</script>

<Seo
  title="Check what you know - administering cpak"
  description="Eight questions on ceilings, verified launch, signature policy, trust, revocation and retained removal anchors."
  path="/learn/administration/check-what-you-know"
/>

<LessonShell course={COURSE} {lesson}>
  <Quiz questions={QUESTIONS} lessons={4} />
</LessonShell>
