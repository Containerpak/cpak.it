---
title: Install apps from Flathub
description: Find an application on Flathub, install it with cpak, and keep it updated without installing Flatpak.
tags: [flatpak, flathub, install]
section: start
order: 25
---

# Install apps from Flathub

cpak installs Flatpak applications without Flatpak. It reads the application, its runtime and their extensions from the remote's OSTree repository, checks every object against the remote's signing key, and stores them as cpak layers. The application then runs in the cpak sandbox like any other package. Flathub is configured out of the box, with its key built into cpak, so there is nothing to add before the first install. Flatpak support needs cpak 2.14.9 or newer; `cpak capabilities` lists `flatpak-install` when the build has it.

## Find an application

Search on [flathub.org](https://flathub.org). Every application page has an address of the form `https://flathub.org/apps/<id>`, and the last part is the application id cpak needs, such as `org.gnome.Calculator` or `org.mozilla.firefox`. The same id appears in the install command Flathub shows under the Install button.

## Install it

Pass the id to `cpak install --flatpak`:

```bash
cpak install --flatpak org.gnome.Calculator
```

Before anything is downloaded, cpak shows the application, the runtime it needs, and the permissions it asks for translated into a cpak policy. Requests with a cpak equivalent are granted the way cpak grants them. Requests that have none, or that would weaken the sandbox, are refused and listed with the reason: the raw session or system bus, the host root, `/tmp`, the sockets of other services under `xdg-run`, `devel`, and the whole of `/dev`. Answer the prompt to install, or pass `--yes` in scripts.

Flathub's Install button also links a `.flatpakref` file. cpak reads it from a path or an HTTPS address:

```bash
cpak install --flatpak https://dl.flathub.org/repo/appstream/org.gimp.GIMP.flatpakref
```

A branch other than the default is chosen with `--branch`:

```bash
cpak install --flatpak org.mozilla.firefox --branch stable
```

Some applications, such as Google Chrome or Discord, ship only a small recipe on Flathub and download the program itself from their publisher. cpak downloads that file during the installation, checks it against the checksum the Flathub build promises, and runs the application's own unpacking step inside the sandbox without network access.

## Run it

The application appears in the desktop menu like any other. From a terminal, cpak creates a short alias from the last part of the id when the name is free, and prints it at the end of the installation:

```bash
cpak run calculator
```

The application is installed under the origin `flatpak/<remote>/<id>`, for example `flatpak/flathub/org.gnome.calculator`. That origin works with every command that takes one.

## Keep it updated

Flatpak applications follow the same lifecycle as cpak packages:

```bash
cpak list
cpak update
cpak rollback flatpak/flathub/org.gnome.calculator
cpak remove flatpak/flathub/org.gnome.calculator
```

The runtime is installed beside the application and shared with every application on the same branch. It is removed together with the last application that uses it.

## Change permissions

A permission cpak refused at install time can still be granted, and a granted one taken away, with an override:

```bash
cpak override edit flatpak/flathub/org.gnome.calculator
```

## Other remotes

Flathub is the default remote. Another remote is added by installing from its `.flatpakref`: cpak shows the key fingerprint before trusting it, and later installs from that remote are chosen with `--flatpak-remote`:

```bash
cpak install --flatpak org.example.App --flatpak-remote example
```

## Desktop integration

The application reaches the desktop the way it would under Flatpak, through portals, but no portal service is involved. cpak serves the session bus of the sandbox itself and answers file choosers, links, notifications, settings, network status and proxy resolution through its broker. Helper processes started with `flatpak-spawn` run in the same sandbox, never on the host. The host NVIDIA driver is used through cpak's own NVIDIA support, and Mesa comes from the runtime.

To move applications you already installed with Flatpak, see [Replace Flatpak with cpak](/docs/replace-flatpak).
