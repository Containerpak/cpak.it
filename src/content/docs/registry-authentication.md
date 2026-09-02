---
title: Private GitHub repositories and OCI registries
description: Bind source and image credentials to one package origin without importing container-engine configuration.
tags: [registry, authentication, security]
section: operations
order: 25
---

# Private GitHub repositories and OCI registries

Package source and OCI image access are separate. A private GitHub repository needs an authenticated source request for `cpak.json`. A private image needs registry authentication. cpak binds both forms to one exact package origin.

## Private GitHub repositories

Use the current GitHub CLI session when `cpak.json` belongs to a private repository:

```bash
cpak auth login github.com/example/private-app --github
```

cpak reads the token held by `gh auth`. If no GitHub session exists and the command is interactive, it starts `gh auth login` in the browser with repository and package-read scopes. The saved source credential is accepted only for the exact `github.com/owner/repository` origin.

When that private manifest points to GHCR, the same GitHub credential is also bound to the exact OCI repository in the image reference. An image hosted by another registry still needs a separate registry login.

`--github` cannot be combined with `--username`, `--token`, or `--token-host`.

## Private OCI registries

### Store a registry credential

Basic authentication uses a username and a password:

```bash
cpak auth login github.com/example/private-app --username account
```

Token authentication omits the username:

```bash
cpak auth login github.com/example/private-app --token
```

For GHCR, pass the GitHub username with `--username` and enter a personal access token as the password. The `--token` flag is for a registry-issued bearer token and cannot be combined with a username.

The login command reads the package manifest, parses its image reference, and binds the credential to all three values below:

- package origin
- registry host
- OCI repository path

The credential cannot authenticate another package origin or another repository on the same registry. The Secret Service item also binds the username and every approved token host, so editing public metadata cannot retarget an existing secret.

## Credential storage

Interactive login uses Secret Service when the desktop provides it. On a host without D-Bus or a Secret Service provider, cpak stores the credential in its private configuration directory. The directory uses mode `0700` and each managed secret uses mode `0600`. The public binding records the managed path, not the password or token.

This fallback needs no keyring service. cpak keeps its bindings separate from Docker, Podman, Buildah, and container credential-helper configuration.

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

The same file can supply a GitHub token for private source access:

```bash
cpak auth login github.com/example/private-app --github --secret-file token.txt
```

cpak stores the absolute file path in the binding and reads the secret from that file for each registry request. Binding metadata contains the path only. Keep the file at that path with the same owner and mode. `cpak auth logout` removes the binding and leaves the user-owned file untouched.

An automated runtime can inject `CPAK_REGISTRY_AUTH_FILE`. The JSON file must be owned by the current user and have mode `0600`:

```json
{
  "records": [
    {
      "origin": "github.com/example/private-app",
      "source_host": "github.com",
      "registry": "ghcr.io",
      "repository": "example/private-app",
      "username": "account",
      "password": "TOKEN"
    }
  ]
}
```

Omit `registry`, `repository`, and `username` when the token is only for the private GitHub source. Registry bearer authentication uses `access_token` instead of `username` and `password`. A record that mixes both forms is rejected.

## Token services

cpak accepts Basic and Bearer registry challenges. Credentials are sent to the registry host by default. A registry that uses a separate token host requires an explicit allowlist entry:

```bash
cpak auth login github.com/example/private-app \
  --username account \
  --token-host auth.example.com
```

Token endpoints must use HTTPS, except loopback registries used for local development. Redirects cannot carry credentials to another host. Tokens obtained through a registry challenge stay in memory until their short expiry.
