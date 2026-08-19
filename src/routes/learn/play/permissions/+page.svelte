<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import PlaygroundPage from "$lib/components/learn/play/PlaygroundPage.svelte";
  import PermissionsPlayground from "$lib/components/learn/playgrounds/PermissionsPlayground.svelte";
  import { PLAYGROUNDS, waiting, type PlaygroundStatus } from "$lib/learn/playgrounds";

  const board = PLAYGROUNDS.permissions;
  let status = $state<PlaygroundStatus>(waiting());
</script>

<Seo
  title="Permission board - cpak"
  description="Tick a cpak permission and see the exact host paths it binds into the sandbox and what each one reaches, decided by cpak's own code running in the page."
  path="/learn/play/permissions"
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
  <PermissionsPlayground onstatus={(next) => (status = next)} />
</PlaygroundPage>
