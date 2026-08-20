<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import PlaygroundPage from "$lib/components/learn/play/PlaygroundPage.svelte";
  import DesktopEntryPlayground from "$lib/components/learn/playgrounds/DesktopEntryPlayground.svelte";
  import { waiting, type PlaygroundStatus } from "$lib/learn/playgrounds";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let play = $derived(data.playgrounds["desktop-entry"]);
  let status = $state<PlaygroundStatus>(waiting());
</script>

<Seo
  title="Desktop entries - cpak"
  description="Paste a .desktop file and see exactly what cpak exports, line by line."
  path="/learn/play/desktop-entry"
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
  <DesktopEntryPlayground onstatus={(next) => (status = next)} />
</PlaygroundPage>
