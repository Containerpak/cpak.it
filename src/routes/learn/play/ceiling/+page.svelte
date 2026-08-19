<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import Board from "$lib/components/learn/play/Board.svelte";
  import CeilingBoard from "$lib/components/learn/boards/CeilingBoard.svelte";
  import { BOARDS, waiting, type BoardStatus } from "$lib/learn/boards";

  const board = BOARDS.ceiling;
  let status = $state<BoardStatus>(waiting());
</script>

<Seo
  title="The ceiling board - cpak"
  description="Set a manifest, an owner override and an administrator ceiling against each other, and read the permissions and mounts that survive all three, decided by cpak's own code running in the page."
  path="/learn/play/ceiling"
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
  <CeilingBoard onstatus={(next) => (status = next)} />
</Board>
