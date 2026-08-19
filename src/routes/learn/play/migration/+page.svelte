<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import PlaygroundPage from "$lib/components/learn/play/PlaygroundPage.svelte";
  import MigrationPlayground from "$lib/components/learn/playgrounds/MigrationPlayground.svelte";
  import { PLAYGROUNDS, waiting, type PlaygroundStatus } from "$lib/learn/playgrounds";

  const play = PLAYGROUNDS.migration;
  let status = $state<PlaygroundStatus>(waiting());
</script>

<Seo
  title="Manifest migration - cpak"
  description="Put a version 1 cpak manifest in and read the version 2 manifest cpak writes, with every field it rewrote, what it became and why."
  path="/learn/play/migration"
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
  <MigrationPlayground onstatus={(next) => (status = next)} />
</PlaygroundPage>
