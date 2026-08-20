<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import CoursePage from "$lib/components/learn/CoursePage.svelte";
  import { COURSE } from "./course";
</script>

<Seo
  title="Running cpak on machines you look after - cpak"
  description="A course for whoever administers machines other people install on: what you can decide, how a ceiling narrows every installation on the host, and how to read what survives it."
  path="/learn/administration"
/>

<CoursePage
  course={COURSE}
  exam={{ id: "administrator", title: "cpak Administrator" }}
  minutes={20}
  summary="Installations here belong to the people who made them, and you do not own them. What you own is the machine, and cpak gives you two decisions over it: the widest policy anything may run under, and whether a launch has to match what was recorded when it was installed."
  audience="For whoever looks after machines other people install on. It assumes you know what a permission is; if you do not, start with the first course."
/>
