<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import { COURSE } from "../course";

  const lesson = COURSE.modules[3].lessons[0];
</script>

<Seo
  title="Reading a refusal - cpak"
  description="What to do when cpak refuses: how to see what is in force on a host, why one package is being held, and how to give up what a removal left behind."
  path="/learn/administration/reading-a-refusal"
/>

<LessonShell course={COURSE} {lesson}>
  <p>
    Everything so far was setting policy. This lesson is the other half of the
    job: somebody says an application will not start, and you have five minutes
    to say why.
  </p>

  <h2>What is in force here</h2>

  <pre><code>cpak system status</code></pre>

  <p>
    The first command to run and the one people skip. It answers what the
    enforcement level is, what the signature policy is, whether a ceiling and a
    trust policy are set. A surprising number of "cpak is broken" reports are a
    host somebody set to <code>refuse</code> and forgot.
  </p>

  <h2>Why this one package</h2>

  <pre><code>cpak system explain github.com/example/thing</code></pre>

  <p>
    The same question asked about one installation that really exists on this
    machine, rather than about the policy in the abstract. It is the answer to
    "the ceiling looks fine, so why is this being narrowed", and it is the thing
    to paste into a ticket.
  </p>

  <p>
    The ceiling playground answers the same question before you set anything.
    This one answers it afterwards, on the machine, about a real package.
  </p>

  <h2>The refusal that outlives the application</h2>

  <p>
    Removing an application does not remove what the ledger knows about it. The
    generation it had reached and whether a publisher had ever answered for it
    are kept, so that removing something cannot become the way to put an older
    or unsigned version in its place.
  </p>

  <p>
    Which is right, and which produces the one refusal that confuses people: a
    reinstall that will not enrol, on a machine where the application is not
    even installed. The message says so and names the way out.
  </p>

  <pre><code>cpak system clear-removal github.com/example/thing</code></pre>

  <p>
    This gives that memory up. It asks for an administrator password, and there
    is deliberately no cheaper version of it for your own account: forgetting an
    anchor leaves an application with less, while this hands back a floor that
    was standing against a downgrade, an unsigning and a widening at once.
  </p>

  <p>
    Before anybody authenticates, it prints what is about to be given up. Read
    that. If the generation it names is higher than the one you are about to
    install, the refusal was doing its job and clearing it is how you install
    the older thing anyway.
  </p>

  <h2>The order to work in</h2>

  <p>
    Status first, because it is one command and it explains most reports.
    Explain second, because it turns a policy question into a fact about one
    package. Clear-removal last, and only when you have read what it says you
    are giving up: it is the only one of the three that decides something rather
    than reporting it.
  </p>
</LessonShell>
