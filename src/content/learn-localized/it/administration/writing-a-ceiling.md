Un ceiling usa la stessa struttura dei permessi presenti nel manifest e nell'override locale, quindi è facile attribuirgli un effetto che non ha. Il playground accanto alla lezione mostra il risultato di ogni modifica.

## Una chiave omessa resta sotto il controllo dell'utente

Un ceiling limita soltanto le chiavi che contiene. Una chiave assente non viene negata né concessa: resta determinata dal manifest o dall'override locale.

Per questo un ceiling utile può essere molto breve. Indica soltanto ciò che l'host deve limitare e lascia invariato il resto:

```
{
  "network": false,
  "deviceAll": false,
  "filesystem": [{ "path": "home/Documents", "access": "read-only" }]
}
```

## Scrivere true non concede nulla

Seleziona _Un ceiling che non chiude nulla_. Il ceiling contiene `"deviceAll": false`, ma l'applicazione mantiene l'accesso alla GPU perché ha richiesto `deviceDri`, una chiave che il ceiling non limita.

Ora aggiungi `"deviceDri": true` al ceiling. Il risultato non cambia. Il valore true indica soltanto che l'host non limita quel permesso, esattamente come accade quando la chiave è assente. Il permesso deve essere richiesto dal manifest o da un override locale salvato.

## Un servizio tipizzato può essere ristretto chiamata per chiamata

Seleziona _Una regola bus esatta_. L'applicazione richiede `List` e `Open` su un servizio di sessione. Il ceiling consente soltanto `List`, quindi `Open` scompare. Il pacchetto riceve un bus di sessione filtrato e non ottiene mai il socket raw dell'host.

La stessa intersezione si applica all'interno dei permessi tipizzati. Un ceiling del filesystem può ridurre lettura e scrittura alla sola lettura, mentre un ceiling del bus può ridurre i metodi ammessi per una destinazione, un percorso e un'interfaccia esatti. Il pannello del playground elenca ogni risorsa controllata dalle chiavi presenti nel file.

## Restringere non significa soltanto rimuovere

Il caso iniziale del playground, _Limitato a una directory_, mostra un pacchetto che richiede l'intera home in lettura e scrittura mentre il ceiling concede soltanto la lettura. L'applicazione parte con un permesso più ristretto. Un percorso non coperto dal ceiling viene invece rimosso.

Il numero totale dei permessi non descrive bene il risultato. Controlla quali accessi sono stati ridotti e quali sono scomparsi.

## Prima di applicarlo a una macchina reale

Inserisci nel playground il ceiling che vuoi usare e il manifest di un'applicazione realmente installata. Una policy troppo restrittiva può lasciare avviare il programma e rompere soltanto una funzione usata più tardi.

`cpak system explain ORIGIN` mostra lo stesso confronto per un pacchetto installato sulla macchina.
