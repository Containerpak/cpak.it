---
title: cpak nidificati
description: Dichiara ed esegui una dipendenza cpak come servizio controllato all'interno di un altro pacchetto.
tags: [nested, dependencies, runtime]
section: runtime
order: 40
---
# cpak annidati

cpak nidificato consente a un'applicazione di eseguire una dipendenza dichiarata in un ambiente di pacchetto separato. Il genitore possiede la sua interfaccia e il suo stato mentre la dipendenza fornisce runtime e i suoi file binari.

## Dichiarare la dipendenza

Aggiungi il pacchetto nidificato come dipendenza manifest:

```json
"dependencies": [
  {
    "origin": "github.com/containerpak/umu",
    "branch": "main"
  }
]
```

cpak installa la dipendenza con il genitore e la registra nel grafico del pacchetto. I layer condivisi rimangono deduplicati nello Store locale.

## Esecuzione della richiesta

Il pacchetto padre invia una richiesta nidificata strutturata al servizio cpak. runtime dell'host risolve la dipendenza installata, applica il suo manifest, avvia o riutilizza l'istanza richiesta e restituisce il risultato tramite il protocollo privato.

Il genitore riceve un percorso di richiesta con ambito alla sua dipendenza dichiarata. Il database host cpak e il controllo socket rimangono fuori dall'ambiente principale.

## File e stato

Il pacchetto nidificato ha i propri layer immutabili e uno stato scrivibile. I percorsi condivisi espliciti possono connettere il flusso di lavoro padre alla dipendenza quando entrambi i manifest lo consentono.

Mantieni i file di proprietà dell'applicazione nel genitore a meno che runtime nidificato non sia il loro proprietario naturale. Ciò impedisce che un aggiornamento o una override della dipendenza porti con sé dati principali non correlati.

## permessi

Il pacchetto nidificato utilizza l'intersezione tra manifest, gli override dell'utente e il limite delil permesso padre. L'accesso dei genitori rimane vincolato dalla propria politica efficace.

## Ciclo di vita e registri

Le istanze annidate utilizzano il supervisore cpak. Il loro output è disponibile tramite i log cpak e utilizzano lo stesso ciclo di vita dell'istanza. Gli errori principali dovrebbero includere l'origine del pacchetto nidificato e la richiesta non riuscita.

## Testare l'integrazione

Testare prima la dipendenza come cpak autonomo. Quindi testa il flusso di lavoro principale completo tramite cpak, inclusa la prima installazione, l'avvio ripetuto, l'aggiornamento, il rollback e la pulizia.

Convalidare il carico di lavoro nidificato completo dopo aver controllato l'individuazione binaria. Un pacchetto che gestisce un runtime dovrebbe creare il proprio stato e avviare un'applicazione rappresentativa attraverso la dipendenza.