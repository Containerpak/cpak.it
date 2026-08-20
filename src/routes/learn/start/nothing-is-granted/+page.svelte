<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import PermissionsPlayground from "$lib/components/learn/playgrounds/PermissionsPlayground.svelte";
  import { PLAYGROUNDS, waiting, type PlaygroundStatus } from "$lib/learn/playgrounds";
  import { COURSE } from "../course";

  const meta = PLAYGROUNDS.permissions;
  const lesson = COURSE.modules[1].lessons[0];
  let status = $state<PlaygroundStatus>(waiting());
</script>

<Seo
  title="Nothing is granted unless the manifest asks - cpak"
  description="The first lesson on cpak permissions: a package reaches the display, the bus, audio or the network only by naming each of them, and the playground beside the text shows the paths each name binds."
  path="/learn/start/nothing-is-granted"
/>

<LessonShell
  course={COURSE}
  {lesson}
  playgroundTitle={meta.title}
  playgroundLink={{ href: meta.href, label: "Open on its own" }}
  playgroundStatus={status}
>
  {#snippet playground()}
    <PermissionsPlayground onstatus={(next) => (status = next)} />
  {/snippet}

  <p>
    Open <code>cpak.json</code> in the playground and replace the whole
    <code>override</code> object with an empty one. Every path disappears. That is where a
    package starts: no directory, no socket, no device, no route off the machine.
  </p>

  <p>
    Add <code>"socketWayland": true</code>. Two paths appear: the compositor socket
    and the lock beside it. The socket is the window, and without it the application
    draws nowhere. Run <code>cpak validate</code> in the terminal below the file to
    check the manifest through the same core used by the page.
  </p>

  <h2>Read a permission as the paths it opens</h2>

  <p>
    Add <code>"socketX11": true</code> as well. Two paths become eight. Four of the new
    ones are X11's own socket directories, the fifth is the authority file a client
    needs to connect, and the sixth is there only because both permissions are on
    at once: the cookie Xwayland writes.
  </p>

  <p>
    Read the note under the socket directory. X11 does not separate its clients,
    so anything on that display can read the clipboard, watch what is typed into
    other windows and copy their pixels. Wayland hands over none of that.
  </p>

  <p>
    Both are one line in a manifest and both are called a permission. The name
    tells you almost nothing. The paths tell you what the application can do.
  </p>

  <h2>Eight are wider than their name</h2>

  <p>
    Most permissions open one socket or one directory. Eight open more than the
    thing they name. The reference under the workspace gives you every key accepted
    by this build, while the answer beside the manifest shows what each change opens.
  </p>

  <p>
    Three of them open a bus rather than a service:
    <code>socketSessionBus</code>, <code>socketSystemBus</code> and
    <code>socketBluetooth</code>, which binds the same socket as the system bus
    under a friendlier name. What a package reaches through a bus is whatever
    the host has listening on it, which is settled on the machine rather than in
    the manifest.
  </p>

  <p>
    <code>deviceAll</code> binds <code>/dev/</code> whole, and eleven device permissions
    below it stop meaning anything while it is on.
  </p>

  <p>
    The last four bind no path at all, which is what makes them easy to skip
    over. <code>network</code> gives the container a route off the machine
    instead of a network namespace of its own. <code>process</code> shares the
    host process namespace, so the package sees processes outside the sandbox.
    <code>userNamespaces</code>
    lets the application build a nested sandbox, which a browser needs and almost
    nothing else does. <code>asRoot</code> runs the process as uid 0 inside the container.
  </p>

  <p>
    Take the package you want to ship and ask which of those eight it cannot
    work without. That question is what a manifest review is made of.
  </p>

  <p>
    <a href="/docs/permissions">Permissions</a> is the reference behind this lesson.
  </p>
</LessonShell>
