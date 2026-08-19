<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import PlaygroundPage from "$lib/components/learn/play/PlaygroundPage.svelte";
  import FilesystemPlayground from "$lib/components/learn/playgrounds/FilesystemPlayground.svelte";
  import { PLAYGROUNDS, waiting, type PlaygroundStatus } from "$lib/learn/playgrounds";

  const play = PLAYGROUNDS.filesystem;
  let status = $state<PlaygroundStatus>(waiting());
</script>

<Seo
  title="Filesystem access - cpak"
  description="Write a cpak filesystem permission list and see the host directory and the path inside the sandbox each entry resolves to, decided by cpak's own code running in the page."
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
