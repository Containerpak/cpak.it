<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import CoursePage from "$lib/components/learn/CoursePage.svelte";
  import { COURSE } from "./course";
</script>

<Seo
  title="Packaging an application - cpak"
  description="A course for somebody publishing a cpak package: what a package is made of, how to ask for the access your program needs without asking for more, and how to ship a desktop entry that survives being exported."
  path="/learn/packaging"
/>

<CoursePage
  course={COURSE}
  exam={{ id: "packager", title: "cpak Packager" }}
  minutes={30}
  summary="What you publish is an image, a manifest and the address people install from. This course is about the manifest: how to ask for the access your program needs, how to ask for less than the obvious answer, and what cpak does to the desktop entry you ship."
  audience="For somebody who is going to publish a package. It assumes you know what cpak is; if you do not, start with the first course."
/>
