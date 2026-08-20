Integrity is a chain of smaller checks. The registry proves which bytes an OCI descriptor names, the package transaction proves which complete state became active and verified launch proves the local store still describes the state recorded at installation.

## Resolve immutable inputs

The OCI client selects the current architecture from an image index, checks every descriptor and stores layers by SHA-256 digest. A package lock records the resolved manifest and image digests for the complete dependency graph. Runtime sources add their own exact size and digest.

## Switch only after staging succeeds

An install or update stages the manifest, OCI layers, runtime sources, dependencies, desktop exports and database record. The active package record changes only after every required part is ready. An interrupted transaction is recovered without replacing the previous working version with a partial one.

Rollback restores the previous manifest-derived runtime view. Writable application data remains separate, so an application that migrated its own files may still need application-specific recovery.

## Record identity and policy separately

Verified launch derives a package root for identity and a policy root for effective access, then combines them into the launch root kept in the root-owned ledger. Permissions can therefore narrow without pretending the package bytes changed, and an update can change the package without silently changing its access.

## Unknown and contradictory are not the same

Enforcement controls an unenrolled or otherwise unknown state. At `off` it may start, `warn` reports it and `refuse` stops it. A tampered store contradicts a state cpak already knows and is refused at every level.

`cpak audit` checks installed records and layer bindings. `cpak system explain` puts the recorded and derived launch state beside each other. A binding backfill records the current disk state; it is a migration tool, not proof that the old bytes were authentic.

[Verified launch](/docs/verified-launch) defines each result. [Updates and rollback](/docs/updates) covers the transaction path.
