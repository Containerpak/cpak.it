---
title: Programma di installazione cpak
description: Installa un'applicazione dello Store con il programma di installazione grafico o terminale firmato oppure aggiungi i download del programma di installazione a una pagina del pacchetto.
tags: [installer, store, security, publishing]
section: start
order: 15
---
# cpak-installer

Il programma di installazione cpak è un eseguibile firmato per un'applicazione Store. Contiene i file binari `cpak` e `cpak-storaged` corrispondenti oltre ai metadati del pacchetto verificati. Al momento dell'installazione risolve l'image manifest, OCI, le dipendenze, i permessi e le esportazioni desktop.

## Per gli utenti

Apri un'applicazione nello [cpak Store](/store) e seleziona **Scarica programma di installazione**. Lo Store sceglie, quando possibile, l'architettura attuale. Il menu accanto al pulsante fornisce anche il comando terminale equivalente e un URL di installazione diretta.

I browser normalmente salvano il file senza il bit eseguibile. Abilita l'esecuzione nelle proprietà del file o esegui:

```bash
chmod +x Application-amd64.cpak-installer
./Application-amd64.cpak-installer
```

L'apertura del file da un desktop X11 o XWayland mostra il nome dell'applicazione, l'icona originale, la descrizione, l'origine, i permessi richiesti, l'avanzamento dell'installazione e il risultato finale. L'avvio dello stesso file da un terminale mostra un messaggio di conferma e segnala i progressi lì. Utilizzare `--terminal` per richiedere esplicitamente l'interfaccia terminale.

Il programma di installazione inserisce o aggiorna `cpak` e `cpak-storaged` in `~/.local/bin`, quindi installa il pacchetto selezionato dalla revisione Git bloccata. I binari runtime corrispondenti vengono riutilizzati.

Ispeziona i metadati verificati senza installare nulla:

```bash
./Application-amd64.cpak-installer --inspect
```

Il comando stampa l'origine del pacchetto, i metadati di visualizzazione, l'architettura, il riferimento all'origine, i permessi richiesti e il digest del programma di installazione.

## Cosa verifica il download

Ogni capsula porta metadati firmati con Ed25519. La firma riguarda:

- origine del pacchetto e riferimento immutabile Git
- nome dell'applicazione, descrizione, icona e permessi richiesti
- l'architettura di destinazione
- il riassunto SHA-256 della base completa di installatori

Il programma di installazione cpak verifica la firma, lo schema dei metadati, l'architettura e il digest di base completo prima di mostrare l'interfaccia o scrivere un file. La modifica dell'identità dell'applicazione, del riferimento all'origine, dei permessi, dei file binari runtime incorporati o del codice di installazione invalida la capsula.

Ogni binario runtime viene scritto tramite un file temporaneo e rinominato in posizione solo dopo che la scrittura ha avuto esito positivo. L'installazione del pacchetto segue quindi lo stesso percorso di convalida e transazione manifest di `cpak install`.

## Per sviluppatori di pacchetti

Pubblica un repository di pacchetti valido e le relative image OCI, quindi aggiungi la voce rivista a [Containerpak/store](https://github.com/Containerpak/store). Il flusso di lavoro di rilascio cpak produce una base di installazione per ciascuna architettura supportata e un catalogo firmato che descrive ciascun pacchetto elencato.

Lo Store assembla un download quando viene richiesto questo endpoint:

```text
https://cpak.it/install/github.com/OWNER/REPOSITORY?arch=amd64
```

Utilizzare `arch=arm64` per ARM64. L'endpoint carica la base e il catalogo del programma di installazione dalla versione cpak configurata, verifica il digest di base rispetto al catalogo, aggiunge i metadati e la firma del pacchetto e restituisce il risultato come `application/vnd.cpak.installer`.

L'origine dello Store richiesta e il catalogo delle versioni firmate sono gli input esclusivi dell'identità del pacchetto. Una base di installazione serve ogni pacchetto elencato.

Collegamento all'endpoint per un percorso di installazione grafica diretta. Pubblica il comando del terminale accanto ad esso:

```bash
cpak install github.com/OWNER/REPOSITORY
```

La pagina dell'applicazione Store pubblica entrambi i moduli nel menu di download. Le basi di installazione e i metadati del pacchetto vengono prodotti dal flusso di lavoro di rilascio cpak.

## Risorse della release

Le versioni cpak con versione pubblicano queste risorse per `amd64` e `arm64`:

```text
cpak-linux-ARCH
cpak-storaged-linux-ARCH
cpak-installer-linux-ARCH
cpak-installer-catalog.json
SHA256SUMS
```

La base del programma di installazione generico contiene l'interfaccia del programma di installazione ed entrambi i binari runtime della stessa versione. Il catalogo contiene i metadati del pacchetto firmato e il digest di base previsto. cpak.it combina questi artefatti verificati dopo aver controllato il digest di base.

Vedere [Canali di rilascio](/docs/release-channels) per la selezione della versione, [Pubblica nello Store](/docs/publishing) per i requisiti del catalogo e [Segnalazione sulla sicurezza](/docs/security) per i rapporti privati sulle vulnerabilità.