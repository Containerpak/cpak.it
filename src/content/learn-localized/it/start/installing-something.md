L'installazione si presenta così:

```
cpak install github.com/containerpak/vlc
```

Quell'indirizzo identifica il pacchetto. È un repository, non un nome in un indice centrale: chi possiede l'indirizzo pubblica l'applicazione direttamente. Non esistono una coda o un intermediario tra chi pubblica e chi installa.

## Cosa mostra cpak

Prima di scaricare qualsiasi dato, cpak recupera il manifest e stampa ciò che richiede. Per il comando precedente, l'elenco completo è questo:

```
The following cpak(s) will be installed:
  - VLC: Play video, audio and network streams.

The following will be exported:
  - (binary) /usr/bin/vlc
  - (desktop entry) /usr/share/applications/vlc.desktop

The following permissions will be granted:
  - socket-x11: true
  - socket-wayland: true
  - socket-pulse-audio: true
  - socket-session-bus: true
  - socket-system-bus: false
  - socket-ssh-agent: false
  - device-dri: true
  - device-kvm: false
  ... twenty more, each one true or false

Do you want to continue? [y/N]
```

Ogni riga contiene true oppure false e cpak mostra anche quelle disabilitate. Non esistono permessi omessi da indovinare: l'elenco è completo.

La decisione avviene in questo momento. Dopo la conferma, l'applicazione riceve esattamente ciò che indica l'elenco e non viene chiesto di nuovo.

Confronta i permessi con ciò che l'applicazione dichiara di essere. È normale che un lettore video richieda lo schermo, l'audio e la cartella Video. Se lo stesso programma chiede di essere eseguito come root o di leggere l'intera home, sta comunicando qualcosa che la descrizione non dice.

## Confermare non è l'unica scelta

Dopo l'installazione puoi modificare i permessi del pacchetto. Rimuovi un accesso che non accetti, ripristinane uno necessario oppure aggiungi un permesso che il manifest non richiedeva:

```
cpak override --socketSessionBus=false github.com/containerpak/vlc
```

L'override locale sostituisce la richiesta del publisher per questa installazione. Su una macchina gestita non può comunque superare il ceiling di sistema impostato dall'amministratore. Se l'applicazione smette di funzionare dopo la rimozione di un permesso, puoi ripristinarlo.

## Dove viene installato

Tutto rimane nella tua home. Non esiste un'installazione valida per l'intero sistema, non serve root e non viene scritto nulla in `/usr`. Quando rimuovi un pacchetto, cpak elimina l'immagine e i dati che ha prodotto.

Il flusso è semplice: leggi l'elenco, accettalo o restringilo e rimuovi il pacchetto quando non ti serve più. Il resto del corso insegna a interpretare quell'elenco, perché il nome di un permesso non descrive sempre tutto ciò che apre.
