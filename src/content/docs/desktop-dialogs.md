---
title: Desktop dialog adapters
description: Select, package, and replace the native dialog backend used by cpak.
tags: [desktop, dialogs, distributions]
section: runtime
order: 35
---

# Desktop dialog adapters

cpak uses desktop dialog adapters for confirmations and progress windows that belong to the runtime, including file grant choices, package installation, updates, and storage preparation. The application file chooser remains the native chooser provided by the host desktop.

The official cpak binary includes Adwaita, GTK, KDE, Qt, and the built-in interface. Only the selected helper is extracted and started. A missing helper, an unsupported protocol response, or a process failure returns control to the built-in interface.

## Automatic selection

The `auto` backend reads `XDG_CURRENT_DESKTOP` and applies the following order:

| Desktop                   | Preferred backend | Fallback |
| ------------------------- | ----------------- | -------- |
| GNOME                     | Adwaita           | built-in |
| KDE Plasma                | KDE, then Qt      | built-in |
| MATE, Xfce, Cinnamon      | GTK               | built-in |
| LXQt                      | Qt                | built-in |
| Other or no desktop match | built-in          | built-in |

KDE and Qt use Qt Widgets. The KDE helper identifies itself separately so automatic selection and package policy can distinguish a Plasma-oriented build without requiring KDE Frameworks.

An explicit choice is resolved in this order:

1. The backend passed by the cpak caller.
2. `CPAK_UI_ADAPTER` in the process environment.
3. `desktop.dialog_backend` in `cpak.json` configuration.
4. The default compiled into the binary.

Supported values are `auto`, `builtin`, `adwaita`, `gtk`, `kde`, and `qt`.

## Runtime configuration

Set a user preference in `$XDG_CONFIG_HOME/cpak/cpak.json`, normally `~/.config/cpak/cpak.json`:

```json
{
  "desktop": {
    "dialog_backend": "adwaita"
  }
}
```

cpak checks the user file before `/etc/cpak/cpak.json` and `/usr/share/cpak/cpak.json`. `CPAK_OPTS_FILE` can point to one complete configuration file, while `CPAK_UI_ADAPTER` can replace only the backend for one process:

```sh
CPAK_UI_ADAPTER=qt cpak run github.com/example/app
```

The built-in interface is always available. A headless process does not manufacture an interactive desktop and operations that require user input fail unless they have a non-interactive policy path.

## Distribution builds

The default Make target compiles every native helper and embeds each payload in the matching Go build variant:

```sh
make all
```

`UI_ADAPTERS` controls which helpers enter the binary. `DIALOG_BACKEND` sets the compiled default:

```sh
make all UI_ADAPTERS=adwaita DIALOG_BACKEND=adwaita
make all UI_ADAPTERS=kde,qt DIALOG_BACKEND=auto
make all UI_ADAPTERS=builtin DIALOG_BACKEND=builtin
```

`all` and `builtin` are complete selections and cannot be combined with another value. A comma-separated selection embeds only the named helpers.

Native compilation needs a C and C++ toolchain, `pkg-config`, GTK 3 development files, libadwaita development files, and Qt 6 Widgets development files. A build that selects one adapter only needs that adapter's toolkit.

The equivalent Go build tags are:

| Adapter  | Build tag         |
| -------- | ----------------- |
| built-in | `cpak_ui_builtin` |
| Adwaita  | `cpak_ui_adwaita` |
| GTK      | `cpak_ui_gtk`     |
| KDE      | `cpak_ui_kde`     |
| Qt       | `cpak_ui_qt`      |

The Makefile first compiles the native executables, then runs `cmd/cpak-ui-bundle` to generate the Go payload source used for that build. Direct `go build` invocations can use the tags without embedding a payload when the matching helpers are installed separately.

## External helpers

A package-managed build can install helpers below one of these directories:

```text
$HOME/.local/libexec/cpak/ui
/usr/libexec/cpak/ui
/usr/local/libexec/cpak/ui
```

`CPAK_UI_ADAPTER_DIR` points a development build to another directory. An official build with an embedded helper materializes it first below `$XDG_CACHE_HOME/cpak/ui-adapters/<digest>` and verifies its executable protocol before use.

Each helper implements protocol version 1. `probe` prints its identity:

```text
cpak-ui 1 adwaita
```

The `prompt` operation receives labels, application identity, resource scope, default choices, and whether the primary action is recommended. It returns one decision and the selected scope values on standard output. The `progress` operation receives tab-separated progress records on standard input until the operation ends. cpak rejects malformed responses and uses the built-in backend.

## Application packaging

Applications do not depend on a specific dialog adapter. The package manifest declares the operation, such as `filePicker`, while the user or distribution selects how cpak presents its own confirmation. Do not add toolkit libraries to an application image solely for cpak dialogs.

File chooser behavior, grant lifetime, and revocation are documented in [File chooser access](/docs/file-access). Package permissions are listed in [Permissions](/docs/permissions).

## Verification

Build every official helper and check its protocol before publishing a cpak binary:

```sh
make ui-adapters UI_ADAPTERS=all
.build/ui-adapters/cpak-ui-adwaita probe
.build/ui-adapters/cpak-ui-gtk probe
.build/ui-adapters/cpak-ui-kde probe
.build/ui-adapters/cpak-ui-qt probe
```

Test the selected native backend on its desktop and test the built-in fallback with `CPAK_UI_ADAPTER=builtin`. A distribution that changes the embedded set should also build the relevant Go tag combinations and confirm that an excluded helper cannot be selected.
