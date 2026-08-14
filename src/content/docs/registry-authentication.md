---
title: Private OCI registries
description: Bind a registry credential to one package origin and repository without importing container-engine configuration.
tags: [registry, authentication, security]
section: operations
order: 25
---

# Private OCI registries

cpak pulls public OCI images anonymously. A package whose manifest points to a private repository needs an explicit credential binding.

## Store a credential

Basic authentication uses a username and a password:

```bash
cpak auth login github.com/example/private-app --username account
```

Token authentication omits the username:

```bash
cpak auth login github.com/example/private-app --token
```

The login command reads the package manifest, parses its image reference, and binds the credential to all three values below:

- package origin
- registry host
- OCI repository path

The credential cannot authenticate another package origin or another repository on the same registry. The Secret Service item also binds the username and every approved token host, so editing public metadata cannot retarget an existing secret.

## Desktop storage

Interactive login stores the secret through the desktop Secret Service D-Bus API. Public binding metadata is written to the cpak configuration directory with mode `0600`. Passwords and tokens are not written to that file.

cpak talks to Secret Service directly and keeps credential bindings separate from Docker, Podman, Buildah, and container credential-helper configuration.

List bindings or inspect one origin:

```bash
cpak auth list
cpak auth status github.com/example/private-app
```

Remove an origin and its stored secret:

```bash
cpak auth logout github.com/example/private-app
```

## Headless systems

Read the secret from a user-owned regular file with mode `0600`:

```bash
install -m 0600 /dev/null token.txt
cpak auth login github.com/example/private-app --token --secret-file token.txt
```

cpak stores the absolute file path in the binding and reads the secret from that file for each registry request. Binding metadata contains the path only. Keep the file at that path with the same owner and mode. `cpak auth logout` removes the binding and leaves the user-owned file untouched.

An automated runtime can inject `CPAK_REGISTRY_AUTH_FILE`. The JSON file must be owned by the current user and have mode `0600`:

```json
{
  "records": [
    {
      "origin": "github.com/example/private-app",
      "registry": "ghcr.io",
      "repository": "example/private-app",
      "access_token": "TOKEN"
    }
  ]
}
```

Basic authentication uses `username` and `password` instead of `access_token`. A record that mixes both forms is rejected.

## Token services

cpak accepts Basic and Bearer registry challenges. Credentials are sent to the registry host by default. A registry that uses a separate token host requires an explicit allowlist entry:

```bash
cpak auth login github.com/example/private-app \
  --username account \
  --token-host auth.example.com
```

Token endpoints must use HTTPS, except loopback registries used for local development. Redirects cannot carry credentials to another host. Tokens obtained through a registry challenge stay in memory until their short expiry.
