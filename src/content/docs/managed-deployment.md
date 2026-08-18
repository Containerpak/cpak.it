---
title: Managed deployment
description: Decide centrally who may publish software on your machines and how much any application is ever allowed to do.
tags: [enterprise, security, policy]
section: runtime
order: 55
---

# Managed deployment

On a machine where the person at the keyboard is not the person who controls
root, three decisions belong to the administrator: how much any application may
ever do, which publishers may be installed, and what happens to an application
the host cannot account for.

Each is a separate control, held in a separate file, because they answer
different questions and fail in different ways. All three live next to the
integrity ledger, where the account that launches an application cannot write
them.

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

The ceiling is independent of signatures. It applies to a package nobody
signed and to one signed by an approved publisher alike, so approving a
publisher does not become a standing grant of whatever that publisher asks for
in a later release.

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

`approved_origins` holds exact origins, not patterns. A pattern that matched
an organisation namespace would extend approval to every repository anyone can
create inside it, which is a much larger set of people than those who can
sign.

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

Without an approval, the only party attesting to a package is the party that
built it. A counter-signature adds a second one.

## Requiring a signature

A host can refuse to enrol anything a publisher has not signed:

```bash
cpak system signatures
cpak system set-signatures required
cpak system set-signatures optional
```

`optional` is the default and behaves as cpak always has. Under `required` an
unsigned package is installed but never enrolled, which under a refusing
enforcement level means it does not start.

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
