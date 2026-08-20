<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import { COURSE } from "../course";

  const lesson = COURSE.modules[0].lessons[1];
</script>

<Seo
  title="Build the runtime image - cpak"
  description="Choose a maintained cpak platform, separate build and runtime stages, keep translations and verify every published architecture."
  path="/learn/packaging/building-the-image"
/>

<LessonShell course={COURSE} {lesson}>
  <p>
    A cpak image is a normal OCI image, but its job is narrower than a server
    container. It needs the application and the libraries that application uses.
    It does not need cpak, a service manager, manuals or build tools.
  </p>

  <h2>Choose the smallest matching platform</h2>

  <p>
    Start with the maintained platform that already supplies the required ABI:
    Mesa for graphics, GTK or Qt for a desktop toolkit, Wine for a package that
    brings its own Wine or Proton runtime. A shared platform layer is downloaded
    and stored once when several packages use the same digest.
  </p>

  <p>
    Pin a distribution release. A floating base can replace libraries without a
    package review. Containerpak platform tags expose the Ubuntu release and can
    also identify one exact published platform state.
  </p>

  <h2>Separate building from running</h2>

  <pre><code>FROM golang:1.26-bookworm AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -o /out/example ./cmd/example

FROM ghcr.io/containerpak/base:ubuntu-26.04
COPY --from=build /out/example /usr/bin/example
ENTRYPOINT ["/usr/bin/example"]</code></pre>

  <p>
    Compiler caches and headers remain in the builder. Install runtime libraries
    and run <code>cpak-clean-junk</code> in the same layer so package indexes and
    removed files never become part of an earlier OCI layer.
  </p>

  <h2>Keep application translations</h2>

  <p>
    The shared locale layer supplies compiled system locale data selected for the
    user. Your application's translation catalogs still belong in its image. Do
    not install <code>locales-all</code> or remove the catalogs your UI reads.
  </p>

  <h2>Verify every architecture you publish</h2>

  <p>
    A multi-architecture manifest is a claim that each image works. CI must build
    and inspect every declared architecture, then run at least one exported binary.
    A desktop package also needs a real graphical launch on each display path it
    claims to support.
  </p>

  <p><a href="/docs/images">Build OCI images</a> lists the current platform and SDK images.</p>
</LessonShell>
