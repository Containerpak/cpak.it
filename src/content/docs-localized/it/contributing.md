---
title: Contribuire a cpak
description: Crea il ramo v2, esegui la sua suite di verifica e invia modifiche mirate al repository corretto.
tags: [contributing, development, go]
section: project
order: 10
---

# Contribuire a cpak

Il progetto cpak è suddiviso in runtime, librerie riutilizzabili, image dei pacchetti, Store e questo sito Web. Inizia nel repository che possiede il comportamento che desideri modificare.

## Costruisci il runtime

Il repository principale utilizza il ramo `v2` e Go 1.25 o successivo come dichiarato da `go.mod`.

```bash
git clone https://github.com/Containerpak/cpak.git
cd cpak
git switch v2
make all
./cpak --help
```

`make all` crea un binario `cpak` statico con `CGO_ENABLED=0`. Mantieni i file binari generati fuori dai commit.

## Esegui i controlli principali

```bash
go test -race ./...
go vet ./...
go run . gen-schema --output /tmp/manifest-v3.json
diff -u schema/manifest-v3.json /tmp/manifest-v3.json
```

Lo schema generato deve corrispondere allo schema sottoposto a commit. Aggiungi test accanto al comportamento modificato. Le modifiche al runtime devono coprire comandi riusciti, percorsi di errore e ripristino dell'archivio.

## Testare il comportamento dell'host

```bash
./cpak doctor --json
```

Ispezionare ogni funzionalità segnalata. Il comportamento di namespace, mount, Landlock, seccomp, cgroup, display, audio, init e bridge host dipende dall'host. Seguire i test unitari con un controllo runtime su un host supportato.

Per una modifica all'avvio, installa o testa un pacchetto reale tramite il binario cpak creato localmente. Per una modifica al manifest, valida e testa il repository del pacchetto. Per una modifica all'immagine, creala tramite il workflow di `Containerpak/images` e testa il risultato pubblicato con cpak.

## Lavoro sui pacchetti

Ogni pacchetto ufficiale ha il proprio repository sotto l'organizzazione Containerpak. Il repository del pacchetto contiene `cpak.json`, la documentazione del pacchetto e dello Store, il workflow di firma e i test specifici del manifest. `Containerpak/images` contiene le ricette e pubblica le immagini OCI condivise.

I metadati e i permessi dell'applicazione appartengono al repository del pacchetto. I file runtime e gli adattamenti della build appartengono a `Containerpak/images`. Il contenuto ABI condiviso appartiene a un'immagine di base o a una dipendenza quando viene usato da più pacchetti.

## Lavoro sul sito web

Il sito web è un'applicazione SvelteKit in [Containerpak/cpak.it](https://github.com/Containerpak/cpak.it). La documentazione risiede come Markdown in `src/content/docs` e viene resa localmente dal sito.

```bash
pnpm install
pnpm check
pnpm build
pnpm dev
```

Controlla i layout desktop e mobile per ogni modifica visiva. Gli esempi di codice della documentazione devono corrispondere alla CLI corrente e allo schema del manifest v3.

## Mantieni l'attenzione sui cambiamenti

Seguire le convenzioni già presenti nel repository di destinazione. Evitare formattazioni non correlate o aggiornamenti delle dipendenze. Una modifica dovrebbe spiegare il suo comportamento attraverso codice, test e un oggetto commit conciso.

Utilizza i modelli di report esistenti del repository quando apri un problema. Includere un comando riproducibile e prove grezze degli errori runtime.

## Licenze

cpak runtime e tutti i contributi accettati rimangono disponibili solo con LGPL-2.1. I contributori devono accettare il [Contratto di licenza del collaboratore cpak](https://github.com/Containerpak/cpak/blob/v2/CLA.md), che garantisce ai proprietari del progetto i diritti necessari per mantenere cpak mantenendo i contributi sotto la stessa licenza pubblica.

Le image del pacchetto contengono le licenze e i termini di ridistribuzione del software incluso. Rivedi i termini originali prima di pubblicare file binari, icone, caratteri o schermate.
