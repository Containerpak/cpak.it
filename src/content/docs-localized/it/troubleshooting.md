---
title: Risoluzione dei problemi
description: Diagnostica il supporto host, l'avvio del pacchetto, i permessi, i servizi nidificati, le voci del desktop e lo stato del Store.
tags: [debugging, logs, recovery]
section: operations
order: 40
---
# Risoluzione dei problemi

Inizia con il layer più stretto che può spiegare il fallimento. Conserva il comando completo, l'origine del pacchetto, il riferimento selezionato, la build cpak e il report sulle funzionalità host con qualsiasi segnalazione di bug.

## Eseguire il controll'host

```bash
cpak doctor
cpak doctor --json
```

Uno spazio dei nomi obbligatorio o un errore OverlayFS blocca l'avvio dell'applicazione. Gli avvisi Landlock e cgroup descrivono la protezione o i limiti che l'host corrente non può applicare.

## Leggere i registri dell'applicazione

```bash
cpak logs github.com/example/app
cpak logs --lines 300 github.com/example/app
cpak logs --follow github.com/example/app
```

Utilizza `--instance` quando il pacchetto ha più di un'istanza in esecuzione. Gli errori delle dipendenze nidificate possono avere un'origine e un flusso di log propri.

## Apri la shell di un pacchetto

```bash
cpak shell github.com/example/app
```

Verifica che esistano file binari dichiarati, file desktop, librerie e percorsi montati. Confronta l'ambiente del pacchetto con il set di permessi `cpak.json` prima di aggiungere ulteriore accesso.

## Riprodurre un pacchetto locale

All'interno di un repository di pacchetti:

```bash
cpak validate cpak.json
cpak lock cpak.json
cpak test cpak.json --binary /usr/bin/example -- --version
cpak dev cpak.json --binary /usr/bin/example
```

Questi comandi utilizzano un Store temporaneo e isolano il debug dei pacchetti dalle applicazioni installate.

## Verifica permessi

Sintomi come una finestra mancante, audio silenzioso, file inaccessibili, browser sandbox non riuscito o collegamento esterno bloccato di solito vengono associati a un permesso concreto. Esamina socket di visualizzazione, audio, DRI, percorsi di filesystem, campi `userNamespaces` e broker.

Non abilitare il bus di sessione, il bus di sistema, tutti i dispositivi o il root dell'host come correzione generica. Conferma la risorsa a cui l'applicazione ha tentato di accedere.

## Ripara lo stato dello Store

```bash
cpak audit
cpak audit --repair
cpak gc --json
```

Il controllo ripara i record dei pacchetti attivi. La Garbage Collection rimuove il contenuto senza riferimenti dopo che il grafico del record è coerente.

## La voce del desktop non viene visualizzata

Conferma che il percorso manifest è assoluto, termina con `.desktop` ed esiste nell'image finale. Il suo target `Exec` deve essere un binario dichiarato o disponibile. Reinstallare o aggiornare il pacchetto dopo aver modificato solo i metadati manifest in modo che cpak aggiorni la voce esportata.

## Un'applicazione si rifiuta di avviarsi dopo l'avvio verificato

Esegui `cpak system explain <origin>`: mette ciò che contiene il libro mastro accanto a cosa
deriva l'avvio, che è la differenza tra un'applicazione nessuno
iscritto e uno il cui Store non detiene più ciò che ha registrato.

Una domanda mai iscritta viene rifiutata solo a `refuse`. Aggiornalo,
oppure eseguire `cpak audit --backfill-bindings` per un'installazione effettuata prima della verifica
l'avvio esisteva.

Un Store che si contraddice viene rifiutato a tutti i layer, compreso `off`, e
questo è intenzionale: non è un'incognita, è un disaccordo interno al Store.
`cpak update <origin>` registra nuovamente l'applicazione da quanto registrato nel registro
serve.

La modifica dei permessi con `cpak override` o l'attivazione di un componente aggiuntivo modifica ciò che a
deriva l'avvio, quindi cpak registra nuovamente l'applicazione come parte della stessa
comando. Un insieme di permessi più ristretto viene registrato senza richiesta. Se ne chiede uno più ampio
per una password di amministratore, una volta, e rifiutandola si esce dall'applicazione
aggiornato ma non registrato.

## Una sessione di accesso non viene visualizzata nel display manager

Esegui prima `cpak system status`: su un host con uno `/usr/local` di sola lettura l'integrazione viene installata con un altro prefisso e la directory della sessione si sposta con essa. `cpak system setup` stampa ciò che non è stato possibile configurare, quindi leggi il suo output. SDDM e LightDM sono configurati tramite i propri file e funzionano con qualsiasi init. GDM e greetd leggono la directory dal proprio ambiente di servizio, che cpak imposta automaticamente solo in systemd e OpenRC; sotto runit, s6, dinit e sysvinit il setup riporta la directory da aggiungere e a quale servizio. Un messaggio di benvenuto che imposta `XDG_DATA_DIRS` deve elencare anche la directory, perché vince il suo valore.

## Un'applicazione cpak non viene usata come predefinita

Controlla entrambi i risolutori desktop:

```bash
xdg-mime query default x-scheme-handler/https
gio mime x-scheme-handler/https
```

Il risultato potrebbe essere l'ID del desktop originale nascosto o l'ID visibile con prefisso cpak. Esegui `cpak update` per il pacchetto quando l'ID originale configurato non esiste più. L'aggiornamento aggiorna entrambe le voci senza modificare i dati dell'applicazione.

## Un link si apre nel pacchetto sbagliato

Il pacchetto richiede `openURI`. cpak fornisce `xdg-open`, `gio open` e un gestore GIO privato per collegamenti esterni comuni. Controllare il registro dell'applicazione per un tentativo di avvio nidificato. Questo messaggio significa che un vecchio runtime ha risolto una voce desktop host all'interno del pacchetto invece di utilizzare l'URI broker. Aggiorna cpak, arresta l'istanza del pacchetto e riavviala in modo che la policy runtime venga ricostruita.

## Un aggiornamento è stato rifiutato

Esamina il risultato dell'aggiornamento strutturato:

```bash
cpak update --json github.com/example/app
```

`permission-denied` significa che il nuovo pacchetto ha richiesto un accesso aggiuntivo in un flusso non interattivo oppure l'utente lo ha rifiutato. `pinned` significa che commit installato è intenzionalmente immutabile.

## Segnalare un problema riproducibile

Includere:

- l'uscita di `cpak doctor --json`
- il comando esatto e lo stato di uscita
- origine del pacchetto e ramo, versione o commit selezionati
- l'estratto `cpak logs` pertinente
- la sequenza più piccola che riproduce il guasto

Nascondi credenziali, nomi di directory home e valori di ambiente non correlati. Utilizzare recinzioni di codice per registri lunghi.