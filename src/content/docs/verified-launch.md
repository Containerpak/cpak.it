---
title: Verified launch
description: cpak records what an application is when it is installed and refuses to start it when the store no longer holds that.
tags: [integrity, security, sandbox]
section: runtime
order: 45
---

# Verified launch

An installed application is a set of layers, a configuration and a permission
set. All of it lives in a store the user owns, which means anything on the
machine running as that user can change it, and until now nothing would notice.
Verified launch closes that: cpak records what an application is when it is
installed, and refuses to start it when what the store holds no longer matches.

## What a launch is checked against

Three values are derived, and they are kept apart because they change for
different reasons.

The **package root** covers what the application is: its origin, version, image
digest, configuration, the ordered list of its layers with the store state each
one produced, its dependencies, addons, binaries, desktop entries and sessions.
It changes when the application is installed or updated.

The **policy root** covers what the application is allowed to do: the effective
permission set after the manifest and any override the user applied. It changes
when permissions change, which is a separate event with a separate answer.

The **launch root** combines the two. It is the value recorded in the ledger and
the one a launch is compared against.

Keeping identity and policy apart is what lets you narrow an application's
permissions without re-installing it, and what lets an update change the
application without silently changing what it may do.

## Where the expectation is kept

The ledger lives under `/var/lib/cpak/integrity/v1`, owned by root, one record
per user and origin. The account that launches an application cannot write it.
That is the whole point: every other file a launch depends on belongs to the
user, so a comparison between two files the user owns proves nothing.

Writing a record goes through the system authority, the same privileged service
that registers login sessions, over the system bus when there is one, over its
socket when there is not, and directly when the caller is already root.

## What happens when the store disagrees

A launch reaches one of these conclusions.

**Recognised**: what the launch derives is what the ledger holds. It starts.

**Tampered**: the store contradicts itself. A layer binding names a state the
repository no longer serves, or a prepared checkout is not the shape its bound
state describes. This is refused at every enforcement level, including off,
because it is not an unknown, it is a disagreement inside the store.

**Unrecognised**: the ledger holds a root and the launch derives a different
one. Refused when the application is enrolled.

**Unbound**: a layer carries no binding, so the launch cannot be described at
all. The message names the command that fixes it.

**Unenrolled**: the ledger holds nothing for this application. What happens next
is the one thing the enforcement level decides.

## Enforcement levels

Enforcement governs the unknown. It never governs the known bad: a tampered
store is refused at every level.

`off` is the default and behaves exactly as cpak did before. An unenrolled
application starts.

`warn` refuses nothing and reports every disagreement on standard error, so a
machine can be watched before anything is turned on.

`refuse` turns unenrolled and unverifiable into refusals.

The level is held next to the ledger, root owned, and is never read from the
environment or from anything under a home directory, because it decides whether
a refusal happens.

```bash
cpak system enforcement
cpak system set-enforcement warn
cpak system set-enforcement refuse
```

Changing it asks for an administrator password.

## Reading the state

```bash
cpak audit
cpak system explain github.com/example/app
```

`cpak audit` reports, per application, how many of its layers are bound, whether
its checkouts are measured and whether it is enrolled. `cpak system explain`
puts what the ledger holds beside what a launch derives, so a disagreement can
be read instead of guessed.

An installation made before verified launch existed has no bindings. It is not
refused at the default level, and it can be brought up to date without
reinstalling:

```bash
cpak audit --backfill-bindings
```

A backfill records what is on disk right now. It is not verification, and the
command says so.

## What enrolment proves, and what it does not

Enrolment records what was installed, at the moment it was installed. That is
trust on first install. It is a true statement about a machine whose owner is
trusted, and it is the right guarantee for a desktop: an application, or
anything else running as you, cannot alter another application, its permissions,
or the launcher that would have checked, without the next launch refusing.

Enrolment on its own is not authenticity. It does not prove the package came
from its author: for that a publisher has to sign what they publish, and cpak
has to check the signature before it records anything. That is
[publisher signing](/docs/publishing-signatures), and a host can require it.

Two more limits, stated because a guarantee nobody can see the edges of is
worse than a smaller one:

The comparison at launch is metadata. Paths, kinds, sizes, permission bits and
symlink targets are covered. File contents are not, because reading every byte
of a large application costs seconds and a launch cannot pay it. Content is
checked on demand rather than on the launch path.

Someone who owns the store and holds an active local session can install a
modified application and have it enrolled as it stands. That is the same
statement as trust on first install, seen from the other side.

## For a package author

There is nothing to add to a manifest and nothing to sign. Verified launch is
derived on the machine that installs the application, from the image, the
manifest and the permission set you already publish. A package built before this
existed is enrolled the same way as one built after it.

Signing is a different statement and it is optional. It proves the package came
from the CI of your repository, which enrolment on its own does not claim. There
is no key to manage, because it is keyless through the identity of your CI. See
[publisher signing](/docs/publishing-signatures) for the workflow, and note that
a package with no signature installs and runs exactly as it does today.

One thing does affect a publisher. A layer delivered through a partial pull is
rebuilt from ranges and the blob its digest names is never read, so nothing can
bind that layer to the state it produced. An application whose layers arrive
that way is installed and left unenrolled, and at `refuse` it does not start
until the user records what is on disk with `cpak audit --backfill-bindings`. If
your images carry the chunked annotations and you want your users enrolled on
the first install, publish them without.

## Requiring a signature

A host can decide that an application is enrolled only when a publisher signed
what it installs, and that the identity that signed it may speak for the
package's origin:

```bash
cpak system signatures
cpak system set-signatures required
```

The default is optional, which behaves as described above: a signed package
records who signed it, an unsigned one is enrolled all the same and the record
says it was unsigned. Under `required` an application whose state is not signed
by an identity that may speak for its origin is not enrolled at all, and at
`refuse` it therefore does not start.

Setting it asks for an administrator password, and the level is held next to the
ledger where the launching account cannot rewrite it.

One limit worth knowing before turning it on: an installation resolved through a
lock file cannot present a verifiable signature today, because the lock rewrites
the image reference in the manifest before the manifest is hashed, so no
signature covers the state that results. Those applications stay unenrolled
under `required`.

## For an administered machine

Where the person at the keyboard is not the person who controls root, the
guarantee is stronger, because enrolment and enforcement are decided by an
account the user does not have. Set the level to `refuse` and an application the
ledger does not recognise does not start, whatever the user does to their own
store.
