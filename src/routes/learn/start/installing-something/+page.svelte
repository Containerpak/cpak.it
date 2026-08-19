<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import { COURSE } from "../course";

  const lesson = COURSE.modules[0].lessons[1];
</script>

<Seo
  title="Installing something - cpak"
  description="What you are shown before an application is installed, what the prompt is asking you to agree to, and how to answer it."
  path="/learn/start/installing-something"
/>

<LessonShell course={COURSE} {lesson}>
  <p>
    Installing looks like this:
  </p>

  <pre><code>cpak install github.com/containerpak/vlc</code></pre>

  <p>
    That address is the package. It is a repository, not a name in a central
    index, so the people who publish the application are the people who own the
    address. There is no queue and no gatekeeper between them and you.
  </p>

  <h2>What you are shown</h2>

  <p>
    Before anything is downloaded, cpak fetches the manifest and prints what it
    asks for. This is the whole of it, for the command above:
  </p>

  <pre><code>The following cpak(s) will be installed:
  - VLC: Play video, audio and network streams.

The following will be exported:
  - (binary) /usr/bin/vlc
  - (desktop entry) /usr/share/applications/vlc.desktop

The following permissions will be granted:
  - socket-x11: true
  - socket-wayland: true
  - socket-pulse-audio: true
  - socket-session-bus: true
  - socket-system-bus: false
  - socket-ssh-agent: false
  - device-dri: true
  - device-kvm: false
  ... twenty more, each one true or false

Do you want to continue? [y/N]</code></pre>

  <p>
    Every line is either true or false, and the false ones are printed too. A
    permission missing from the list is not a permission you have to guess
    about: there are no missing ones.
  </p>

  <p>
    This is the moment the decision happens. Afterwards the application has what
    the list said and nothing else, and you will not be asked again.
  </p>

  <p>
    Read the list against what the thing claims to be. A video player asking for
    the display, audio and your Videos folder is a video player. The same player
    asking to run as root, or for the whole of your home, is telling you
    something the description did not.
  </p>

  <h2>Yes is not the only answer</h2>

  <p>
    You can narrow a package after installing it. Whatever the manifest asked
    for, you can take away:
  </p>

  <pre><code>cpak override --socketSessionBus=false github.com/containerpak/vlc</code></pre>

  <p>
    Your decision replaces the publisher's request. It cannot widen it, only
    narrow it, and the application runs with what is left. If it stops working,
    you have learned what that permission was for, and you can put it back.
  </p>

  <h2>Where it goes</h2>

  <p>
    Everything lands under your own home directory. There is no system-wide
    install, no root, nothing dropped into <code>/usr</code>. Removing a package
    removes the image and everything it wrote.
  </p>

  <p>
    That is the whole workflow: read a list, agree or narrow it, and remove it
    cleanly when you are done. The rest of this course is about reading the list
    well, because a permission's name is a poor guide to what it opens.
  </p>
</LessonShell>
