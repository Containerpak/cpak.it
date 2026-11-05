---
title: Replace Flatpak with cpak
description: Install cpak, move the applications you installed with Flatpak together with their data, and remove Flatpak when nothing depends on it.
tags: [flatpak, migration, install]
section: start
order: 27
---

# Replace Flatpak with cpak

cpak installs Flatpak applications on its own, so a system can run them without Flatpak. Moving over takes three steps: install cpak, migrate the applications, then remove Flatpak once the migrated applications work. Until the last step, both installations sit side by side and nothing is lost.

## Install cpak

Follow [Install cpak](/docs/install), then check the host and the build:

```bash
cpak doctor
cpak capabilities
```

Migration needs cpak 2.14.9 or newer, where `cpak capabilities` lists `flatpak-install`.

## Migrate the applications

```bash
cpak migrate-flatpak
```

cpak reads the user installation in `~/.local/share/flatpak` and the system installation in `/var/lib/flatpak` directly, so the `flatpak` command does not have to be installed for this step. For each application it learns which id, branch and remote to ask for, then installs the application again from that remote. Nothing is imported from the host deployment: the build is fetched and verified against the key cpak trusts. A remote cpak already knows by its address, Flathub above all, keeps cpak's key; a remote cpak does not know is taken with the key the Flatpak installation trusts it through, and the plan says so.

The plan lists every application with the permissions it gets under cpak, then asks to continue. To move a single application:

```bash
cpak migrate-flatpak org.gnome.Calculator
```

## What happens to the data

Each application kept its files in `~/.var/app/<id>`. cpak copies them into the private home it gives the application: `config` becomes `.config`, `data` becomes `.local/share`, and anything else keeps its name. The cache is left behind, since the application rebuilds it and it is often the largest part.

The copy is made once. A file the application already wrote under cpak is newer than the Flatpak copy, so it is kept. Running the migration again recognises the applications an earlier run moved, without asking their remote, and does not copy their data a second time, so it brings back nothing you deleted under cpak in the meantime.

An application granted the whole home under Flatpak reads its data from there and has no copy to make. Its data stays where it is.

## Check the result

The Flatpak installations are left as they are, so the desktop menu shows each migrated application twice until Flatpak is removed. Start the cpak copy from a terminal to be sure which one runs:

```bash
cpak list
cpak run calculator
```

`cpak migrate-flatpak` exits with 0 only when every application moved. It exits with 11 when a remote could not be reached and 12 when an answer failed verification, so a script can tell when to try again. An application that fails is reported and left on Flatpak.

## Remove the Flatpak copies

When the migrated applications work, the Flatpak copies can go:

```bash
cpak migrate-flatpak --delete-flatpaks
```

This uninstalls every migrated application from Flatpak together with what it kept in `~/.var/app`, then removes the Flatpak runtimes nothing uses any more. Because the data goes with it, cpak asks you to type a consent sentence in full, and `--yes` does not answer it. An application that failed to migrate, or that was granted the whole home, is never deleted. This step uses the `flatpak` command, so run it before removing Flatpak from the system.

## Remove Flatpak

With every application on cpak, remove the Flatpak package with the system package manager, for example:

```bash
sudo dnf remove flatpak
sudo apt remove flatpak
sudo pacman -R flatpak
```

Applications from Flathub are installed with cpak from then on. See [Install apps from Flathub](/docs/flathub).
