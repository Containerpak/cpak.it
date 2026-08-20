A ceiling decides how wide anything may be. Enforcement decides whether a launch matches what was recorded. Neither asks the question a fleet asks first: **whose software is this?**

## Whether an unsigned package is enrolled

```
cpak system signatures            # what is in force
cpak system set-signatures required
```

Two values. `optional` is the default and behaves as cpak always has: a package nobody signed is enrolled, and the record says it was unsigned. The distinction is written down whether or not the host acts on it, which is what makes turning this on later possible at all.

`required` refuses to enrol an application that no identity entitled to speak for its origin signed. Read that carefully: it refuses the _enrolment_, not the install. Software already on disk and working is not made safer by being half removed, so it stays, unenrolled, and is reported as such.

Which is why this setting and enforcement compose instead of fighting. An application left unenrolled is a state enforcement already has an answer for: under `warn` it starts and says so, under `refuse` it does not start. You do not need both settings to invent a refusal of their own.

## Which publishers this host takes one from

A signature says somebody signed. It does not say you accept them. That is the trust policy, and it is a file:

```
cpak system set-trust /etc/cpak/trust.json
cpak system trust                 # what is in force
cpak system set-trust none        # remove it
```

```
{
  "abi": 1,
  "require_publisher": true,
  "approved_signers": [{ "issuer": "https://token.actions.githubusercontent.com" }],
  "approved_origins": ["github.com/yourcompany/"],
  "revoked": [{ "origin": "github.com/someone/thing", "reason": "key lost" }]
}
```

An empty policy allows everything, so a host nobody has decided anything about behaves as it does today. A field left out of a signer means _any_: the example above accepts anything signed through GitHub Actions, whoever the repository belongs to.

## Signed by someone, and approved by us

`require_publisher` and `require_approval` are two different demands and the file keeps them apart on purpose.

The first says a package must be signed by somebody on your list. The second says **your organisation counter-signed this exact state**: not the origin, not the publisher, this build. That is the one to reach for when what you need is a review gate rather than a provenance check.

## Taking trust back

A revocation withdraws what was already approved. Give it a generation and it withdraws that one; leave the generation out and it withdraws every generation of that origin. The reason is written down beside it, because an administrator six months from now reading their own policy is the person the reason is for.

The decision that comes back always carries why, whether the answer is yes or no. Working out why an application started is the same work as working out why it did not.

[Managed deployment](/docs/managed-deployment) has the whole file format.
