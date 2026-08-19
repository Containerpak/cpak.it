<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import Board from "$lib/components/learn/play/Board.svelte";
  import PermissionsBoard from "$lib/components/learn/boards/PermissionsBoard.svelte";
  import { BOARDS, waiting, type BoardStatus } from "$lib/learn/boards";

  const board = BOARDS.permissions;
  let status = $state<BoardStatus>(waiting());
</script>

<Seo
  title="Permission board - cpak"
  description="Tick a cpak permission and see the exact host paths it binds into the sandbox and what each one reaches, decided by cpak's own code running in the page."
  path="/learn/play/permissions"
/>

<Board
  title={board.title}
  sentence={board.sentence}
  reference={board.reference}
  phase={status.phase}
  version={status.version}
  error={status.error}
  onretry={() => status.retry()}
>
  <PermissionsBoard onstatus={(next) => (status = next)} />
</Board>
