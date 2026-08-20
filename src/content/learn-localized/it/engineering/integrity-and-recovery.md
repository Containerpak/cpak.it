L'integrità deriva da una catena di controlli. Il registro dimostra quali byte identifica un descrittore OCI, la transazione registra quale stato completo è diventato attivo e il verified launch controlla che lo storage locale corrisponda ancora allo stato salvato durante l'installazione.

## Risolvere input immutabili

Il client OCI seleziona l'architettura corrente dall'indice dell'immagine, verifica ogni descrittore e salva i layer secondo il digest SHA-256. Il lock del pacchetto registra i digest risolti del manifest e delle immagini per l'intero grafo delle dipendenze. Le runtime source aggiungono dimensione e digest esatti dei propri artefatti.

## Attivare soltanto dopo uno staging completo

Un'installazione o un aggiornamento prepara manifest, layer OCI, runtime source, dipendenze, export desktop e record del database. Il record attivo cambia soltanto quando ogni elemento obbligatorio è pronto. Una transazione interrotta viene recuperata senza sostituire la versione precedente con uno stato incompleto.

Il rollback ripristina la vista runtime derivata dal manifest precedente. I dati scrivibili dell'applicazione rimangono separati, quindi un programma che ha migrato i propri file può richiedere una procedura di recupero specifica.

## Registrare separatamente identità e policy

Il verified launch calcola una root del pacchetto per l'identità e una root della policy per gli accessi effettivi, quindi le combina nella launch root conservata nel ledger amministrativo. I permessi possono così restringersi senza fingere che siano cambiati i byte del pacchetto, mentre un aggiornamento può cambiare il pacchetto senza alterarne silenziosamente gli accessi.

## Sconosciuto e contraddittorio sono stati differenti

L'enforcement controlla gli stati non registrati o sconosciuti. Con `off` possono partire, con `warn` vengono segnalati e con `refuse` vengono bloccati. Uno storage manomesso contraddice invece uno stato già conosciuto da cpak e viene sempre rifiutato.

`cpak audit` verifica record installati e binding dei layer. `cpak system explain` confronta lo stato registrato con quello derivato. Un binding backfill registra lo stato corrente del disco: serve a una migrazione, non dimostra l'autenticità dei byte precedenti.

[Verified launch](/docs/verified-launch) definisce ogni risultato. [Aggiornamenti e rollback](/docs/updates) descrive il flusso transazionale.
