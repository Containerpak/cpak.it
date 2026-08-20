<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import { COURSE } from "../course";

  const lesson = COURSE.modules[2].lessons[1];
</script>

<Seo
  title="Fetch a vendor payload safely - cpak"
  description="Use runtime sources for software that must be downloaded from its vendor, with an exact artifact identity and a staged install."
  path="/learn/engineering/runtime-sources"
/>

<LessonShell course={COURSE} {lesson}>
  <p>
    Some software may be packaged but not redistributed inside a public OCI
    image. A runtime source keeps the cpak recipe public while the user's machine
    downloads the original artifact from the vendor.
  </p>

  <h2>Declare one exact artifact</h2>

  <pre><code>"runtime_sources": [
  &lbrace;
    "name": "editor-amd64.deb",
    "url": "https://vendor.example/download/editor-amd64.deb",
    "sha256": "9f4d...64 hexadecimal characters...",
    "size": 48310272,
    "installer": "deb-extract",
    "architecture": "amd64"
  &rbrace;
]</code></pre>

  <p>
    The URL must use HTTPS, including redirects. Size is checked against the
    announced and downloaded bytes. SHA-256 identifies the content, and an
    architecture filter prevents the wrong payload from being installed.
  </p>

  <h2>Choose the smallest installer contract</h2>

  <p>
    <code>deb-extract</code> and <code>rpm</code> extract package payloads without
    turning the cpak into the host distribution. <code>tar</code> handles an
    archive. <code>file</code> installs one file at an explicit path below
    <code>/opt</code>. <code>dpkg</code> remains available for packages whose
    maintainer scripts are part of the required installation behavior.
  </p>

  <p>
    Do not select <code>dpkg</code> because the input ends in <code>.deb</code>.
    Use it only when the scripts are necessary and have been reviewed. Extraction
    is the smaller trust boundary for most desktop payloads.
  </p>

  <h2>Stage before switching the package</h2>

  <p>
    cpak downloads into a temporary file, limits the stream to the declared size,
    verifies the hash and installs into a managed runtime layer. An update stages
    the new manifest, OCI layers, runtime sources, exports and database record,
    then changes the active version only after every step succeeds.
  </p>

  <p>
    A runtime source is not a mutable update channel. A changed vendor artifact
    requires a changed size or digest in a reviewed package revision. The installed
    source remains tied to that package version and participates in rollback.
  </p>

  <h2>Keep user-facing metadata in the recipe</h2>

  <p>
    The thin OCI image still contains the wrapper, original icon, desktop entry
    and any integration files the application needs. The vendor payload supplies
    the program. The recipe supplies the cpak contract and a stable launch path.
  </p>

  <p><a href="/docs/manifest">Manifest reference</a> lists the supported installer fields and validation rules.</p>
</LessonShell>
