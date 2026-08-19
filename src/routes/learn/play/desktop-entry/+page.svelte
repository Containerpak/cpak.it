<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import PlaygroundPage from "$lib/components/learn/play/PlaygroundPage.svelte";
  import DesktopEntryPlayground from "$lib/components/learn/playgrounds/DesktopEntryPlayground.svelte";
  import { PLAYGROUNDS, waiting, type PlaygroundStatus } from "$lib/learn/playgrounds";

  const board = PLAYGROUNDS["desktop-entry"];
  let status = $state<PlaygroundStatus>(waiting());
</script>

<Seo
  title="Desktop entry board - cpak"
  description="Paste a .desktop file and see exactly what cpak exports for it, line by line, decided by cpak's own code running in the page."
  path="/learn/play/desktop-entry"
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
  <DesktopEntryPlayground onstatus={(next) => (status = next)} />
</PlaygroundPage>
