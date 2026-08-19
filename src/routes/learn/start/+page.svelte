<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import CoursePage from "$lib/components/learn/CoursePage.svelte";
  import { COURSE } from "./course";
</script>

<Seo
  title="Start here - cpak"
  description="A short course on cpak for somebody who has never used it: what it is, what installing something looks like, and what an application is allowed to do afterwards."
  path="/learn/start"
/>

<CoursePage
  course={COURSE}
  minutes={20}
  summary="cpak installs applications that start with nothing and get only what they asked for in writing. This course is what that means in practice: what you are shown before you install, what a permission really opens, and who can take one away."
  audience="No prior knowledge. If you have never installed anything with cpak, this is the right place to begin."
/>
