<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import CeilingPlayground from "$lib/components/learn/playgrounds/CeilingPlayground.svelte";
  import { PLAYGROUNDS, waiting, type PlaygroundStatus } from "$lib/learn/playgrounds";
  import { COURSE } from "../course";

  const meta = PLAYGROUNDS.ceiling;
  const lesson = COURSE.modules[1].lessons[0];
  let status = $state<PlaygroundStatus>(waiting());
</script>

<Seo
  title="Writing a ceiling - cpak"
  description="How to write a cpak ceiling: what a key you leave out means, why writing true grants nothing, why naming one permission holds the others that reach the same thing, and how to read what survives."
  path="/learn/administration/writing-a-ceiling"
/>

<LessonShell
  course={COURSE}
  {lesson}
  playgroundTitle={meta.title}
  playgroundLink={{ href: meta.href, label: "Open on its own" }}
  playgroundStatus={status}
>
  <p>
    A ceiling is written the same way a manifest override is, which is what
    makes it easy to misread. Everything below is what the playground beside
    this text will show you if you change it, and it is worth changing it.
  </p>

  <h2>A key you leave out is a key you left to them</h2>

  <p>
    A ceiling decides only the keys it writes. Anything it does not name is not
    denied and not granted: it is left to whatever the package asked for and the
    person who installed it allowed.
  </p>

  <p>
    So the shortest useful ceiling is short. Name the two or three things this
    host will not have, and leave the rest alone:
  </p>

  <pre><code>&lbrace;
  "network": false,
  "deviceAll": false,
  "filesystem": [&lbrace; "path": "home/Documents", "access": "read-only" &rbrace;]
&rbrace;</code></pre>

  <h2>Writing true grants nothing</h2>

  <p>
    Press <em>A ceiling that closes nothing</em>. The ceiling says
    <code>"deviceAll": false</code> and the application still has the GPU,
    because it asked for <code>deviceDri</code>, which the ceiling never named.
  </p>

  <p>
    Now try writing <code>"deviceDri": true</code> into the ceiling yourself.
    Nothing changes. A ceiling is met by intersection: writing true says this
    host will not stand in the way, which is exactly what leaving the key out
    already said. If you find yourself writing true in a ceiling to give
    something to a package, stop: the grant has to come from the manifest.
  </p>

  <h2>One door with two names is one door</h2>

  <p>
    Press <em>One door, two names</em>. The ceiling closes
    <code>socketSystemBus</code>, and <code>socketBluetooth</code> closes with
    it, because they open the same socket. Closing one and leaving the other
    would close nothing at all, so naming either holds both.
  </p>

  <p>
    The same is true of the filesystem: name <code>filesystem</code> and you
    also hold the legacy fields that reach the same directories under older
    names. The panel on the right lists what each key you wrote actually holds.
    Read it before you decide the ceiling is finished.
  </p>

  <h2>Narrowing is not only removing</h2>

  <p>
    The case the playground opens on, <em>Held to one directory</em>, is the one
    worth understanding: the package asked for the whole home read-write, the
    ceiling allows the home read-only, and the result is not a refusal. The
    grant survives, holding less. A path the ceiling does not cover, on the
    other hand, is not downgraded: it is gone.
  </p>

  <p>
    Which is why the count of permissions is a poor way to check your work. Read
    the table of what changed, not the total.
  </p>

  <h2>Before you set it on a real machine</h2>

  <p>
    Paste your own ceiling into the playground with the manifest of something
    your users actually run, and read what comes out. A ceiling that closes more
    than you meant does not fail loudly: the application starts, and something
    inside it stops working a week later.
  </p>

  <p>
    <code>cpak system explain ORIGIN</code> answers the same question on the
    machine itself, for a package that is really installed.
  </p>
</LessonShell>
