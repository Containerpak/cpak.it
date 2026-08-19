<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import PlaygroundPage from "$lib/components/learn/play/PlaygroundPage.svelte";
  import CeilingPlayground from "$lib/components/learn/playgrounds/CeilingPlayground.svelte";
  import { PLAYGROUNDS, waiting, type PlaygroundStatus } from "$lib/learn/playgrounds";

  const board = PLAYGROUNDS.ceiling;
  let status = $state<PlaygroundStatus>(waiting());
</script>

<Seo
  title="The ceiling board - cpak"
  description="Set a manifest, an owner override and an administrator ceiling against each other, and read the permissions and mounts that survive all three, decided by cpak's own code running in the page."
  path="/learn/play/ceiling"
/>

<PlaygroundPage
  title={board.title}
  sentence={board.sentence}
  reference={board.reference}
  phase={status.phase}
  version={status.version}
  error={status.error}
  onretry={() => status.retry()}
>
  <CeilingPlayground onstatus={(next) => (status = next)} />
</PlaygroundPage>
