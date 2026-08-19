<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import PlaygroundPage from "$lib/components/learn/play/PlaygroundPage.svelte";
  import CeilingPlayground from "$lib/components/learn/playgrounds/CeilingPlayground.svelte";
  import { PLAYGROUNDS, waiting, type PlaygroundStatus } from "$lib/learn/playgrounds";

  const play = PLAYGROUNDS.ceiling;
  let status = $state<PlaygroundStatus>(waiting());
</script>

<Seo
  title="The ceiling - cpak"
  description="Set a manifest, an owner override and an administrator ceiling against each other, and read the permissions and mounts that survive all three, decided by cpak's own code running in the page."
  path="/learn/play/ceiling"
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
  <CeilingPlayground onstatus={(next) => (status = next)} />
</PlaygroundPage>
