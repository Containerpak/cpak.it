---
title: Managed deployment
description: Decide centrally who may publish software on your machines and how much any application is ever allowed to do.
tags: [enterprise, security, policy]
section: runtime
order: 55
---

# Managed deployment

A signature tells you where a package came from. On its own that is a small
statement: every package is signed by its own repository, so it proves the
software arrived from where it says it did and nothing more. It does not say
whether your organisation wants to run that publisher, and it does not say what
the software may do once it runs.

A managed host answers both, and it answers them from a place the person at the
keyboard cannot rewrite. There are three separate controls, and they are
separate because they fail differently.

## The ceiling: how much an application may ever do

The ceiling is the widest policy this host permits. Whatever a manifest asks
for and whatever the owner of an application allows, the result is held to it,
regardless of who published the software and whether it is signed at all.

```bash
cpak system ceiling
cpak system set-ceiling /etc/cpak/ceiling.json
cpak system set-ceiling none
```

The file is a permission set, the same shape as an override:

```json
{
  "socketWayland": true,
  "deviceDri": true,
  "network": false,
  "filesystem": [{ "path": "xdg-download", "access": "read-only" }]
}
```

An application whose manifest asks for the network gets no network. One that
asks for the whole home gets read-only access to the download directory. One
that asks for nothing keeps nothing: the ceiling never grants, it only limits.

This is the control that does not depend on trusting anybody. It holds for a
package nobody signed and for one signed by a publisher you approved, which is
the point: approving a publisher once should not be a standing grant of whatever
they decide to ask for later.

## The trust policy: who may publish

The trust policy says which origins may be installed and which identities may
sign for them. It is enforced by the privileged service when an application is
enrolled, not by the process the user is running, so bypassing the client does
not bypass the decision.

```bash
cpak system trust
cpak system set-trust /etc/cpak/trust.json
cpak system set-trust none
```

```json
{
  "abi": 1,
  "require_publisher": true,
  "approved_origins": ["github.com/acme/editor"],
  "approved_signers": [
    {
      "issuer": "https://token.actions.githubusercontent.com",
      "repo": "github.com/acme/editor"
    }
  ],
  "revoked": [
    { "origin": "github.com/acme/editor", "generation": 7, "reason": "CVE-2026-1234" }
  ]
}
```

`approved_origins` is a list of exact origins, deliberately not patterns. A
prefix such as an organisation namespace hands the decision back to anyone who
can create a repository inside it, which is the tautology this control exists to
break.

`revoked` withdraws trust from what was already approved. A revocation with no
generation withdraws every generation of that origin. Revocation always beats
approval.

## The counter-signature: a second opinion

`require_approval` goes further. The publisher signs what they publish, and your
organisation signs the same state with its own identity, saying it approved this
exact release. A host that requires an approval will not enrol an application on
the publisher's word alone.

```json
{
  "abi": 1,
  "require_approval": true,
  "approval_signers": [
    { "issuer": "https://token.actions.githubusercontent.com", "repo": "github.com/acme/approvals" }
  ]
}
```

This is what stops the trust being self-referential. Without it the only party
attesting to a package is the party that made it.

## Enforcement: what happens to what is not recognised

The three controls above decide what may be enrolled. Enforcement decides what
happens at launch to an application nothing answers for.

```bash
cpak system enforcement
cpak system set-enforcement warn
cpak system set-enforcement refuse
```

`off` is the default. `warn` refuses nothing and reports every disagreement, so
a fleet can be watched before anything is turned on. `refuse` means an
application the ledger does not recognise does not start.

A store that contradicts itself is refused at every level including `off`,
because that is not an unknown, it is a disagreement inside the store.

## Where the decisions live

Every one of these is held next to the integrity ledger under
`/var/lib/cpak/integrity`, owned by root, and read with the same checks: a
regular file, owned by root, not writable by anyone else. A file that cannot be
vouched for decides nothing, which means it can neither widen what applications
may do nor stop them running.

Setting any of them asks for an administrator password. Reading them does not:
someone whose application will not start has to be able to find out why.

## An unmanaged host

A machine where none of this is set behaves exactly as it always has. Every
existing installation is in that state, no policy file exists, and nothing is
refused. These controls are something an administrator turns on, never a default
that arrives with an update.

## What this does not give you

It does not tell you the software is safe. An approved publisher can ship a bad
release, and the answer to that is revocation, not approval.

It does not let you verify that an image corresponds to source you reviewed.
That needs reproducible builds, and no signature in any packaging system today
answers it.

An installation resolved through a lock file cannot currently present a
verifiable publisher signature, so under a policy that requires one those
applications stay unenrolled. See [verified launch](/docs/verified-launch).
