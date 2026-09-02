---
title: Persistent application services
description: Run a declared application command in the background, restore it after login or boot, and inspect its health.
tags: [services, automation, observability, boot]
section: operations
order: 20
---

# Persistent application services

A cpak service is a named application command managed outside the interactive terminal. cpak records the desired state, starts the package through its normal sandbox, applies a restart policy, and restores enabled services after login or boot.

The service manager does not require systemd or D-Bus. cpak installs the best available user-level boot adapter in this order:

1. a systemd user unit with lingering when the host supports it;
2. a user crontab entry with `@reboot`;
3. a systemd user unit that starts after login;
4. an XDG autostart entry.

Run `cpak service setup` to install or inspect the selected adapter. The command reports when the host can restore services only after an interactive login.

## Declare an application command

Package authors can give a command a stable name in `cpak.json`:

```json
"binaries": ["/usr/bin/example"],
"services": {
  "server": {
    "binary": "/usr/bin/example",
    "arguments": ["serve", "--port", "3000"]
  }
}
```

The service binary must also appear in `binaries`. Arguments are passed as separate values without shell parsing.

Run the declared command directly when it does not need persistence:

```bash
cpak run --service server github.com/example/app
```

## Enable a service

`cpak service enable` records the service and starts it immediately:

```bash
cpak service enable app-prod github.com/example/app \
  --service server \
  --restart on-failure \
  --health "/usr/bin/example health"
```

The first argument is the local service name. The second is the package origin. Use `--service` for a command declared by the manifest, or provide an exported binary and its arguments after the origin:

```bash
cpak service enable app-prod github.com/example/app \
  /usr/bin/example serve --port 3000
```

Restart policies are `never`, `on-failure`, and `always`. The default is `on-failure`. Health checks accept delay, interval, retries, and timeout settings through the matching `--health-*` flags.

Dependencies refer to other local service names and can be repeated:

```bash
cpak service enable web github.com/example/web \
  --service server \
  --depends-on database \
  --depends-on cache
```

## Environment and secrets

Pass repeatable environment values and files while enabling a service:

```bash
cpak service enable app-prod github.com/example/app \
  --service server \
  --env APP_ENV=production \
  --env-file /etc/example/app.env \
  --secret API_TOKEN=/etc/example/api-token
```

Environment files contain `NAME=value` lines. Blank lines and lines beginning with `#` are ignored. A direct `--env` value overrides the same name from an environment file. Files must be absolute regular files no larger than 1 MiB, and `CPAK_` names are reserved.

A secret source must be an absolute regular file owned by the current user, must not be a symbolic link, and must deny group and other permissions. cpak mounts it read-only at `/run/secrets/NAME`. Secret contents are never copied into service records or printed by service commands.

The same `--env`, `--env-file`, and `--secret` flags are available on `cpak run`.

## Control the service

```bash
cpak service list
cpak service status app-prod
cpak service logs app-prod
cpak service logs --lines 200 app-prod
cpak service restart app-prod
cpak service stop app-prod
cpak service start app-prod
cpak service disable app-prod
cpak service remove app-prod
```

`disable` keeps the service definition and clears its desired running state. `remove` deletes the service definition. Neither command removes the installed package or its application data.

## Inspect all runtime state

The runtime observability commands combine the service state, container state, process state, health result, start time, and listening ports:

```bash
cpak ps
cpak ps --json
cpak status github.com/example/app --instance app-prod
cpak inspect github.com/example/app --instance app-prod
cpak health github.com/example/app --instance app-prod
```

`cpak status` and `cpak health` accept `--json`. `cpak inspect` always returns JSON. A failing health result makes `cpak health` exit with a failing status, so it can be used directly by a supervisor or deployment script.

`cpak ps` reports listeners as `host:PORT`. It observes the current state and does not change package networking. A service still needs the network permission declared by its package.
