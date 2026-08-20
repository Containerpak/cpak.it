---
title: Sessioni desktop e kiosk
description: Prepara un desktop Wayland completo o una sessione di accesso mirata con cpak.
tags: [desktop, kiosk, sessions]
section: packages
order: 45
---
# Sessioni desktop e kiosk

Un pacchetto può dichiarare una sessione di accesso accanto ai punti di ingresso dell'applicazione. Gli avvii in finestra e con accesso utilizzano la stessa versione installata, stato scrivibile, profilo utente e canale di aggiornamento.

## Manifest

Dichiara un punto di ingresso esportato e un set di permessi separato:

```json
"sessions": [
  {
    "id": "com.example.desktop",
    "name": "Example Desktop",
    "description": "Example desktop session",
    "kind": "desktop",
    "entrypoint": "/usr/bin/example-session",
    "override": {
      "deviceDri": true,
      "deviceInput": true,
      "hostApplications": true,
      "filesystem": [
        { "path": "xdg-documents", "access": "read-write" },
        { "path": "xdg-download", "access": "read-write" }
      ]
    }
  }
]
```

`kind` accetta `desktop` e `kiosk`. L'identificatore è globale e non può sostituire una sessione di sistema o una sessione di proprietà di un altro pacchetto. Il punto di ingresso deve apparire anche in `binaries`.

## Autorità di sistema

Installare l'autorità di sistema una volta:

```bash
cpak system setup
cpak system status
```

La configurazione installa un launcher fisso di proprietà root, criteri di attivazione D-Bus e azioni Polkit. Le sessioni del pacchetto vengono registrate separatamente.

Su un host il cui `/usr/local` è di sola lettura, che è la forma normale di una distribuzione basata su image, cpak si installa con il primo prefisso che accetta una scrittura privilegiata: `/usr/local`, quindi `/opt/cpak`, quindi `/var/lib/cpak`. Il resto dell'integrazione segue il prefisso scelto. La policy del bus dichiara la directory del servizio riposizionata in modo che l'attivazione venga comunque risolta e l'azione Polkit viene scritta su `/etc/polkit-1/actions`, una delle directory scansionate da polkitd. `cpak system status` segnala l'installazione ovunque sia atterrata.

## Trasporti

L'autorità risponde sul bus di sistema e su Unix socket a `/run/cpak/authority.sock`. Il bus viene utilizzato ogni volta che esiste, perché è ciò che porta un'permesso interattiva Polkit. socket esiste per gli host che non eseguono bus di sistema. Identifica il chiamante dalle credenziali che il kernel allega alla connessione piuttosto che dal nome di un bus e accetta modifiche alla sessione solo da root, poiché una richiesta non privilegiata non ha modo di essere autorizzata senza Polkit.

Non esegui mai l'intero comando come amministratore e cpak lo rifiuta se ci provi: l'archivio pacchetti appartiene al tuo utente e root cercherà il pacchetto al suo interno. Eseguilo come te stesso:

```bash
cpak session enable github.com/example/desktop com.example.desktop
```

Quando nessun trasporto può trasportare la richiesta, che è la situazione normale su un server senza bus, cpak intensifica l'unico passaggio che richiede privilegi e lascia il resto in esecuzione come te. Utilizza ciò che effettivamente fornisce host: `pkexec` o `run0` in una sessione grafica, `sudo` o `doas` su un terminale. Se host non ne ha nessuno, cpak lo dice invece di indovinare e il passaggio può essere eseguito direttamente come root.

## Registra una sessione

```bash
cpak session list github.com/example/desktop
cpak session enable github.com/example/desktop com.example.desktop
```

cpak mostra i permessi di sessione prima della registrazione. Polkit chiede quindi il permesso. Il servizio privilegiato accetta metadati convalidati e l'origine del pacchetto. La voce del display manager generata richiama il launcher fisso cpak con l'identificatore di sessione registrato.

Rimuovi una sessione con:

```bash
cpak session disable com.example.desktop
```

La rimozione dell'ultima versione del pacchetto installato che fornisce tale identificatore ne annulla anche la registrazione. `cpak system remove` rimuove le sessioni cpak registrate prima di eliminare il permesso del sistema.

## Supporto gestione visualizzazione

cpak memorizza le voci di accesso con il prefisso in cui è installato, che è `/usr/local/share/wayland-sessions` su un normale host e si sposta con il prefisso su uno di sola lettura. `cpak system setup` punta quindi i display manager installati in quella directory.

| Gestore visualizzazione | Stato |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SDDM | Configurato automaticamente. Il percorso di ricerca generato mantiene le directory di sessione standard, quindi le sessioni fornite dalla distribuzione rimangono elencate accanto a quelle cpak.                         |
| LightDM | Configurato automaticamente. Le directory di sessione del sistema esistente, X11 e Wayland rimangono disponibili.                                                                                            |
| GDM | Un'installazione standard non ha bisogno di nulla: GDM legge le directory dei dati di sistema XDG. Una directory riposizionata viene pubblicata tramite l'ambiente del servizio, poiché GDM non dispone di impostazioni di directory di sessione. |
| greetd | greetd non ha un proprio concetto di sessione, quindi l'addetto al saluto enumera le sessioni. cpak pubblica la directory tramite l'ambiente del servizio come avviene per GDM.                           |

Il percorso basato sull'ambiente viene applicato automaticamente sotto systemd, tramite un drop-in che ordina per ultimo e conserva il valore di un altro drop-in già impostato, e sotto OpenRC, tramite un blocco contrassegnato nel file di configurazione del servizio. In runit, s6, dinit e sysvinit gli script di servizio pacchettizzati non leggono alcun file di ambiente, quindi scriverne uno produrrebbe un file che non verrà caricato. Lì `cpak system setup` segnala la directory da aggiungere e a quale servizio e lascia stare host.

Un messaggio di benvenuto che imposta `XDG_DATA_DIRS` sovrascrive ciò che fornisce l'ambiente del servizio, quindi la directory deve essere elencata anche nel messaggio di benvenuto. I saluti con un'opzione di sessione esplicita la accettano direttamente:

```bash
tuigreet --sessions /usr/local/share/wayland-sessions:/usr/share/wayland-sessions
```
