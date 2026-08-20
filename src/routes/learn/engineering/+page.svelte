<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import CoursePage from "$lib/components/learn/CoursePage.svelte";
  import { COURSE } from "./course";
</script>

<Seo
  title="Engineering cpak integrations - cpak"
  description="Trace a cpak launch, understand its sandbox, design typed host actions, implement storage drivers, verify runtime sources and compose addon provider slots."
  path="/learn/engineering"
/>

<CoursePage
  course={COURSE}
  exam={{ id: "developer", title: "cpak Developer" }}
  summary="Trace a launch until every boundary is visible, then extend cpak without replacing those boundaries with arbitrary commands. You will work through sandbox construction, typed host actions, the storage driver protocol, verified runtime sources and addon provider slots."
  audience="For developers integrating a package, runtime or storage backend. You should already know how a cpak manifest describes an application."
/>
