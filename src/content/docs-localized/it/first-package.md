---
title: Il tuo primo pacco
description: Crea un pacchetto con manifest v3, costruisci la sua image e testalo in uno Store isolato.
tags: [packaging, tutorial]
section: packages
order: 10
---

# Il tuo primo pacco

Un repository di pacchetti necessita di un'image OCI e `cpak.json`. Inizia con un'applicazione da riga di comando in modo che ogni parte del pacchetto possa essere controllata prima di aggiungere l'integrazione desktop.

## Crea il repository

```bash
mkdir hello-cpak
cd hello-cpak
git init
```

Crea un `Containerfile` che copia l'applicazione in una piccola image runtime. Ogni percorso binario dichiarato in manifest deve esistere nell'image finale.

```dockerfile
FROM debian:13-slim

RUN printf '#!/bin/sh\nprintf "Hello from cpak\\n"\n' > /usr/bin/hello-cpak \
    && chmod 0755 /usr/bin/hello-cpak

ENTRYPOINT ["/usr/bin/hello-cpak"]
```

Crea e pubblica l'image con qualsiasi flusso di lavoro del registro OCI.

## Genera manifest

```bash
cpak init \
  --name "Hello cpak" \
  --description "Small package used to verify a cpak setup." \
  -v 1.0.0 \
  --image ghcr.io/your-name/hello-cpak@sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef \
  --binary /usr/bin/hello-cpak
```

Sostituisci il digest di esempio con quello restituito dopo la pubblicazione dell'image. Il manifest generato usa la versione `3.0`, include l'URL dello schema corrente e lascia `override` vuoto perché il comando non richiede risorse host.

## Convalidare prima dell'esecuzione

```bash
cpak validate cpak.json
cpak lock cpak.json
cpak test cpak.json --binary /usr/bin/hello-cpak
```

`cpak validate` controlla il contratto manifest. `cpak lock` risolve il pacchetto root e le dipendenze in digest di image immutabili. `cpak test` utilizza un Store cpak temporaneo, verifica i file binari dichiarati e le voci del desktop, quindi esegue il file binario selezionato quando richiesto.

Il flusso temporaneo utilizza un archivio isolato e ignora le esportazioni desktop.

## Aggiungi un'applicazione desktop

Copia il file e l'icona `.desktop` dell'applicazione nei percorsi standard nell'image finale, quindi dichiara il file desktop:

```json
"desktop_entries": [
  "/usr/share/applications/com.example.Hello.desktop"
]
```

Il comando `Exec` nella voce del desktop deve puntare a un binario disponibile nel pacchetto. cpak esporta una voce host che avvia l'applicazione tramite l'origine installata e i permessi effettive.

## Testare il flusso dello sviluppatore

`cpak dev` esegue l'installazione del pacchetto isolato e avvia il binario selezionato:

```bash
cpak dev cpak.json --binary /usr/bin/hello-cpak
```

Utilizzare `--origin` quando le dipendenze relative richiedono la futura origine del pacchetto. Utilizzare `--lock` per selezionare esplicitamente un file di blocco.

## Pubblica il repository

Invia prima l'image, quindi invia il repository del pacchetto. Chiunque può installare il pacchetto in base alla sua origine dopo che `cpak.json` è raggiungibile:

```bash
cpak install github.com/your-name/hello-cpak
```

L'invio del catalogo è facoltativo. Segui [Pubblica nello Store](/docs/publishing) quando il pacchetto sarà pronto per essere scoperto su cpak.it.
