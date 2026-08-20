---
title: Integrazione del sistema
description: Connetti le applicazioni a display, audio, notifiche, URI, applicazioni host e servizi host digitati.
tags: [desktop, broker, actions]
section: runtime
order: 30
---
# Integrazione del sistema

manifest controlla display, audio, dispositivi, servizi desktop e operazioni broker disponibili per un'applicazione.

## Visualizzazione e input

I pacchetti Wayland ricevono lo Wayland socket attivo quando `socketWayland` è abilitato. I pacchetti X11 ricevono `/tmp/.X11-unix` quando `socketX11` è abilitato. Il rendering GPU normalmente richiede anche `deviceDri`.

Lo runtime è dotato dell'ambiente di visualizzazione necessario per indirizzare il socket montato. Testa entrambi i percorsi di visualizzazione quando un pacchetto li pubblicizza entrambi.

## Audio e accessibilità

`socketPulseAudio` espone lo PulseAudio compatibile con socket utilizzato dalle sessioni desktop PulseAudio e PipeWire. I dispositivi ALSA diretti richiedono `deviceAlsa`.

I client di accessibilità utilizzano `socketAtSpiBus`. La stampa utilizza `socketCups`. I socket dell'agente per SSH e GPG sono grant separate perché possono autorizzare azioni come utente.

## Notifiche

Imposta il permesso broker in `cpak.json`:

```json
"notification": true
```

cpak monta il comando di compatibilità delle notifiche nel pacchetto. Una richiesta raggiunge il sistema locale broker, che verifica l'istanza del pacchetto e la policy prima di inviare la notifica sul desktop.

broker possiede l'interazione del bus di sessione per questa operazione.

## URI esterni

Abilita l'URI broker quando i collegamenti devono essere aperti in un'applicazione host:

```json
"openURI": true
```

cpak fornisce comandi `xdg-open` e `gio open` compatibili. Le applicazioni che chiamano GIO risolvono direttamente un gestore URI privato all'interno del pacchetto. Il gestore raggiunge broker tramite l'interfaccia GIO esistente e broker chiede al desktop host di aprire l'URI con la sua applicazione predefinita corrente.

I collegamenti HTTP, HTTPS e di posta utilizzano questo percorso automaticamente. broker rifiuta percorsi di file, URI `file:`, schemi di script e schemi in uscita personalizzati. Mantieni la convalida lato applicazione per gli URI controllati dall'utente.

## Applicazioni predefinite e callback URI

Una voce desktop esportata mantiene i tipi MIME e gli schemi URI dichiarati. cpak esporta anche un ID di compatibilità nascosto quando l'ID desktop originale è libero sull'host. Ciò consente a un browser in pacchetto, un client di posta o un altro gestore di diventare l'impostazione predefinita del desktop mentre il launcher visibile mantiene il suo ID cpak a prova di collisione.

La proprietà della voce di compatibilità è limitata all'identità del pacchetto che l'ha creata. Le voci create dall'utente e quelle del desktop di sistema rimangono indipendenti. La rimozione del pacchetto rimuove le voci di sua proprietà.

I callback URI seguono il percorso opposto. Il desktop host avvia la voce esportata con `%u` o `%U` e cpak inoltra l'URI al comando dell'applicazione dichiarata. I callback di loopback, come una risposta OAuth su `127.0.0.1`, utilizzano lo spazio dei nomi di rete del pacchetto selezionato dal relativo manifest.

## Selettori di file nativi

`filePicker` consente a un'applicazione di richiedere file, cartelle e salvare destinazioni senza un montaggio home permanente. Le chiamate GTK e GIO utilizzano un adattatore bus desktop limitato che gestisce il protocollo di selezione file anche quando `socketSessionBus` è disabilitato. Il proxy rifiuta destinazioni bus non correlate a meno che manifest non conceda il bus di sessione completo.

host presenta il selettore e cpak allega l'oggetto accettato allo spazio dei nomi del pacchetto. Le conferme dell'ambito e della durata utilizzano il backend della finestra di dialogo desktop configurato. Vedere [Accesso alla selezione file](/docs/file-access) per la politica del pacchetto e [Adattatori di dialogo desktop](/docs/desktop-dialogs) per la configurazione della distribuzione.

## Applicazioni host

I cpak desktop possono elencare le applicazioni installate dall'host e avviare una voce selezionata tramite broker:

```json
"hostApplications": true
```

cpak crea un catalogo privato da voci desktop attendibili e fornisce al pacchetto identificatori di applicazione opachi. Le richieste di avvio risolvono tali identificatori rispetto al catalogo e possono prendere di mira la visualizzazione nidificata di un desktop cpak.

## Servizi hostdigitati

Utilizzare `hostActions` per i servizi dell'host supportati, esposti come capacità del broker. Ogni provider pubblica un set di capacità fisse. Vedere [Azioni host](/docs/host-actions) per il provider containers e i relativi shim di compatibilità.

Durante la migrazione v1, `allowedHostCommands` mappa la vecchia notifica, l'URI e gli shim dell'applicazione host suli permessi digitate. Manifest v2 rifiuta i nomi degli eseguibili in questo campo.

## Voci e icone del desktop

Dichiara ogni voce del desktop che dovrebbe apparire sull'host. La voce e le icone di riferimento devono esistere nell'image OCI finale. cpak esporta un launcher rivolto verso host che rientra nel pacchetto tramite la sua origine installata.

Un aggiornamento aggiorna i metadati esportati anche quando il pacchetto è aggiornato o il digest dell'image OCI non è cambiato. Ciò ripara i launcher mancanti e mantiene manifest e le modifiche del desktop sincronizzate con il record del pacchetto installato.

## Rilevamento del tempo di esecuzione

cpak imposta `CPAK_CONTAINER_ID` su un identificatore opaco per l'istanza runtime attiva. Le applicazioni possono testarne la presenza per selezionare il comportamento di storage e integrazione cpak. Il valore può cambiare tra le istanze e non deve essere analizzato o salvato come identificatore del pacchetto.