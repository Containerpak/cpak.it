Il manifest contiene i permessi scelti dall'autore del pacchetto. Sono i valori predefiniti mostrati prima dell'installazione, ma il proprietario di quella installazione può modificarli in seguito.

Un override utente salvato sostituisce i permessi del manifest. Può rimuovere un accesso, ripristinarlo oppure aggiungere un accesso non richiesto dal manifest. In questo modo puoi correggere un'applicazione che richiede un'altra cartella o un altro dispositivo senza modificare i file dell'autore.

Su una macchina gestita, la decisione finale spetta all'amministratore. Il ceiling di sistema viene salvato fuori dal controllo dell'utente e limita sia il manifest sia ogni override locale.

`permessi effettivi = (override utente se presente, altrimenti manifest) limitato dal ceiling amministrativo`

## Il ceiling limita ma non concede

Il ceiling controlla soltanto le chiavi scritte nel proprio file di policy. Se contiene `"network": false`, nessuna applicazione e nessun override utente può ripristinare l'accesso alla rete su quell'host. Una chiave omessa dal ceiling rimane sotto il controllo del proprietario dell'installazione.

Scrivere `"deviceDri": true` non assegna il dispositivo grafico a tutte le applicazioni. Permette a un'applicazione di mantenere quel permesso quando il manifest o l'override locale lo abilita. Un'applicazione che lascia `deviceDri` disabilitato non riceve comunque il dispositivo grafico.

La stessa regola vale per il filesystem. Il ceiling può ridurre una cartella richiesta al solo accesso in lettura, limitarla a un percorso più piccolo oppure rimuoverla. L'utente può sempre scegliere permessi più restrittivi.

## L'utente controlla le installazioni personali

Su una macchina non gestita non esiste un ceiling di sistema. L'override locale è il set di permessi effettivo, quindi l'utente può aggiungere o rimuovere qualsiasi permesso:

```console
cpak override github.com/example/application --key deviceDri --value true
```

L'override appartiene a una versione installata di un singolo pacchetto e viene salvato in `~/.config/cpak/overrides`. Non modifica il manifest dell'autore né l'installazione di un altro utente.

I pacchetti nested hanno un ulteriore limite. Un figlio riceve soltanto l'intersezione tra i propri permessi effettivi e quelli del padre, quindi non può usare il nesting per uscire dall'applicazione che lo ha avviato.

Usa il playground accanto alla lezione per confrontare manifest, override locale e ceiling di sistema. [Distribuzione gestita](/docs/managed-deployment) descrive i comandi amministrativi e i file di policy.
