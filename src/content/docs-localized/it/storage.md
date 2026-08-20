---
title: Store, deduplicazione e pulizia
description: Ispeziona i dati di cpak, ripara transazioni interrotte, condividi contenuti identici e recupera spazio inutilizzato.
tags: [storage, gc, audit]
section: operations
order: 30
---

# Store, deduplicazione e pulizia

cpak mantiene separati il contenuto OCI immutabile e lo stato scrivibile dell'applicazione. I comandi di pulizia operano sui riferimenti nel database dei pacchetti, quindi il contenuto condiviso non viene eliminato finché un altro pacchetto lo usa.

> [!WARNING] Regressione di avvio di FVS Storage
> In alcune condizioni cpak v2.1.x può avviare le applicazioni più lentamente del previsto. Leggi l'[avviso dell'incidente](/announcements/fvs-storage) prima di eseguire un downgrade: cpak v2.0.1 non può leggere layer già migrati a FVS.

## Verifica lo Store

```bash
cpak audit
```

L'audit confronta i record dei pacchetti installati, i riferimenti ai layer, lo stato delle transazioni, le runtime source e i file salvati. Eseguilo dopo un aggiornamento interrotto, uno spostamento manuale dello Store o un errore del filesystem.

L'audit legge in posizione sia layer legacy sia layer FVS. Migrazione, avvio dell'applicazione e download restano operazioni separate.

Applica in modo esplicito le riparazioni supportate:

```bash
cpak audit --repair
```

Leggi il report prima della riparazione se lo Store contiene dati importanti. La riparazione riguarda la coerenza dei metadati cpak. Ripristina da un backup i file dell'applicazione eliminati esternamente.

## Garbage collection

Mostra i layer e le voci di cache senza riferimenti:

```bash
cpak gc
cpak gc --json
```

Elimina i dati indicati:

```bash
cpak gc --apply
```

La garbage collection conserva i layer riferiti dai pacchetti installati, dal loro grafo di dipendenze attivo e dallo stato di rollback. Elimina i blocchi FVS quando scompare l'ultimo riferimento al layer e raccoglie gli oggetti DaBaDee senza riferimenti. La migrazione dello storage ha un ciclo di vita esplicito. Un report pulito non contiene layer candidati, voci di cache, oggetti di contenuto o byte recuperabili.

## Deduplicazione automatica a due livelli

Il pull di un'image applica automaticamente entrambi i livelli. I digest dei layer OCI gia presenti vengono riusati. Un nuovo layer passa attraverso verifica del digest e decompressione nel block store FVS globale. L'importazione completa conserva la rappresentazione FVS usata dai pacchetti installati.

FVS usa blocchi definiti dal contenuto. Intervalli identici in file e layer diversi puntano allo stesso blocco, anche se i file differiscono in una piccola parte. I checkout nativi aggiungono il riuso di file interi con reflink o hard link, quando il filesystem lo supporta.

`cpak dedup` fornisce manutenzione basata su DaBaDee per un path esterno esplicito:

```bash
cpak dedup --path /path/to/cpak/store
```

Il comando calcola l'hash dei file regolari e riusa file interi tramite hard link quando il filesystem sorgente lo supporta. I filesystem compatibili possono riusare anche intervalli corrispondenti tramite reflink.

## Prepara uno Store cpak esistente

L'installer grafico e `cpak self-update` preparano i layer delle applicazioni esistenti dopo la sostituzione dei binari del runtime. `cpak-storaged` crea un checkout nativo verificato per ogni layer immutabile e pubblica un indice runtime atomico. I layer completati da un batch interrotto vengono conservati e riusati al tentativo successivo.

Un avvio dal desktop rileva un checkout richiesto ma mancante, mostra una finestra di avanzamento dopo 400 millisecondi, completa i layer interessati e avvia l'applicazione. Gli avvii dal terminale riportano la stessa operazione nel terminale. Gli avvii preparati leggono direttamente l'indice.

Ispeziona o avvia l'operazione in modo esplicito con:

```bash
cpak storage status
cpak storage migrate
cpak storage verify
cpak storage verify --repair
```

FVS resta lo Store autorevole dei layer. I checkout nativi sono dati derivati e possono essere verificati o ricostruiti. DaBaDee implementa lo stesso contratto di storage versionato per deployment compatibili. Le applicazioni che usano DaBaDee come libreria Go possono seguire la [guida indipendente alla migrazione a DaBaDee v2](https://github.com/mirkobrombin/DaBaDee/blob/main/docs/migration-v2.md).

## Rimuovi un'applicazione

```bash
cpak stop github.com/example/app
cpak remove github.com/example/app
cpak gc --apply
```

La rimozione elimina il record del pacchetto e la sua integrazione desktop esportata. I layer condivisi restano finché nessun pacchetto installato o versione conservata li riferisce.

Il comando di rimozione arresta e pulisce i container posseduti dal pacchetto selezionato, poi rilascia i relativi metadati dei layer. Esegui `cpak gc --apply` per recuperare blocchi di contenuto condiviso quando scompare il loro ultimo riferimento.

## Esegui il backup dello stato scrivibile

Esegui insieme il backup dello stato dell'applicazione e del database cpak quando ti serve uno snapshot ripristinabile. I layer immutabili possono essere scaricati di nuovo, ma stato locale e override dell'utente potrebbero non esistere altrove.

Arresta le istanze in esecuzione prima di acquisire uno snapshot a livello di filesystem. Eviti così di salvare un database o un file dell'applicazione mentre cambia.
