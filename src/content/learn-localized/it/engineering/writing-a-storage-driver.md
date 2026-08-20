Uno storage driver non monta l'applicazione e non possiede i suoi dati. Deriva directory native ricostruibili da layer sorgente immutabili. All'avvio, cpak passa queste directory a Rootless OverlayFS.

## L'indice runtime è il percorso di avvio

La manutenzione chiama il driver per preparare e verificare i checkout dei layer. Un avvio già preparato legge direttamente un indice runtime aggiornato in modo atomico, quindi non attende una chiamata al daemon. Il processo del driver termina al termine della manutenzione.

## Protocollo v1

Il protocollo scambia una richiesta e una risposta JSON terminate da newline su ogni connessione privata a un socket Unix. Ogni frame è limitato a 1 MiB. Il socket usa la modalità `0600` dentro una directory `0700` e il server accetta soltanto connessioni dallo stesso user ID.

| Metodo | Responsabilità |
| --- | --- |
| `probe` | Dichiara identità, protocollo e capacità. |
| `prepare` | Pubblica i checkout per i layer ordinati. |
| `verify` | Verifica i dati derivati e, se richiesto, li ripara. |
| `remove` | Elimina i checkout derivati selezionati. |
| `gc` | Segnala o rimuove dati derivati privi di un layer attivo. |
| `shutdown` | Ferma il processo avviato su richiesta. |

## Preparare senza rompere la vista precedente

Costruisci il checkout in una posizione temporanea, validalo e pubblicalo con una rinomina atomica. Una preparazione fallita deve lasciare disponibile l'ultimo checkout valido. I layer completati durante un batch interrotto possono essere riutilizzati dopo la verifica successiva.

Restituisci le lower directory di OverlayFS dalla priorità più alta alla più bassa. Dopo aver risolto i link simbolici, cpak controlla che ogni percorso appartenga alla root assegnata al driver. I layer sorgente restano immutati durante preparazione, riparazione, rimozione e garbage collection.

## I dati derivati devono restare eliminabili

FVS ricostruisce checkout nativi da blocchi sorgente content-defined e riutilizza file completi tramite reflink o hard link. DaBaDee implementa lo stesso contratto cpak con deduplicazione per file intero. L'implementazione interna può cambiare; protocollo osservabile e regole di recupero costituiscono il contratto.

## Distribuire usando la suite di conformità

`github.com/containerpak/storage` fornisce client Go, server, indice atomico, validazione e test di conformità condivisi. Un binario esterno viene avviato senza rete e confinato alle root sorgente, driver e socket. cpak lo rifiuta se l'host non può applicare questo isolamento.

```
cpak storage status --json
cpak storage migrate
cpak storage verify --repair
```

[Storage driver](/docs/storage-drivers) contiene la guida al protocollo e al deployment.
