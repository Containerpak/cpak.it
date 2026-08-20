---
title: Riferimento manifest v2
description: Ogni campo di primo layer in cpak.json, con convalida rigorosa ed esempi trasferibili.
tags: [manifest, reference]
section: packages
order: 20
---
# Riferimento manifest v2

Manifest v2 è un contratto JSON rigoroso. Aggiungi l'URL dello schema per ricevere il completamento e la convalida dell'editor dalla definizione con versione nel repository cpak.

```json
{
  "$schema": "https://raw.githubusercontent.com/Containerpak/cpak/v2/schema/manifest-v2.json",
  "manifest_version": "2.0",
  "name": "Example",
  "description": "Example desktop application.",
  "version": "1.0.0",
  "image": "ghcr.io/example/example:main",
  "binaries": ["/usr/bin/example"],
  "desktop_entries": ["/usr/share/applications/example.desktop"],
  "dependencies": [],
  "addons": [],
  "idle_time": 0,
  "override": {
    "socketWayland": true,
    "socketX11": true,
    "deviceDri": true,
    "filesystem": [{ "path": "home", "access": "read-write" }],
    "network": true
  }
}
```

## Campi del pacchetto

| Campo | Obbligatorio | Significato |
| ------------------ | -------- | ---------------------------------------------------------------- |
| `$schema` | No | JSON URI dello schema utilizzato dagli editor.                                 |
| `manifest_version` | Sì | Deve essere `2.0`.                                                   |
| `name` | Sì | Nome dell'applicazione leggibile.                                 |
| `description` | Sì | Breve descrizione del pacchetto.                                       |
| `version` | No | Versione dell'applicazione mostrata da cpak.                               |
| `image` | Sì | Riferimento o digest image OCI.                                   |
| `binaries` | Sì | Uno o più percorsi eseguibili assoluti.                           |
| `desktop_entries` | No | Percorsi assoluti dei file `.desktop` nell'image.                 |
| `sessions` | No | Sessioni desktop o kiosk offerte a un display manager.          |
| `dependencies` | No | Origini del pacchetto cpak richieste.                                   |
| `addons` | No | Origini dei componenti aggiuntivi opzionali supportate da questo pacchetto.                |
| `addon_provider` | No | Funzionalità ed esportazioni runtime fornite se utilizzato come componente aggiuntivo.   |
| `idle_time` | Sì | Minuti prima che un container inattivo si fermi. Zero disabilita il timer. |
| `override` | Sì | permessi host e limiti di risorse predefiniti.                    |
| `runtime_sources` | No | Elementi HTTPS verificati installati in un layer gestito.         |

I campi nidificati e di layer superiore sconosciuti non riescono a convalidare.

## Dipendenze

Ogni dipendenza necessita di un'origine. Un ramo, rilascio o commit può selezionare il proprio riferimento di origine.

```json
"dependencies": [
  {
    "origin": "github.com/containerpak/umu",
    "branch": "main"
  }
]
```

Utilizza un solo selettore di origine per dipendenza. Il file di blocco registra la dipendenza risolta manifest, il relativo hash e il digest dell'image immutabile OCI.

## Componenti aggiuntivi

L'array `addons` elenca le origini dei pacchetti che possono unirsi a questa applicazione. I componenti aggiuntivi abilitati utilizzano i permessi host effettive del genitore.

```json
"addons": [
  "github.com/containerpak/sdk-go",
  "github.com/containerpak/sdk-node-lts"
]
```

Un componente aggiuntivo può dichiarare uno slot denominato provider e i percorsi che aggiunge al suo genitore:

```json
"addon_provider": {
  "id": "go",
  "slot": "sdk.go",
  "mode": "exclusive",
  "exports": {
    "path": ["/usr/local/go/bin"],
    "environment": ["GOROOT=/usr/local/go"]
  }
}
```

`exclusive` consente di avere un provider attivo in uno slot. `multiple` compone ogni
disponibile provider. Vedi [Dipendenze e componenti aggiuntivi](/docs/dependencies-addons) per
Selezione provider e ogni esportazione supportata.

## Origini runtime

Un'runtime source scarica un artefatto HTTPS esterno al momento dell'installazione e lo installa in un layer gestito.

```json
"runtime_sources": [
  {
    "name": "example.deb",
    "url": "https://downloads.example.org/example.deb",
    "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "size": 1048576,
    "installer": "dpkg"
  }
]
```

L'URL deve utilizzare HTTPS. cpak verifica la dimensione in byte dichiarata e SHA-256 prima di eseguire il programma di installazione. Una mancata corrispondenza interrompe l'installazione.

Impostare `installer` su `dpkg`, `deb-extract`, `rpm`, `tar` o `file`. `dpkg` controlla il pacchetto
dipendenze ed esegue gli script di manutenzione, mentre `deb-extract` decomprime solo il file
Archivio dati Debian. Il programma di installazione di tar accetta tar semplice e compresso con gzip
archivi. Un'origine file dichiara anche `destination` sotto `/opt`. Leggi
[Origini runtime](/docs/runtime-sources) per i requisiti del pacchetto, archivio
layout e controlli CI.

## permessi

L'oggetto `override` dichiara le impostazioni predefinite del pacchetto per socket, dispositivi, percorsi di filesystem, operazioni di selezione file, rete, condivisione di processi, spazi dei nomi utente nidificati, limiti di risorse e azioni di sistema broker. Vedi [permessi](/docs/permissions) per ogni campo e il suo effetto.

### Politica di selezione file

`filePicker` garantisce operazioni, non percorsi host. Ogni campo è disabilitato per impostazione predefinita:

```json
"filePicker": {
  "openFile": true,
  "openFolder": false,
  "saveFile": true,
  "persistent": false,
  "containingFolder": false
}
```

`openFile`, `openFolder` e `saveFile` abilitano le modalità di selezione della corrispondenza. `persistent` consente alla conferma di offrire una grant che sopravvive all'ambiente attuale. `containingFolder` consente a una richiesta di file di offrire la directory principale come contesto. L'utente approva comunque l'oggetto selezionato ed ogni grant più ampia o più lunga.

Utilizzare `filesystem` per percorsi che devono sempre esistere all'interno del pacchetto. Utilizzare `filePicker` quando l'accesso inizia con una selezione interattiva dell'utente. Consulta [Accesso al selettore file](/docs/file-access) per i guest path e la revoca.

## Sessioni di accesso

L'array opzionale `sessions` trasforma un file binario esportato in una scelta desktop o kiosk nella schermata di accesso del sistema. Ogni sessione ha il proprio set di permessi. La registrazione è esplicita e passa attraverso l'autorità di sistema cpak. Vedere [Sessioni desktop e kiosk](/docs/desktop-sessions).

## Convalida e migrazione

```bash
cpak validate cpak.json
cpak gen-schema --output manifest-v2.json
cpak migrate-manifest old-cpak.json --output cpak.json
```

La migrazione converte i campi v1 supportati nella relativa rappresentazione v2. Esamina il risultato ed esegui `cpak validate`; i flag legacy del filesystem ampio dovrebbero essere sostituiti da voci `filesystem` esplicite.