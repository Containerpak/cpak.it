Il manifest iniziale descrive un'applicazione desktop. I suoi cinque permessi aprono una finestra Wayland, riproducono audio, inviano notifiche, passano collegamenti all'host e raggiungono la rete. Puoi rimuoverli uno alla volta e osservare quali risorse scompaiono.

Apri `cpak.json` nel playground e sostituisci l'intero oggetto `override` con un oggetto vuoto. Ogni percorso scompare. Un pacchetto parte da qui: nessuna directory, nessun socket, nessun dispositivo e nessuna connessione all'esterno.

Aggiungi `"socketWayland": true`. Appaiono due percorsi: il socket del compositor e il lock associato. Il socket permette all'applicazione di creare una finestra. Esegui `cpak validate` nel terminale sotto il file per controllare il manifest.

## Leggere un permesso attraverso i percorsi che apre

Aggiungi anche `"socketX11": true`. I due percorsi diventano otto. Quattro dei nuovi percorsi sono le directory dei socket X11, il quinto è il file di autorizzazione necessario al client e il sesto appare soltanto quando Wayland e X11 sono attivi insieme: il cookie scritto da Xwayland.

Leggi la nota sotto la directory dei socket. X11 non separa i propri client, quindi qualsiasi programma sullo stesso display può leggere gli appunti, osservare ciò che viene digitato nelle altre finestre e copiarne i pixel. Wayland non concede automaticamente questi accessi.

Entrambi i permessi occupano una sola riga nel manifest. Il nome dice poco; i percorsi mostrano cosa può realmente raggiungere l'applicazione.

## Otto permessi aprono più di quanto suggerisca il nome

La maggior parte dei permessi apre un socket o una directory. Otto controllano un insieme più ampio di risorse. La guida sotto il workspace elenca tutte le chiavi accettate dalla build corrente, mentre il risultato accanto al manifest mostra l'effetto di ogni modifica.

Tre permessi aprono un bus, non un singolo servizio: `socketSessionBus`, `socketSystemBus` e `socketBluetooth`. L'ultimo espone lo stesso socket del bus di sistema con un nome più specifico. Un'applicazione può raggiungere attraverso il bus qualsiasi servizio che l'host abbia collegato a quel socket.

`deviceAll` espone l'intera directory `/dev/`. Quando è attivo, gli undici permessi dedicati ai singoli dispositivi non restringono più nulla.

Gli ultimi quattro non espongono percorsi e per questo sono facili da ignorare. `network` fornisce una connessione esterna al posto di un namespace di rete isolato. `process` condivide il namespace dei processi dell'host. `userNamespaces` permette di creare sandbox annidate, necessarie soprattutto ai browser. `asRoot` esegue il processo come uid 0 all'interno del container.

Quando prepari un pacchetto, chiediti senza quali di questi otto permessi l'applicazione non possa funzionare. È il punto centrale di una revisione del manifest.

[Permessi](/docs/permissions) è la guida di riferimento usata in questa lezione.
