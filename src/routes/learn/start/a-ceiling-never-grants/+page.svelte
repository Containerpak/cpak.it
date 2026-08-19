<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import { COURSE } from "../course";

  const lesson = COURSE.modules[1].lessons[1];
</script>

<Seo
  title="A ceiling narrows, and never grants - cpak"
  description="The second lesson on cpak permissions: an administrator's ceiling is met by intersection, so writing a permission as true in it is not a grant, and a key it leaves out is left to the manifest and the owner."
  path="/learn/start/a-ceiling-never-grants"
/>

<LessonShell course={COURSE} {lesson}>
  <p>
    On a machine you do not hold root on, an administrator writes a ceiling: the
    widest policy that host allows. Whatever a package asks for, and whatever
    the owner of an installation allows it, is held to that file.
  </p>

  <p>
    A ceiling is a permission set, written the same way a package writes its
    request. That is what makes people misread it, so take this line first: a
    ceiling is met by intersection. It removes. It cannot add.
  </p>

  <h2>Writing true in a ceiling grants nothing</h2>

  <p>
    A ceiling containing <code>"deviceDri": true</code> gives no package the graphics
    device. It says the host does not stand in the way of a package that asks for
    it, which is what leaving the key out would have said too. An application that
    asks for nothing keeps nothing, under a permissive ceiling and a strict one alike.
  </p>

  <p>
    The other half of the file is the useful one. <code>"network": false</code>
    closes the network for everything on the host, whoever published it. A
    <code>filesystem</code> list in the ceiling holds every filesystem request down
    to what that list allows: name read-only access to the download directory, and
    a package asking for the whole home directory becomes an application that reads
    one folder.
  </p>

  <h2>A key it does not name is a key it does not decide</h2>

  <p>
    A ceiling that closes the session bus and the network says nothing about
    audio, devices or the accessibility bus, and applications keep whatever they
    asked for there. Write down the decisions you want to make. Everything else
    stays where it was.
  </p>

  <p>
    So a ceiling is not a description of what runs. It is one of three inputs:
    the package asks, the owner of the installation may replace that request
    outright, and the ceiling narrows what survived.
  </p>

  <h2>Signatures are a separate question</h2>

  <p>
    The ceiling treats a package nobody signed and a package from an approved
    publisher exactly alike. Approving a publisher does not grant whatever they
    decide to ask for in a later release, which is why the two controls live in
    two files.
  </p>

  <p>
    Open the <a href="/learn/play/ceiling">ceiling playground</a> to set a manifest,
    an owner override and a ceiling against each other and read what survives
    all three. <a href="/docs/managed-deployment">Managed deployment</a> is the reference
    behind this lesson.
  </p>
</LessonShell>
