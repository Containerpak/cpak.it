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
  - Display: isolated X11 compatibility display, Wayland
  - Audio: PulseAudio
  - Devices: graphics, shared memory
  - Files: xdg-videos, read only
  - Network: internet and local network

Do you want to continue? [y/N]
```

Il prompt elenca soltanto gli accessi richiesti dal pacchetto. Una funzionalità assente dall'elenco non viene concessa. I permessi tipizzati mostrano anche il proprio ambito, come il percorso esatto, la modalità di accesso o la chiamata consentita a un servizio di sessione.

La decisione avviene in questo momento. Dopo la conferma, l'applicazione riceve esattamente ciò che indica l'elenco e non viene chiesto di nuovo.

Confronta i permessi con ciò che l'applicazione dichiara di essere. È normale che un lettore video richieda lo schermo, l'audio e la cartella Video. Se lo stesso programma chiede di essere eseguito come root o di leggere l'intera home, sta comunicando qualcosa che la descrizione non dice.

## Confermare non è l'unica scelta

Dopo l'installazione puoi modificare i permessi del pacchetto. Rimuovi un accesso che non accetti, ripristinane uno necessario oppure aggiungi un permesso che il manifest non richiedeva:

```
cpak override github.com/containerpak/vlc --key network --value false
```

L'override locale sostituisce la richiesta del publisher per questa installazione. Su una macchina gestita non può comunque superare il ceiling di sistema impostato dall'amministratore. Se l'applicazione smette di funzionare dopo la rimozione di un permesso, puoi ripristinarlo.

## Dove viene installato

Tutto rimane nella tua home. Non esiste un'installazione valida per l'intero sistema, non serve root e non viene scritto nulla in `/usr`. La rimozione elimina i file runtime e l'integrazione desktop, ma conserva la home privata per una reinstallazione successiva. Usa `cpak remove --purge` per eliminare anche i dati persistenti.

Il flusso è semplice: leggi l'elenco, accettalo o restringilo e rimuovi il pacchetto quando non ti serve più. Il resto del corso insegna a interpretare quell'elenco, perché il nome di un permesso non descrive sempre tutto ciò che apre.
