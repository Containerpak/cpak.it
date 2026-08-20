<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import { COURSE } from "../course";

  const lesson = COURSE.modules[2].lessons[1];
</script>

<Seo
  title="Choose dependencies and addons - cpak"
  description="Choose nested dependencies, layer dependencies or optional addons according to the runtime relationship the parent actually needs."
  path="/learn/packaging/dependencies-and-addons"
/>

<LessonShell course={COURSE} {lesson}>
  <p>
    A second package can join an application in three ways. The right choice
    depends on whether it is required and whether its files must share the parent
    root.
  </p>

  <h2>Nested dependency</h2>

  <p>
    Use the default nested mode for a required tool that should keep its own
    sandbox. The parent invokes only exported commands and the nested package gets
    the intersection of both permission boundaries. Bottles uses this relationship
    for UMU.
  </p>

  <h2>Layer dependency</h2>

  <p>
    Use <code>mode: layer</code> when required files must appear directly inside
    the parent filesystem. Those layers are composed below the application. This
    is a filesystem relationship, so the dependency does not become a separate
    service.
  </p>

  <h2>Optional addon</h2>

  <p>
    Use an addon when the parent works without it and the user should choose. The
    addon is installed on first use and its layers join the parent only while it
    is enabled for that application.
  </p>

  <pre><code>cpak addon enable github.com/example/editor github.com/example/sdk-go
cpak addon disable github.com/example/editor github.com/example/sdk-go</code></pre>

  <p>
    Put contributed files where the parent expects them, or declare an addon
    provider with explicit path, library, include, pkg-config and CMake exports.
    Test enabled and disabled states. The parent must still launch after the addon
    is removed.
  </p>

  <p><a href="/docs/dependencies-addons">Dependencies and addons</a> includes Steam and SDK examples.</p>
</LessonShell>
