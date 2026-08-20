<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import PlaygroundPage from "$lib/components/learn/play/PlaygroundPage.svelte";
  import PermissionsPlayground from "$lib/components/learn/playgrounds/PermissionsPlayground.svelte";
  import { waiting, type PlaygroundStatus } from "$lib/learn/playgrounds";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let play = $derived(data.playgrounds.permissions);
  let status = $state<PlaygroundStatus>(waiting());
</script>

<Seo
  title="Permissions - cpak"
  description="Edit and validate a cpak manifest, then inspect its requested permissions, host paths and broker commands."
  path="/learn/play/permissions"
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
  <PermissionsPlayground onstatus={(next) => (status = next)} />
</PlaygroundPage>
