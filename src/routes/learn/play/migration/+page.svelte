<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import Board from "$lib/components/learn/play/Board.svelte";
  import MigrationBoard from "$lib/components/learn/boards/MigrationBoard.svelte";
  import { BOARDS, waiting, type BoardStatus } from "$lib/learn/boards";

  const board = BOARDS.migration;
  let status = $state<BoardStatus>(waiting());
</script>

<Seo
  title="The migration board - cpak"
  description="Put a version 1 cpak manifest in and read the version 2 manifest cpak writes, with every field it rewrote, what it became and why."
  path="/learn/play/migration"
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
  <MigrationBoard onstatus={(next) => (status = next)} />
</Board>
