Finora abbiamo configurato le policy. Questa lezione copre l'altra metà del lavoro: un'applicazione non parte e devi capire rapidamente perché.

## Quali policy sono attive

```
cpak system status
```

È il primo comando da eseguire e quello che viene saltato più spesso. Mostra il livello di enforcement, la policy di firma, il ceiling e la policy di trust. Molte segnalazioni secondo cui cpak non funziona provengono da host impostati su `refuse` e poi dimenticati.

## Perché questo pacchetto non parte

```
cpak system explain github.com/example/thing
```

Il comando applica la policy a un pacchetto realmente installato sulla macchina. Risponde a domande come "il ceiling sembra corretto, allora perché questo permesso viene ristretto?" e produce le informazioni da allegare a una segnalazione.

Il playground del ceiling mostra lo stesso confronto prima di applicare una policy. `explain` lo mostra dopo, usando lo stato reale della macchina.

## Il rifiuto che sopravvive alla rimozione

Rimuovere un'applicazione non cancella ciò che il ledger conosce. cpak conserva la generazione raggiunta e l'identità del publisher, così la rimozione non può diventare un modo per installare una versione più vecchia o priva di firma.

Questa protezione produce un caso che può sorprendere: una reinstallazione rifiutata quando l'applicazione non è più presente. Il messaggio indica il motivo e il comando necessario per rinunciare alla protezione.

```
cpak system clear-removal github.com/example/thing
```

Il comando elimina l'anchor conservato e richiede l'autenticazione dell'amministratore. Non esiste una variante limitata al proprio account, perché l'anchor protegge l'intero host da downgrade, perdita della firma e ampliamento dei permessi.

Prima di chiedere l'autenticazione, cpak mostra esattamente cosa verrà eliminato. Se la generazione registrata è più recente di quella che stai per installare, il rifiuto sta funzionando correttamente. Proseguire significa accettare consapevolmente il downgrade.

## L'ordine corretto

Esegui prima `status`, perché descrive la policy attiva. Usa poi `explain`, perché mostra il risultato per il singolo pacchetto. Lascia `clear-removal` per ultimo e usalo soltanto dopo aver letto cosa verrà perso: è l'unico dei tre comandi che modifica lo stato del sistema.
