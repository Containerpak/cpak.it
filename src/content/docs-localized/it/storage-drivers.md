---
title: Driver di storage
description: Implementa e distribuisci uno storage cpak driver tramite il protocollo Unix socket con versione.
tags: [storage, drivers, protocol]
section: runtime
order: 25
---
# Driver di storage

Uno storage cpak driver deriva directory native persistenti da layer di origine immutabili. cpak convalida tali directory, le registra in un indice atomico runtime e le fornisce direttamente a OverlayFS senza root all'avvio di un'applicazione.

Il ciclo di vita di driver è limitato alla preparazione, verifica, rimozione e raccolta dei rifiuti. Esce dopo ogni operazione di manutenzione. Un avvio preparato legge direttamente l'indice runtime.

## Driver integrati

Il driver predefinito `fvs` legge gli stati FVS autorevoli e pubblica checkout nativi verificati. I file completi riutilizzano oggetti condivisi tramite reflink o hard link, ove supportato. I blocchi definiti dal contenuto FVS rimangono la fonte della verità e possono ricostruire un checkout derivato.

`dabadee` driver implementa lo stesso contratto con la deduplicazione dell'intero file. Supporta test di compatibilità e distribuzioni che scelgono esplicitamente DaBaDee. La selezione del driver appartiene alla configurazione locale cpak e lascia i manifesti dell'applicazione portatili.

Imposta driver nella configurazione cpak o per un comando:

```bash
CPAK_STORAGE_DRIVER=dabadee cpak storage migrate
```

## Protocollo v1

Il protocollo v1 utilizza una richiesta e risposta JSON con terminazione di nuova riga per connessione Unix socket privata. I frame sono limitati a 1 MiB. Il server controlla l'ID utente peer e rifiuta campi sconosciuti, versioni di protocollo non supportate, identificatori di layer non validi e layer duplicati.

I metodi sono:

| Metodo | Scopo |
| ---------- | ------------------------------------------------------------ |
| `probe` | Segnala identità, protocollo e funzionalità di driver.          |
| `prepare` | Pubblica checkout nativi persistenti per layer ordinati.      |
| `verify` | Controllare i dati derivati e, facoltativamente, ripararli dall'origine. |
| `remove` | Rimuovi i checkout derivati selezionati.                           |
| `gc` | Segnala o rimuovi i dati derivati a cui non fanno riferimento i layer attivi. |
| `shutdown` | Interrompere il processo driver su richiesta.                           |

Le richieste identificano i layer e le opzioni operative. Le radici dei driver provengono dalla configurazione fissa del processo. cpak convalida ogni percorso restituito rispetto alla radice assegnata, inclusa la risoluzione del collegamento simbolico.

## Implementare un driver

Il protocollo è indipendente dal linguaggio di implementazione. Uno driver deve:

- crea il suo socket con la modalità `0600` sotto una directory `0700` in modalità privata;
- accetta solo lo stesso ID utente su Linux;
- pubblica ogni checkout atomicamente;
- mantenere a disposizione un checkout valido quando un'altra preparazione fallisce;
- tratta le directory derivate come dati ricostruibili;
- mantiene invariati i layer di origine durante la verifica, la riparazione, la rimozione e la raccolta dei rifiuti;
- restituisce OverlayFS le directory inferiori nell'ordine di priorità più alta.

Le implementazioni Go possono utilizzare [`github.com/containerpak/storage`](https://github.com/Containerpak/storage). Il modulo fornisce il protocollo client e server, l'indice atomico runtime, la convalida e una suite di conformità condivisa.

## Confinamento esterno driver

Imposta `CPAK_STORAGE_DRIVER_BINARY` per testare un'implementazione esterna. cpak lo avvia senza accesso alla rete e limita l'accesso al filesystem alla sorgente assegnata, driver e alle radici socket. Se host non è in grado di applicare il confinamento richiesto, cpak si rifiuta di avviare driver.

Un binario complementare ufficiale installato accanto a `cpak` fa parte della stessa versione attendibile. Un binario trovato tramite `PATH` è esterno e segue il percorso confinato.

## Operazioni

Ispezionare e sottoporre a manutenzione il driver selezionato con:

```bash
cpak storage status
cpak storage status --json
cpak storage migrate
cpak storage verify
cpak storage verify --repair
```

La preparazione mantiene i controlli degli layer completati dopo un batch interrotto. Il tentativo successivo li verifica e li riutilizza prima di pubblicare un nuovo indice runtime. I dati dell'applicazione rimangono separati da queste directory derivate.