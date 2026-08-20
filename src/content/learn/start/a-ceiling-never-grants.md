The manifest contains the permissions selected by the package author. They are the defaults shown before installation, but the owner of that installation may change them later.

A saved user override replaces the manifest permissions. It may remove access, restore it or add access the manifest did not request. This lets you fix an application that needs another directory or device without editing the publisher's files.

On a managed machine, the administrator has the final word. A system ceiling is stored outside the user's control and limits both the manifest and every local override.

`effective permissions = (user override if present, otherwise manifest) limited by the administrator ceiling`

## A ceiling limits but never grants

A ceiling only controls the keys written in its policy file. If it contains `"network": false`, no application or user override can restore network access on that host. A key omitted from the ceiling remains under the control of the installation owner.

Writing `"deviceDri": true` does not give every application the graphics device. It allows an application to keep that permission when its manifest or local override enables it. An application that leaves `deviceDri` disabled still receives no graphics device.

The same rule applies to filesystem access. A ceiling may reduce a requested directory to read-only access, restrict it to a smaller path or remove it. The user may still make narrower choices.

## The user still controls personal installations

On an unmanaged machine there is no system ceiling. The local override is the effective permission set, so the user may add or remove any permission:

```console
cpak override github.com/example/application --key deviceDri --value true
```

The override belongs to one installed version of one package and is stored under `~/.config/cpak/overrides`. It does not modify the publisher's manifest or another user's installation.

Nested packages have one more boundary. A child receives only the intersection of its own effective permissions and those of its parent, so it cannot use nesting to escape the application that launched it.

Use the playground beside this lesson to compare a manifest, a local override and a system ceiling. [Managed deployment](/docs/managed-deployment) covers the administrator commands and policy files.
