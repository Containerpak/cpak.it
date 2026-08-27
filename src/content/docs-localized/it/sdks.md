---
title: SDK e strumenti di sviluppo
description: Pacchetto toolchain del linguaggio come componenti aggiuntivi dell'editor opzionali.
tags: [sdk, addons, development]
section: packages
order: 60
---

# SDK e strumenti di sviluppo

cpak modella gli SDK come pacchetti aggiuntivi. Un editor dichiara le origini dell'SDK che supporta, quindi ogni utente abilita solo le toolchain necessarie a quell'editor.

## Abilita un SDK ufficiale

Installa l'editor e i pacchetti SDK, quindi abilita il componente aggiuntivo:

```bash
cpak install github.com/containerpak/vscode
cpak install github.com/containerpak/sdk-go
cpak addon enable github.com/containerpak/vscode github.com/containerpak/sdk-go
```

Gli attuali pacchetti SDK ufficiali includono Go e Node LTS. Esportano i normali percorsi di comando, inclusi i collegamenti di compatibilità utilizzati dagli strumenti che prevedono `/usr/bin` o `/usr/local/bin`.

```bash
cpak install github.com/containerpak/sdk-node-lts
cpak addon enable github.com/containerpak/vscode github.com/containerpak/sdk-node-lts
```

Esegui VS Code tramite cpak dopo aver modificato la selezione del componente aggiuntivo. Il terminale integrato e le estensioni vedono i file binari dell'SDK abilitati nello stesso ambiente del pacchetto.

## Crea un pacchetto SDK

Un SDK è un pacchetto manifest v3. La sua immagine contiene la toolchain mentre lo stato dell'editor rimane con l'applicazione madre. Dichiara ogni comando che altri strumenti possono chiamare:

```json
{
  "$schema": "https://raw.githubusercontent.com/Containerpak/cpak/v2/schema/manifest-v3.json",
  "manifest_version": "3.0",
  "name": "Example SDK",
  "description": "Example language tools for cpak development environments.",
  "version": "1.0.0",
  "image": "ghcr.io/example/sdk-example@sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "binaries": ["/usr/local/bin/example", "/usr/local/bin/examplefmt"],
  "desktop_entries": [],
  "dependencies": [],
  "addons": [],
  "addon_provider": {
    "id": "example",
    "slot": "sdk.example",
    "mode": "exclusive",
    "exports": {
      "path": ["/usr/local/bin"]
    }
  },
  "idle_time": 0,
  "override": {
    "filesystem": [{ "path": "home", "access": "read-write" }],
    "network": true
  }
}
```

Lo slot del provider consente a un editor di rilevare un SDK installato senza hardcoding
il layout del suo filesystem. Utilizzare `exclusive` per versioni alternative di uno
toolchain e `multiple` quando i fornitori devono coesistere. Esportazione
percorsi binari non standard, libreria, inclusione, pkg-config e CMake invece di
copiando i collegamenti di compatibilità nel genitore.

L'insieme di permessi dell'elemento principale rimane autorevole dopo il montaggio dell'SDK. L'SDK manifest ne descrive il comportamento autonomo e la superficie di convalida.

## Testare un SDK

Verifica il pacchetto da solo:

```bash
cpak test cpak.json --binary /usr/local/bin/example -- --version
```

Quindi testalo come componente aggiuntivo abilitato in ciascun editor supportato. Apri una shell di login e una shell non di login, perché gli editor e le attività di compilazione non inizializzano sempre lo stesso ambiente.

Per un SDK del linguaggio, compila ed esegui un progetto minimo. Copri importazioni, compilatori, sottoprocessi e percorsi di output oltre al comando versione.

## Aggiornamenti della versione

Aggiorna insieme l'image, la versione manifest, la documentazione e i controlli CI. Pubblica ogni architettura pubblicizzata. Mantenere un tag o un digest immutabile disponibile abbastanza a lungo da consentire il blocco dei file e il rollback dei record per risolvere il contenuto testato.
