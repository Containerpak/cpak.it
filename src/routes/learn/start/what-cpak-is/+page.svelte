<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import { COURSE } from "../course";

  const lesson = COURSE.modules[0].lessons[0];
</script>

<Seo
  title="An application that starts with nothing - cpak"
  description="The first lesson: what cpak is, what it installs, and why an application you install with it cannot read the rest of your files."
  path="/learn/start/what-cpak-is"
/>

<LessonShell course={COURSE} {lesson}>
  <p>
    cpak installs applications on Linux. What makes it different from the
    package manager your distribution ships is what an installed application is
    allowed to do afterwards.
  </p>

  <p>
    Install a program the ordinary way and it runs as you. It can read every
    file you can read: your documents, your photos, your browser profile, the
    keys in <code>~/.ssh</code>. Nothing asked you about any of that, and
    nothing is watching. A text editor and a password manager have exactly the
    same reach.
  </p>

  <p>
    Install the same program with cpak and it starts with none of it. No
    directory, no microphone, no network, no window. Everything it can touch is
    something it asked for by name, in a file that ships with it and that you
    can read before you install.
  </p>

  <h2>What actually gets installed</h2>

  <p>
    An application you install with cpak is not a set of files spread across
    your system. It is an image: the program and everything it needs to run,
    downloaded as one thing and kept together.
  </p>

  <p>
    Beside the image comes a short file, the manifest. It is the list of what
    the application wants: which folders, which devices, whether it may reach
    the network. Nothing else is granted, and there is no default that quietly
    hands over more.
  </p>

  <p>
    When you run it, cpak builds a small world around the program. Inside that
    world the program sees its own image and whatever the manifest asked for.
    Everything else on your machine simply is not there. Not hidden, not
    read-only: absent.
  </p>

  <h2>Why this is worth the trouble</h2>

  <p>
    Because the interesting question about software you did not write is not
    whether it is malicious. It is what it could do if it were, or if it were
    compromised next year, or if the person maintaining it changed.
  </p>

  <p>
    A manifest turns that from a matter of trust into a matter of reading. You
    can look at what an application asked for, before you install it, and decide
    whether the answer is reasonable for what the thing claims to be. A
    calculator that asks for your home directory is a calculator you now know
    something about.
  </p>

  <h2>Three words you will keep meeting</h2>

  <p>
    <strong>Package</strong>. The application as cpak installs it: the image,
    the manifest, and the name it is published under.
  </p>

  <p>
    <strong>Manifest</strong>. The file that lists what the package asks for.
    You will read a lot of these.
  </p>

  <p>
    <strong>Permission</strong>. One line in that list. A folder, a device, a
    socket, the network. The next lesson is about what one of them really opens,
    which is usually more than its name suggests.
  </p>
</LessonShell>
