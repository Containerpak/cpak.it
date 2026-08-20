<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import { COURSE } from "../course";

  const lesson = COURSE.modules[0].lessons[0];
</script>

<Seo
  title="What you decide, and what you do not - cpak"
  description="What an administrator can decide about cpak on a machine they look after: how wide anything may run, whether a launch has to match what was recorded, and whose software the host takes at all."
  path="/learn/administration/what-you-decide"
/>

<LessonShell course={COURSE} {lesson}>
  <p>
    Start with what you do not decide. cpak installs into a person's own home
    directory, as that person, with no root and no system-wide package list. You
    cannot approve an installation, you cannot see one from another account, and
    removing a package from the machine is not something you do.
  </p>

  <p>
    That is deliberate, and it is why there is anything on this page at all: if
    the runtime handed every user a sandbox and gave the machine owner no say in
    how wide it could be, a managed fleet could not use it. So it gives you
    three decisions, and every one of them is about the machine rather than
    about any one installation.
  </p>

  <h2>One: how wide anything may be</h2>

  <p>
    A <strong>ceiling</strong> is a policy file that sits above every
    installation on the host. Whatever a package asks for, and whatever the
    person who installed it allows, is held to what the ceiling permits.
  </p>

  <pre><code>cpak system set-ceiling /etc/cpak/ceiling.json
cpak system ceiling            # what is in force now
cpak system set-ceiling none   # remove it</code></pre>

  <p>
    Setting it asks for an administrator password, and the file is read and
    understood before anybody is asked for one, so a mistyped path costs you a
    message rather than an authentication. It applies to every account on the
    machine, including yours.
  </p>

  <p>
    The next lesson is how to write one, and it is worth being clear now about
    the thing that catches people: <strong>a ceiling never grants</strong>. It
    is met by intersection. It can only take away.
  </p>

  <h2>Two: whether a launch has to match</h2>

  <p>
    When an application is installed, cpak records what it was: which layers,
    under which policy, signed by whom. <strong>Enforcement</strong> is your
    decision about what happens when a launch does not match that record.
  </p>

  <pre><code>cpak system set-enforcement warn
cpak system enforcement        # what is in force now</code></pre>

  <p>
    Three levels, and they are a sequence rather than a menu:
  </p>

  <p>
    <strong>off</strong> is the default, and it is why cpak can ship this at all:
    a machine that has never been set up behaves as it always did.
  </p>

  <p>
    <strong>warn</strong> says at every launch what <code>refuse</code> would
    have refused, and lets it run. This is where you live for a while. It costs
    nothing and it tells you exactly which packages on your fleet would stop.
  </p>

  <p>
    <strong>refuse</strong> is the point of the exercise: an application the
    ledger does not recognise does not start.
  </p>

  <p>
    Going from off to refuse without spending time in warn is how you find out
    at nine on a Monday which application nobody had re-enrolled.
  </p>

  <h2>Three: whose software this host takes</h2>

  <p>
    Whether an unsigned package is enrolled at all, and which publishers you
    accept a signature from. That one has a lesson of its own further on,
    because it is the decision with a file behind it rather than a value.
  </p>

  <h2>What none of them can do</h2>

  <p>
    A ceiling cannot give a package something its manifest never asked for, and
    enforcement cannot make an unsigned package signed. Both narrow. If what you
    need is for people to only install software somebody vouched for, that is a
    third decision, and it is the next lesson but one.
  </p>
</LessonShell>
