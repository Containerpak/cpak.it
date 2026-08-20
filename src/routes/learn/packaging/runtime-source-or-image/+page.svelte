<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import { COURSE } from "../course";

  const lesson = COURSE.modules[2].lessons[0];
</script>

<Seo
  title="Choose image or runtime source - cpak"
  description="Decide whether the application payload belongs in the OCI image or must be fetched from its vendor during installation."
  path="/learn/packaging/runtime-source-or-image"
/>

<LessonShell course={COURSE} {lesson}>
  <p>
    Put the application in the OCI image when its license permits redistribution.
    The image is then a complete, content-addressed runtime that registries can
    cache and cpak can deduplicate by layer.
  </p>

  <p>
    Use a runtime source when the software may be packaged but the vendor requires
    each user to download the original payload. The image stays thin and contains
    the wrapper, icon, desktop entry and integration files.
  </p>

  <h2>A runtime source is still pinned</h2>

  <pre><code>"runtime_sources": [
  &lbrace;
    "url": "https://vendor.example/editor.deb",
    "sha256": "9f4d...",
    "size": 48310272,
    "installer": "deb-extract",
    "architecture": "amd64"
  &rbrace;
]</code></pre>

  <p>
    cpak accepts HTTPS, verifies the exact byte count and SHA-256, then installs
    into a managed layer. If the vendor changes the file, the package revision
    must change too. A moving URL is not allowed to silently change an install.
  </p>

  <h2>Do not run package scripts by habit</h2>

  <p>
    Use <code>deb-extract</code> or <code>rpm</code> when the payload is what you
    need. Use <code>dpkg</code> only when reviewed maintainer scripts are required.
    Tar archives use <code>tar</code>; a single artifact uses <code>file</code> with
    an explicit destination below <code>/opt</code>.
  </p>

  <p>
    Test the package with an empty runtime source cache. A successful launch on a
    machine that already has the vendor program installed proves nothing about
    the recipe.
  </p>
</LessonShell>
