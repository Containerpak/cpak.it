<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import { COURSE } from "../course";

  const lesson = COURSE.modules[3].lessons[0];
</script>

<Seo
  title="Model addons with provider slots - cpak"
  description="Choose nested, layer or optional composition, then use provider slots to resolve interchangeable SDKs and multi-provider capabilities."
  path="/learn/engineering/addons-and-provider-slots"
/>

<LessonShell course={COURSE} {lesson}>
  <p>
    Composition starts with one question: does the parent require this package,
    or can it work without it? Required packages are dependencies. Optional
    capabilities are addons.
  </p>

  <h2>Choose the runtime relationship</h2>

  <p>
    A nested dependency keeps its own sandbox and exposes only declared commands.
    A layer dependency contributes files directly to the parent root. An addon is
    installed and composed only after the user enables it for that parent.
  </p>

  <p>
    Addon layers follow the parent manifest order. Later layers win when two
    packages provide the same path. The addon cannot expand the parent's host
    permissions, and its own manifest permissions matter only when it runs alone.
  </p>

  <h2>A provider says what capability it supplies</h2>

  <pre><code>"addon_provider": &lbrace;
  "id": "go",
  "slot": "sdk.go",
  "mode": "exclusive",
  "exports": &lbrace;
    "path": ["/opt/go/bin"],
    "include_path": ["/opt/go/include"]
  &rbrace;
&rbrace;</code></pre>

  <p>
    The slot names the capability, not the package repository. The provider ID
    names one implementation inside that slot. Exports add tool, library, include,
    pkg-config and CMake paths without assuming every SDK installs under
    <code>/usr</code>.
  </p>

  <h2>Exclusive and multiple slots solve different cases</h2>

  <p>
    An <code>exclusive</code> slot activates one provider. A developer can install
    Go and TinyGo, then select which one supplies <code>sdk.go</code> to an editor.
    A <code>multiple</code> slot activates every enabled provider, which fits Steam
    compatibility tools such as GE-Proton and ProtoSoda.
  </p>

  <pre><code>cpak addon slots github.com/containerpak/vscode
cpak addon providers github.com/containerpak/vscode sdk.go
cpak addon use github.com/containerpak/vscode sdk.go go</code></pre>

  <p>
    Selection is stored for the parent application. Installing a new provider does
    not silently replace an explicit selection. Removing an active provider clears
    or rejects the selection according to the slot contract.
  </p>

  <h2>Discovery stays local</h2>

  <p>
    cpak evaluates providers from installed addons supported by the parent. The
    Store does not assign a global winner. This keeps decentralized package origins
    while giving applications stable capability names.
  </p>

  <p><a href="/docs/dependencies-addons">Dependencies and addons</a> covers package composition and testing both enabled and disabled states.</p>
</LessonShell>
