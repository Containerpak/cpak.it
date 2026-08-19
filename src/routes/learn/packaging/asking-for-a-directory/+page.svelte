<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import FilesystemPlayground from "$lib/components/learn/playgrounds/FilesystemPlayground.svelte";
  import { PLAYGROUNDS, waiting, type PlaygroundStatus } from "$lib/learn/playgrounds";
  import { COURSE } from "../course";

  const meta = PLAYGROUNDS.filesystem;
  const lesson = COURSE.modules[1].lessons[0];
  let status = $state<PlaygroundStatus>(waiting());
</script>

<Seo
  title="Asking for a directory - cpak"
  description="How a cpak manifest asks for filesystem access: the scopes a path can be written in, why read-only is the honest default, and what each entry lands as on the machine that installs it."
  path="/learn/packaging/asking-for-a-directory"
/>

<LessonShell
  course={COURSE}
  {lesson}
  playgroundTitle={meta.title}
  playgroundLink={{ href: meta.href, label: "Open on its own" }}
  playgroundStatus={status}
>
  {#snippet playground()}
    <FilesystemPlayground onstatus={(next) => (status = next)} />
  {/snippet}

  <p>
    A photo editor needs somewhere to open photos from. There are four ways to
    write that, and they are not close to equivalent. Press each of the presets
    in the playground and watch the right-hand column.
  </p>

  <h2>Four scopes, worst first</h2>

  <p>
    <strong>The whole machine.</strong> <code>host</code>, read-only, is every
    file on the system that the user running it can read. Press
    <em>The whole machine</em> and read how much lands. There are real reasons to
    ask for it, and a photo editor is not one of them.
  </p>

  <p>
    <strong>The whole home.</strong> <code>home</code> is every document, every
    downloaded file, every dot-directory including the one your browser keeps
    its session in. It is the most commonly over-asked grant in any packaging
    system, because it is the one that always works.
  </p>

  <p>
    <strong>A user directory.</strong> <code>xdg-pictures</code>,
    <code>xdg-documents</code>, <code>xdg-download</code> and the rest resolve
    against whatever that person's desktop has them set to, so
    <code>xdg-pictures</code> is the right answer even on a machine where it is
    called <em>Immagini</em>. Press <em>Every user directory</em> and look at the
    resolved column: the name on the left and the path on the right are not the
    same string, and that is the point.
  </p>

  <p>
    <strong>One path.</strong> <code>home/.config/fotoritocco</code> is one
    directory and nothing else. Most applications need one of these for their own
    settings and one user directory for the files a person opens, and nothing
    more.
  </p>

  <h2>Read-only is a real answer</h2>

  <p>
    Every entry carries an access mode, and <code>read-only</code> is not a
    consolation prize. A viewer that never saves should ask for it. A converter
    that reads from one place and writes to another should ask for read-only on
    the first and read-write on the second, in two entries, rather than
    read-write on a directory that contains both.
  </p>

  <p>
    Change an access mode in the playground and nothing else. The paths do not
    move; what changes is what the application may do when it gets there.
  </p>

  <h2>What cpak refuses</h2>

  <p>
    Try <em>A list cpak refuses</em>. Some of these look reasonable and are not:
    a relative path has nothing to resolve against, <code>/</code> is the whole
    machine written in a way that hides it, and the same path twice is two
    different answers to one question. cpak refuses the manifest rather than
    picking one.
  </p>

  <h2>The question to ask per line</h2>

  <p>
    For every entry, name the file the program will open first. If you cannot
    name one, the entry is a guess and it belongs out of the manifest until
    somebody reports the bug that needs it. A package that asks for less and
    gains an entry later is a package people trust; the other order does not
    work.
  </p>

  <p>
    <a href="/docs/permissions">Permissions</a> lists every scope and what it
    resolves to.
  </p>
</LessonShell>
