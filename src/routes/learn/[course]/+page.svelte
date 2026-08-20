<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import CoursePage from "$lib/components/learn/CoursePage.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<Seo
  title="{data.course.title} - cpak"
  description={data.description}
  path={data.course.href}
/>

<CoursePage
  course={data.course}
  summary={data.summary}
  audience={data.audience}
  exam={data.exam}
/>
