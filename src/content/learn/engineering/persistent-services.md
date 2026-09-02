A persistent application service combines a normal cpak launch with a desired state. The service manager starts it through the same package resolution, policy, storage, and sandbox path as `cpak run`. It records whether the service should be running and applies restart and health rules outside the application container.

## Give the command a name

Define a service when the package has one application mode that operators should not have to reconstruct:

```json
{
  "binaries": ["/usr/bin/example"],
  "services": {
    "server": {
      "binary": "/usr/bin/example",
      "arguments": ["serve", "--port", "3000"]
    }
  }
}
```

The binary remains an exported package binary. The service only binds a name to that binary and its argument vector. There is no shell command to parse.

Run the command once with `cpak run --service server github.com/example/app`. Make it persistent with a local service definition:

```bash
cpak service enable app-prod github.com/example/app \
  --service server \
  --restart on-failure
```

The manifest owns the application command. The local service definition owns operational choices such as restart policy, dependencies, health checks, and deployment-specific configuration.

## Add configuration without changing the image

Environment and secret inputs are explicit on both `cpak run` and `cpak service enable`:

```bash
cpak service enable app-prod github.com/example/app \
  --service server \
  --env APP_ENV=production \
  --env-file /etc/example/app.env \
  --secret API_TOKEN=/etc/example/api-token
```

Direct `--env` entries replace matching names read from environment files. cpak validates every file before starting the package. A secret source must belong to the current user and deny access to group and other users. Its bytes are mounted read-only at `/run/secrets/API_TOKEN`; they are not stored in the service definition.

## Restore desired state

Enabling a service installs the best host adapter available. cpak prefers a systemd user service that can start before login, then cron `@reboot`, then login-only systemd, then XDG autostart. The service manager itself does not depend on systemd or D-Bus.

Every adapter starts the same `cpak service restore` entry point. The application service definition and restart behavior remain the same when the adapter changes. `cpak service setup` reports which adapter is active and whether it can start before login.

## Observe one state model

Use `cpak service status app-prod` for manager state and restart counts. Use the runtime commands when deployment tooling needs package, container, process, health, start time, and listeners together:

```bash
cpak ps
cpak status github.com/example/app --instance app-prod --json
cpak inspect github.com/example/app --instance app-prod
cpak health github.com/example/app --instance app-prod
```

`cpak health` exits with a failure when the process is not running or its health is `starting`, `unknown`, or `unhealthy`. This makes the command suitable for a deployment gate without parsing the human table.

The [persistent services reference](/docs/services) lists every lifecycle and health option.
