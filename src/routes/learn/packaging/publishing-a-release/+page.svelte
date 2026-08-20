<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import { COURSE } from "../course";

  const lesson = COURSE.modules[3].lessons[0];
</script>

<Seo
  title="Publish a reproducible release - cpak"
  description="Publish a cpak package with immutable image references, checksums, provenance and a Store guide tied to the selected source revision."
  path="/learn/packaging/publishing-a-release"
/>

<LessonShell course={COURSE} {lesson}>
  <p>
    A package release connects a Git revision, one manifest and the image digest
    produced for it. The repository is the package origin; the Store is a catalog
    that points people to that origin.
  </p>

  <h2>Make the source and image agree</h2>

  <p>
    Build the image from the tagged source and publish every supported
    architecture. <code>image_ref: source</code> can follow the selected Git
    branch, release or commit while <code>cpak lock</code> records immutable image
    digests for the resolved graph.
  </p>

  <pre><code>cpak validate cpak.json
cpak lock cpak.json
cpak test cpak.json</code></pre>

  <p>
    Attach an SBOM and build provenance in CI. Verify vendor checksums before
    copying artifacts into an image, and keep the final stage free of build caches.
  </p>

  <h2>Write for the Store separately</h2>

  <p>
    <code>README.md</code> explains the repository to contributors.
    <code>STORE-README.md</code> explains installation, first launch or vendor
    authentication to the person using the package. The Store reads it from the
    same resolved tag or commit as the manifest, never from an unrelated moving
    branch.
  </p>

  <h2>Review permission changes as API changes</h2>

  <p>
    Adding a permission changes the package contract. Interactive updates show the
    new request before activation. Non-interactive updates refuse a permission
    increase. Mention the reason in the package release rather than hiding it in a
    manifest diff.
  </p>

  <p>
    Test first install, update, rollback and removal. If the package has addons or
    nested dependencies, include their install and cleanup paths in the test.
  </p>

  <p><a href="/docs/publishing">Publishing packages</a> covers Store metadata, signatures and release channels.</p>
</LessonShell>
