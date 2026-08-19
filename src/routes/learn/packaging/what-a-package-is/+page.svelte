<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import { COURSE } from "../course";

  const lesson = COURSE.modules[0].lessons[0];
</script>

<Seo
  title="An image, a manifest, and an address - cpak"
  description="What a cpak package is made of, why the manifest exists, and why the address you publish under is the only name your package has."
  path="/learn/packaging/what-a-package-is"
/>

<LessonShell course={COURSE} {lesson}>
  <p>
    Publishing with cpak is publishing three things, and only one of them is
    interesting.
  </p>

  <h2>The image</h2>

  <p>
    An OCI image: your program and everything it needs to run. If you have built
    a container before, this is the same artefact and the same tools build it.
    cpak does not care how it was made, only that it can be pulled and that its
    digest is what it says it is.
  </p>

  <p>
    Nothing about the image decides what the application may touch. A program
    that opens <code>/etc/shadow</code> inside a cpak container fails, and it fails
    whether or not the image was built as root, because the container it runs in
    was never given that file.
  </p>

  <h2>The manifest</h2>

  <p>
    A short JSON file beside the image. It names the application, the binaries
    and desktop entries to export, and the access it wants. That last list is
    the whole subject of this course.
  </p>

  <pre><code>&lbrace;
  "manifest_version": "2.0",
  "name": "Fotoritocco",
  "description": "A photo editor",
  "image": "ghcr.io/example/fotoritocco:3.2",
  "binaries": ["/usr/bin/fotoritocco"],
  "override": &lbrace;
    "socketWayland": true,
    "filesystem": [&lbrace; "path": "xdg-pictures", "access": "read-write" &rbrace;]
  &rbrace;
&rbrace;</code></pre>

  <p>
    Read that override as a promise rather than a configuration. It is printed
    to the person installing your package, line by line, before anything is
    downloaded. Every line you add is a line somebody reads and weighs, and a
    line they can refuse.
  </p>

  <h2>The address</h2>

  <p>
    A package is installed from a repository address, not from a name in a
    central index:
  </p>

  <pre><code>cpak install github.com/you/fotoritocco</code></pre>

  <p>
    There is no review queue and no gatekeeper. That cuts both ways, and it is
    worth being clear about which way it cuts for you: nobody will stop you
    publishing, and nobody will vouch for you either. What a stranger has to go
    on is the manifest they can read and the signature they can check.
  </p>

  <h2>Why the manifest exists at all</h2>

  <p>
    Not to configure the sandbox. The sandbox exists whether or not you write a
    manifest, and an application with no override gets a container with no
    display, no sound, no network and no directory. The manifest is how you ask
    for the few things back.
  </p>

  <p>
    Which turns the packager's job into one question, asked once per line:
    <strong>what is the smallest thing that makes this work?</strong> Not the
    smallest thing that makes it work on your machine with your files, the
    smallest thing that makes it work at all. The next two lessons are that
    question applied to the two places people get it wrong most often: the
    filesystem, and the desktop entry.
  </p>

  <p>
    <a href="/docs/manifest">The manifest reference</a> lists every field. It is
    worth having open while you read the rest of this.
  </p>
</LessonShell>
