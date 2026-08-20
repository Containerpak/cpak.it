<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import PlaygroundPage from "$lib/components/learn/play/PlaygroundPage.svelte";
  import FilesystemPlayground from "$lib/components/learn/playgrounds/FilesystemPlayground.svelte";
  import { waiting, type PlaygroundStatus } from "$lib/learn/playgrounds";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let play = $derived(data.playgrounds.filesystem);
  let status = $state<PlaygroundStatus>(waiting());
</script>

<Seo
  title="Filesystem access - cpak"
  description="Write a cpak filesystem permission list and see the host and sandbox path each entry resolves to."
  path="/learn/play/filesystem"
/>

<PlaygroundPage
  title={play.title}
  sentence={play.sentence}
  reference={play.reference}
  phase={status.phase}
  version={status.version}
  error={status.error}
  onretry={() => status.retry()}
>
  <FilesystemPlayground onstatus={(next) => (status = next)} />
</PlaygroundPage>
