<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import Board from "$lib/components/learn/play/Board.svelte";
  import FilesystemBoard from "$lib/components/learn/boards/FilesystemBoard.svelte";
  import { BOARDS, waiting, type BoardStatus } from "$lib/learn/boards";

  const board = BOARDS.filesystem;
  let status = $state<BoardStatus>(waiting());
</script>

<Seo
  title="Filesystem board - cpak"
  description="Write a cpak filesystem permission list and see the host directory and the path inside the sandbox each entry resolves to, decided by cpak's own code running in the page."
  path="/learn/play/filesystem"
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
  <FilesystemBoard onstatus={(next) => (status = next)} />
</Board>
