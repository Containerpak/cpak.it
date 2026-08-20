<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import LessonShell from "$lib/components/learn/LessonShell.svelte";
  import { COURSE } from "../course";

  const lesson = COURSE.modules[2].lessons[0];
</script>

<Seo
  title="Requiring a signature - cpak"
  description="The third decision an administrator makes: whether this host enrols a package nobody signed, and which publishers it will take one from."
  path="/learn/administration/requiring-a-signature"
/>

<LessonShell course={COURSE} {lesson}>
  <p>
    A ceiling decides how wide anything may be. Enforcement decides whether a
    launch matches what was recorded. Neither asks the question a fleet asks
    first: <strong>whose software is this?</strong>
  </p>

  <h2>Whether an unsigned package is enrolled</h2>

  <pre><code>cpak system signatures            # what is in force
cpak system set-signatures required</code></pre>

  <p>
    Two values. <code>optional</code> is the default and behaves as cpak always
    has: a package nobody signed is enrolled, and the record says it was
    unsigned. The distinction is written down whether or not the host acts on
    it, which is what makes turning this on later possible at all.
  </p>

  <p>
    <code>required</code> refuses to enrol an application that no identity
    entitled to speak for its origin signed. Read that carefully: it refuses the
    <em>enrolment</em>, not the install. Software already on disk and working is
    not made safer by being half removed, so it stays, unenrolled, and is
    reported as such.
  </p>

  <p>
    Which is why this setting and enforcement compose instead of fighting. An
    application left unenrolled is a state enforcement already has an answer
    for: under <code>warn</code> it starts and says so, under
    <code>refuse</code> it does not start. You do not need both settings to
    invent a refusal of their own.
  </p>

  <h2>Which publishers this host takes one from</h2>

  <p>
    A signature says somebody signed. It does not say you accept them. That is
    the trust policy, and it is a file:
  </p>

  <pre><code>cpak system set-trust /etc/cpak/trust.json
cpak system trust                 # what is in force
cpak system set-trust none        # remove it</code></pre>

  <pre><code>&lbrace;
  "abi": 1,
  "require_publisher": true,
  "approved_signers": [&lbrace; "issuer": "https://token.actions.githubusercontent.com" &rbrace;],
  "approved_origins": ["github.com/yourcompany/"],
  "revoked": [&lbrace; "origin": "github.com/someone/thing", "reason": "key lost" &rbrace;]
&rbrace;</code></pre>

  <p>
    An empty policy allows everything, so a host nobody has decided anything
    about behaves as it does today. A field left out of a signer means
    <em>any</em>: the example above accepts anything signed through GitHub
    Actions, whoever the repository belongs to.
  </p>

  <h2>Signed by someone, and approved by us</h2>

  <p>
    <code>require_publisher</code> and <code>require_approval</code> are two
    different demands and the file keeps them apart on purpose.
  </p>

  <p>
    The first says a package must be signed by somebody on your list. The second
    says <strong>your organisation counter-signed this exact state</strong>: not
    the origin, not the publisher, this build. That is the one to reach for when
    what you need is a review gate rather than a provenance check.
  </p>

  <h2>Taking trust back</h2>

  <p>
    A revocation withdraws what was already approved. Give it a generation and
    it withdraws that one; leave the generation out and it withdraws every
    generation of that origin. The reason is written down beside it, because an
    administrator six months from now reading their own policy is the person the
    reason is for.
  </p>

  <p>
    The decision that comes back always carries why, whether the answer is yes
    or no. Working out why an application started is the same work as working
    out why it did not.
  </p>

  <p>
    <a href="/docs/managed-deployment">Managed deployment</a> has the whole file format.
  </p>
</LessonShell>
