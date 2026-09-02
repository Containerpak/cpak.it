Il manifest iniziale descrive un'applicazione desktop. I suoi cinque permessi aprono una finestra Wayland, riproducono audio, inviano notifiche, passano collegamenti all'host e raggiungono la rete. Puoi rimuoverli uno alla volta e osservare quali risorse scompaiono.

Apri `cpak.json` nel playground e sostituisci l'intero oggetto `override` con un oggetto vuoto. Ogni percorso scompare. Un pacchetto parte da qui: nessuna directory, nessun socket, nessun dispositivo e nessuna connessione all'esterno.

Aggiungi `"socketWayland": true`. Appaiono due percorsi: il socket del compositor e il lock associato. Il socket permette all'applicazione di creare una finestra. Esegui `cpak validate` nel terminale sotto il file per controllare il manifest.

## Leggere un permesso attraverso il confine che apre

Aggiungi anche `"displayX11": true`. Non appare alcun socket X11 dell'host. cpak avvia un display X11 di compatibilità privato e indirizza il pacchetto a quell'endpoint invece che al display host.

La differenza è intenzionale. Il manifest v3 ha rimosso l'accesso X11 raw perché i client sullo stesso display host possono osservare appunti, input e pixel degli altri client. Il permesso sostitutivo esegue ancora le applicazioni X11 senza concedere loro il display host.

Entrambi i permessi occupano una sola riga, ma soltanto uno monta un percorso host. Leggi insieme la funzionalità richiesta, i percorsi e i servizi mediati dal broker.

## Alcuni permessi aprono più di quanto suggerisca il nome

La maggior parte dei permessi espone una sola risorsa. Alcuni modificano un intero namespace oppure concedono un servizio host tipizzato. La guida sotto il workspace elenca tutte le chiavi del manifest v3 accettate dalla build corrente, mentre il risultato accanto al manifest mostra l'effetto di ogni modifica.

`sessionBus` indica destinazioni, percorsi oggetto, interfacce e metodi esatti. `bluetooth` espone BlueZ tramite un bus privato filtrato. Nessuno dei due consegna al pacchetto un socket raw dell'host. Anche `notification`, `openURI`, `filePicker`, `hostApplications` e `hostActions` attraversano il confine tramite richieste tipizzate invece che con mount ampi.

`deviceAll` espone l'intera directory `/dev/`. Quando è attivo, gli undici permessi dedicati ai singoli dispositivi non restringono più nulla.

Altri quattro permessi non espongono percorsi e per questo sono facili da ignorare. `hostNetwork` condivide il namespace di rete dell'host, incluso localhost, e richiede `network`. `process` condivide il namespace dei processi dell'host. `userNamespaces` permette di creare sandbox annidate, necessarie ai browser. `asRoot` esegue il processo come uid 0 all'interno del container.

Quando prepari un pacchetto, chiediti senza quali funzionalità l'applicazione non possa funzionare e concedi la forma più ristretta disponibile. È il punto centrale di una revisione del manifest.

[Permessi](/docs/permissions) è la guida di riferimento usata in questa lezione.
