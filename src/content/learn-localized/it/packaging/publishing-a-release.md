Una release collega una revisione Git, un manifest e il digest dell'immagine costruita per quella revisione. Il repository è l'origine del pacchetto; lo Store è il catalogo che indirizza gli utenti verso quell'origine.

## Mantieni allineati sorgente e immagine

Costruisci l'immagine dal sorgente taggato e pubblica ogni architettura supportata. `image_ref: source` può seguire il branch, la release o il commit Git selezionato, mentre `cpak lock` registra i digest immutabili delle immagini risolte.

```
cpak validate cpak.json
cpak lock cpak.json
cpak test cpak.json
```

Allega SBOM e provenienza della build in CI. Verifica i checksum del vendor prima di copiare gli artefatti nell'immagine e mantieni lo stage finale libero dalle cache di compilazione.

## Scrivi separatamente per lo Store

`README.md` presenta il repository a chi contribuisce. `STORE-README.md` spiega installazione, primo avvio ed eventuale autenticazione del vendor a chi usa il pacchetto. Lo Store lo legge dallo stesso tag o commit del manifest, mai da un branch differente che continua a cambiare.

## Tratta i nuovi permessi come modifiche API

Aggiungere un permesso modifica il contratto del pacchetto. Gli aggiornamenti interattivi mostrano la nuova richiesta prima dell'attivazione. Quelli non interattivi rifiutano l'ampliamento. Spiega il motivo nella release invece di nasconderlo in una modifica al manifest.

Verifica prima installazione, aggiornamento, rollback e rimozione. Se il pacchetto usa addon o dipendenze nested, includi anche i loro percorsi di installazione e pulizia.

[Pubblicare pacchetti](/docs/publishing) documenta metadati dello Store, firme e canali di release.
