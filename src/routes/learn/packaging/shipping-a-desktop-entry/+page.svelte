<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import DesktopEntryPlayground from "$lib/components/learn/playgrounds/DesktopEntryPlayground.svelte";
  import { PLAYGROUNDS, waiting, type PlaygroundStatus } from "$lib/learn/playgrounds";
  import { COURSE } from "../course";

  const meta = PLAYGROUNDS["desktop-entry"];
  const lesson = COURSE.modules[1].lessons[1];
  let status = $state<PlaygroundStatus>(waiting());
</script>

<Seo
  title="Shipping a desktop entry - cpak"
  description="What cpak does to the .desktop file your image ships: which lines it rewrites, why it rewrites every spelling of Exec, and the one thing it will not invent for you."
  path="/learn/packaging/shipping-a-desktop-entry"
/>

<LessonShell
  course={COURSE}
  {lesson}
  playgroundTitle={meta.title}
  playgroundLink={{ href: meta.href, label: "Open on its own" }}
  playgroundStatus={status}
>
  <p>
    Your image ships a <code>.desktop</code> file. Exported as written, its
    <code>Exec</code> line would start your program on the host, outside the
    container, with everything the person running it can reach. So cpak does not
    export it as written: it reads the file and rewrites every command in it to
    go through <code>cpak run</code>.
  </p>

  <p>
    The playground beside this text is that rewriting, line by line. It starts
    on <em>A published entry</em>, which is the ordinary case.
  </p>

  <h2>Every spelling, not the obvious one</h2>

  <p>
    Press <em>The same key, three ways</em>. Three lines in that file set
    <code>Exec</code>, spelled with a leading space, a tab, and a gap before the
    equals sign. A launcher does not compare bytes: it strips that whitespace,
    reads all three as the same key, and runs the last one it finds.
  </p>

  <p>
    Which means rewriting the first one and leaving the others is worse than
    doing nothing, because the file would look handled and the program would
    still start outside the container. All three are rewritten. If you take one
    thing from this lesson: the launcher's rules, not the file's appearance,
    decide what runs.
  </p>

  <h2>And nothing that only looks like it</h2>

  <p>
    Press <em>Lines that only look like Exec</em>. Four lines contain the word
    and one sets the key. A comment is not a key. <code>Exec[de]</code> is a
    different key. <code>ExecPath</code> is a different key. A value that happens
    to spell the word is a value. Nothing is rewritten that a launcher would not
    have run, because a rewritten line that was never a command is a file you
    have quietly corrupted.
  </p>

  <h2>What it will not do for you</h2>

  <p>
    Press <em>A file with no [Desktop Entry] group</em>. The commands are still
    rewritten, because a command a launcher can reach has to run inside the
    sandbox wherever it is written. What cpak does not do is invent the group
    that should have been there.
  </p>

  <p>
    That is the shape of the whole feature: it fixes what it can read and refuses
    to guess at what you did not write. A file with no group is a file to fix in
    your image, and the export will tell you so rather than making something up.
  </p>

  <h2>Two files, not one</h2>

  <p>
    The entry cpak writes is not the entry you shipped, and both stay readable:
    yours in the image, and the exported one under the user's applications
    directory. Paste your own file into the playground before you publish. If a
    line you expected to be rewritten is marked left alone, that is the bug, and
    it is much cheaper to find here than after somebody installs it.
  </p>

  <p>
    <a href="/docs/system-integration">System integration</a> is the reference behind
    this lesson.
  </p>
</LessonShell>
