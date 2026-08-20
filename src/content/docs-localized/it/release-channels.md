---
title: Canali di rilascio
description: Scegli build cpak notturni, continui o con versione e scopri cosa promette ogni canale.
tags: [releases, versions, ci]
section: operations
order: 60
---
# Canali di rilascio

cpak pubblica i binari statici `cpak` e `cpak-storaged` Linux oltre alle basi di installazione dello Store per `amd64` e `arm64`. Ogni build pubblicata include checksum SHA-256, un SPDX JSON SBOM e attestati GitHub per i file binari e SBOM.

## Continuo

Il [rilascio continuo](https://github.com/Containerpak/cpak/releases/tag/continuous) segue i push riusciti al ramo `v2`. È l'attuale fonte di installazione per gli sviluppatori e l'avvio sperimentale di cpak.

Continuous riceve le modifiche v2 completate prima di un rilascio con versione. Leggere lo commit e lo stato del flusso di lavoro prima di utilizzarlo su dati applicativi insostituibili.

## Notte

Il rilascio notturno viene prodotto dalla compilazione pianificata o dall'esecuzione manuale del flusso di lavoro notturno. Verifica il repository a quel punto anche quando nessun nuovo commit ha raggiunto il canale continuo quel giorno.

Utilizzare ogni notte per test di compatibilità precoci e copertura automatizzata. Non dare per scontato che una build notturna abbia una finestra di supporto più lunga rispetto alla sua origine commit.

## Rilasci con versione

I tag corrispondenti a `v*` pubblicano risorse di rilascio con versione e note di rilascio generate. Una versione con versione è il riferimento da utilizzare quando un progetto necessita di una versione cpak denominata e revisionabile.

Il binario riporta un identificatore di sviluppo come `0.0.0-<commit>` quando viene creato da un ramo. Le build contrassegnate riportano la loro versione di rilascio.

I download del programma di installazione dello Store contengono il file binario cpak corrispondente. Il catalogo firmato registra il suo SHA-256 e aggiunge ogni pacchetto a un Git commit, quindi un programma di installazione dello Store con versione installa la build cpak prodotta dal flusso di lavoro di quella versione e la revisione del pacchetto selezionata quando è stata creata la versione.

## Controlli degli aggiornamenti di runtime

I binari ufficiali controllano l'ultima versione rilasciata al massimo una volta al giorno. Esegui un controllo immediato o installa:

```bash
cpak self-update --check
cpak self-update
```

Il programma di installazione verifica entrambi i file binari runtime per l'architettura selezionata rispetto ai checksum della versione prima di sostituire i file installati. I candidati al rilascio sono più vecchi della versione stabile corrispondente, quindi un rilascio stabile sostituisce il suo candidato anche quando la versione numerica è uguale.

I packager creano con `SELF_UPDATE_MODE=managed`. Ciò mantiene l'avviso sulla versione e disabilita la override diretta:

```bash
make VERSION=v2.1.2 SELF_UPDATE_MODE=managed
```

La versione di rilascio e la modalità di aggiornamento sono compilate nel file binario. Non applicare patch al comando runtime né rimuovere il controllo degli aggiornamenti in una ricetta del pacchetto.

## Verifica una risorsa

Scarica il file binario corrispondente e `SHA256SUMS`, quindi verificalo prima dell'installazione:

```bash
sha256sum -c SHA256SUMS --ignore-missing
```

Gli attestati GitHub forniscono un altro percorso di verifica per la provenienza del rilascio. SBOM elenca le dipendenze acquisite dal flusso di lavoro di rilascio.

## Rilasci del pacchetto

I pacchetti applicativi hanno il proprio repository e il proprio ciclo di vita dell'image OCI. Aggiornali con `cpak update` ed esamina eventuali nuove richieste di permesso.

I flussi di lavoro delle image del pacchetto dovrebbero pubblicare un tag SHA immutabile accanto al tag del ramo mobile. I file di blocco e i digest delle image installate preservano l'esatto contenuto utilizzato da un test o da una transazione.