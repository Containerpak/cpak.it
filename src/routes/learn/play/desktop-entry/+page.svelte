<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import Board from "$lib/components/learn/play/Board.svelte";
  import DesktopEntryBoard from "$lib/components/learn/boards/DesktopEntryBoard.svelte";
  import { BOARDS, waiting, type BoardStatus } from "$lib/learn/boards";

  const board = BOARDS["desktop-entry"];
  let status = $state<BoardStatus>(waiting());
</script>

<Seo
  title="Desktop entry board - cpak"
  description="Paste a .desktop file and see exactly what cpak exports for it, line by line, decided by cpak's own code running in the page."
  path="/learn/play/desktop-entry"
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
  <DesktopEntryBoard onstatus={(next) => (status = next)} />
</Board>
