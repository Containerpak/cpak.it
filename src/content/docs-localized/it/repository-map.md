---
title: Mappa del deposito
description: Trova il progetto che possiede la modifica runtime, pacchetto, image, SDK, broker, Store o sito web.
tags: [contributing, repositories, ownership]
section: project
order: 20
---
# Mappa del repository

Utilizza questa mappa prima di aprire una modifica. I confini del repository seguono la proprietà e il ciclo di vita del rilascio.

## Runtime e integrazione

| Deposito | Possiede |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [Containerpak/cpak](https://github.com/Containerpak/cpak) | CLI, risoluzione OCI, transazioni, runtime, sandbox, broker, manifest e schema.                 |
| [Containerpak/conservazione](https://github.com/Containerpak/storage) | Protocollo driver di storage con versione, client, server, indice runtime e suite di conformità.             |
| [fvs-lab/core](https://github.com/fvs-lab/core) | Blocchi definiti dal contenuto e archivio indirizzato al contenuto condiviso.                                       |
| [fvs-lab/fvs2](https://github.com/fvs-lab/fvs2) | Repository immutabili, snapshot, riferimenti, verifica, ripristino e garbage collection condivisa. |
| [fvs-lab/fvs2d](https://github.com/fvs-lab/fvs2d) | Servizio FUSE FVS autonomo per i consumatori che necessitano di viste del repository montate.                        |
| [mirkobrombina/DaBaDee](https://github.com/mirkobrombin/DaBaDee) | Deduplicazione file generica e compatibilità con i precedenti store cpak.                              |

Il ramo predefinito cpak runtime è `v2`. I provider di integrazione host e i driver di storage FVS e DaBaDee integrati sono presenti nella versione cpak. Il protocollo è un modulo separato, quindi driver può essere implementato in qualsiasi lingua. I progetti FVS e DaBaDee rimangono componenti di uso generale con il proprio ciclo di vita di rilascio.

## Immagini condivise

| Deposito | Possiede |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [Containerpak/image](https://github.com/Containerpak/images) | Immagini runtime di base generali condivise dai pacchetti cpak.                               |
| [Containerpak/vino](https://github.com/Containerpak/wine) | Ambiente multiarch utilizzato dai pacchetti che forniscono il proprio runtime derivato da Wine. |

Un'image condivisa contiene contenuto runtime utilizzato da diversi pacchetti. L'applicazione che la utilizza rimane nella propria image.

## Pacchetti e SDK

I pacchetti ufficiali risiedono in un repository per applicazione sotto [Containerpak](https://github.com/Containerpak). Bottles, UMU, Firefox, Chrome, VS Code, GIMP, Inkscape, LibreOffice, OBS Studio e VLC possiedono ciascuno il proprio manifest e il flusso di lavoro delle image.

Le toolchain linguistiche utilizzano lo stesso modello:

| Deposito | Fornisce |
| ------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [Containerpak/sdk-go](https://github.com/Containerpak/sdk-go) | Go compilatore e formattatore per ambienti di sviluppo cpak. |
| [Containerpak/sdk-node-lts](https://github.com/Containerpak/sdk-node-lts) | Node.js LTS, npm, npx e Corepack.                         |

Un editor elenca le origini SDK supportate come componenti aggiuntivi. Il repository SDK possiede percorsi di compatibilità della toolchain e test dell'architettura.

## Scoperta e documentazione

| Deposito | Possiede |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [Containerpak/Store](https://github.com/Containerpak/store) | Revisione dei metadati del catalogo, delle categorie, delle icone originali, degli screenshot e degli indici generati. |
| [Containerpak/cpak.it](https://github.com/Containerpak/cpak.it) | Sito Web, frontend dello Store, renderer della documentazione e pagine del progetto.                        |

La voce Store punta a un repository di pacchetti. Tale repository possiede `cpak.json` e il relativo ciclo di vita dell'image OCI.

## Dove appartiene una correzione

Inserisci lo spazio dei nomi, la transazione, il permesso, OCI, broker o il comportamento della CLI in `cpak`. Inserisci il contratto del cavo di storage driver e i controlli di conformità in `Containerpak/storage`. Inserisci l'storage dei blocchi e il comportamento degli snapshot nel repository FVS corrispondente. Inserisci la deduplicazione generica dell'albero dei file in DaBaDee. Inserisci una dipendenza dell'applicazione o avvia una soluzione alternativa nel repository dei pacchetti dell'applicazione. Inserisci il contenuto ABI condiviso in un'image di base solo quando più pacchetti lo richiedono.

Quando una modifica attraversa i repository, mantieni ogni commit valido in modo indipendente e aggiorna il consumer solo dopo che la versione o l'image della dipendenza è disponibile.