---
title: Permessi
description: Dichiara il minimo accesso all'host necessario a un'applicazione e comprendi gli override dell'utente.
tags: [manifest, security, permissions]
section: packages
order: 30
---

# Permessi

L'oggetto `override` in `cpak.json` definisce i permessi predefiniti del pacchetto. Ha lo stesso formato degli override locali dell'utente. Ogni campo corrisponde a una precisa azione del runtime.

Un permesso che il manifest non dichiara non viene concesso. Non esistono campi attivi per impostazione predefinita: display, bus di sessione, audio, GPU e rete devono essere richiesti per nome. `cpak init` scrive ogni campo in modo esplicito. Questo rende chiaro sia ciò che serve al pacchetto sia ciò che non gli viene concesso.

## Socket del desktop

| Campo              | Accesso                                  |
| ------------------ | ---------------------------------------- |
| `socketWayland`    | Socket del display Wayland attivo.       |
| `socketPulseAudio` | Socket audio compatibile con PulseAudio. |
| `socketCups`       | Socket di stampa CUPS.                   |
| `socketSshAgent`   | Socket dell'agente SSH dell'utente.      |
| `socketGpgAgent`   | Socket dell'agente GPG dell'utente.      |

Usa il system broker per notifiche e URI esterni. Ogni permesso espone al pacchetto una sola operazione.

## Dispositivi

`deviceDri` concede l'accesso ai dispositivi grafici sotto `/dev/dri`. Gli altri booleani riguardano KVM, memoria condivisa, ALSA, acquisizione video, FUSE, TUN/TAP e USB. `deviceAll` espone tutti i dispositivi dell'host e va riservato ai pacchetti che non possono funzionare con permessi più stretti.

`deviceSerial` copre `/dev/ttyUSB*` e `/dev/ttyACM*`, usati da schede, stampanti, radio e strumenti di misura. Usalo al posto di `deviceAll` quando basta una porta seriale. I glob dei dispositivi vengono risolti durante la creazione del container: una porta collegata dopo l'avvio non sarà visibile al processo già in esecuzione.

Quando il passthrough della GPU è attivo, le librerie userspace NVIDIA vengono risolte dall'host al lancio. L'image del pacchetto usa lo stack driver risultante.

## Filesystem

Il manifest v3 usa voci strutturate per il filesystem:

```json
"filesystem": [
  { "path": "home", "access": "read-write" },
  { "path": "/mnt/projects", "access": "read-only" }
]
```

L'ambito portabile `home` punta alla directory home dell'utente. `host` punta alla root dell'host. Un path assoluto seleziona una posizione specifica. L'accesso deve essere `read-only` o `read-write`.

I campi legacy `fsHost`, `fsHostHome`, `fsHostEtc` e `fsExtra` vengono rifiutati dallo schema v3 rigoroso.

## Bus di sessione

`sessionBus` concede chiamate esatte sul bus di sessione desktop. Ogni voce `talk` indica destinazione, percorso dell'oggetto, interfaccia e metodi. L'elenco opzionale `own` indica i nomi noti che il pacchetto può acquisire. Manifest v3 non espone socket grezzi per X11, bus di sessione, bus di sistema, AT-SPI o Bluetooth.

## File scelti dall'utente

`filePicker` consente richieste native di apertura, selezione cartella e salvataggio senza montare la home dell'host. L'accesso a un file specifico è in sola lettura. Il pacchetto può offrire anche la cartella che contiene il file come scelta esplicita e può rendere i grant persistenti tra gli avvii. Consulta [Accesso dal selettore file](/docs/file-access) per campi di policy, path del runtime e comandi di revoca.

## Rete e processi

`network` controlla la rete nel namespace del pacchetto. `process` condivide il namespace dei processi dell'host e deve rimanere falso salvo quando l'applicazione deve ispezionare i processi dell'host.

`userNamespaces` consente all'applicazione di creare un ulteriore namespace utente. Browser e strumenti con un sandbox proprio ne hanno spesso bisogno. Se resta falso, i namespace utente annidati vengono bloccati nel pacchetto.

## Limiti delle risorse

| Campo         | Unità                  | Zero significa          |
| ------------- | ---------------------- | ----------------------- |
| `memoryMaxMB` | MiB                    | nessun limite richiesto |
| `cpuQuota`    | percentuale di una CPU | nessun limite richiesto |
| `pidsMax`     | numero di processi     | nessun limite richiesto |

I limiti usano controller cgroup v2 delegati. Se l'host non può applicare un limite richiesto, il lancio fallisce.

## Operazioni di sistema

Imposta `notification` per esporre lo shim delle notifiche e `openURI` per consentire l'apertura di URI esterni sull'host. `openURI` copre `xdg-open`, `gio open` e le richieste dirette al gestore GIO predefinito. Entrambe le operazioni passano dal system broker con richieste tipizzate.

Imposta `hostApplications` quando un desktop environment deve usare il catalogo delle applicazioni dell'host. Le richieste di avvio usano identificatori opachi e il broker seleziona la desktop entry affidabile.

`hostActions` concede capacità di un provider integrato. Il provider `containers` offre `read`, `manage-owned` ed `exec-owned`. Durante un aggiornamento, un nuovo provider o una nuova capacità è trattata come un'aggiunta di permessi. Consulta [Host actions](/docs/host-actions) per il confine esatto.

## Ambiente

L'array `env` accetta voci `NAME=value`. Usalo per valori predefiniti stabili del pacchetto, non per segreti dell'utente. I segreti devono passare dal meccanismo supportato dall'applicazione o da un mount controllato dall'utente.

## Override locali

L'utente può sostituire una chiave di permesso per un'applicazione installata:

```bash
cpak override github.com/example/app --key network --value false
cpak override github.com/example/app --key filesystem --value '[{"path":"home","access":"read-only"}]'
cpak override github.com/example/app --key filePicker --value '{"openFile":true}'
```

Gli override sono salvati per versione dell'applicazione. Riesaminali dopo un cambiamento importante del pacchetto. `cpak update` mostra le aggiunte di permessi prima di registrare la nuova versione.

Un override locale sostituisce i valori predefiniti del manifest e può rimuovere oppure aggiungere accessi. Su una macchina gestita, il ceiling di sistema viene applicato in seguito e nessun override utente può superare il massimo scelto dall'amministratore. Consulta [Distribuzione gestita](/docs/managed-deployment).

> [!WARNING] Accesso ampio
> `deviceAll`, `process`, `asRoot`, regole ampie per il bus di sessione e l'accesso `host` al filesystem attraversano ampie parti del confine del sandbox. Documenta perché il pacchetto ne ha bisogno.
