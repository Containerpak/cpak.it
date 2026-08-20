---
title: Dipendenze e componenti aggiuntivi
description: Collega i pacchetti richiesti e i componenti aggiuntivi opzionali per applicazione.
tags: [dependencies, addons, composition]
section: packages
order: 50
---
# Dipendenze e componenti aggiuntivi

Uno cpak può richiedere un altro pacchetto o offrirlo come componente aggiuntivo opzionale. Entrambi mantengono
il componente nel proprio repository e nell'image OCI, ma hanno caratteristiche diverse
contratti del ciclo di vita e runtime.

## Dipendenze richieste

Le dipendenze vengono installate con il genitore. La modalità predefinita è `nested`, che
mantiene la dipendenza nel proprio sandbox e consente al genitore di invocare solo il file
binari esportati da quel pacchetto.

```json
"dependencies": [
  {
    "origin": "github.com/containerpak/umu"
  }
]
```

Il processo nidificato riceve l'intersezione del genitore e della dipendenza
permessi. Non può acquisire l'accesso host che il genitore non ha.

È richiesta anche una dipendenza con `"mode": "layer"`, ma i suoi layer di filesystem
sono invece composti sotto l'image principale. Utilizzare questa modalità quando il genitore deve
vedere i file delle dipendenze direttamente nel proprio runtime.

Una dipendenza può selezionare un ramo, una versione o commit. `cpak lock` risolve il
grafico completo e registra riassunti di image immutabili.

### Bottiglie e UMU

Bottles dichiara UMU come dipendenza annidata. L'integrazione dell'UMU ha bisogno dell'UMU
launcher, quindi cpak lo installa con Bottles ed espone il suo comando dichiarato
tramite il pacchetto nidificato broker.

Non cambia nulla per gli utenti di Bottles quando vengono introdotti componenti aggiuntivi opzionali altrove.
L'UMU rimane obbligatoria, si avvia nel proprio ambiente cpak e segue il
contratto di permesso condiviso con Bottles.

## Componenti aggiuntivi opzionali

Un componente aggiuntivo fornisce layer a un genitore supportato. Il genitore rimane utilizzabile
senza di esso.

```json
"addons": [
  "github.com/containerpak/sdk-go",
  "github.com/containerpak/sdk-node-lts"
]
```

Un componente aggiuntivo senza metadati provider utilizza una scelta esplicita di abilitazione o disabilitazione.
Un componente aggiuntivo provider è disponibile non appena viene installato e gli elenchi principali
la sua origine. L'avvio successivo compone le dipendenze del layer richiesto, il genitore,
e i fornitori attivi in ordine manifest.

La disabilitazione di un componente aggiuntivo rimuove i suoi layer dalla successiva vista runtime. Non è così
riscrivere l'image principale o copiare i file nella directory dei dati dell'applicazione.
Un componente aggiuntivo installato può servire più genitori mentre ognuno mantiene la propria selezione.

## Slot del provider

Uno provider indica a cpak quale funzionalità fornisce un componente aggiuntivo. I gruppi di slot
pacchetti che possono ricoprire lo stesso ruolo, mentre la modalità controlla quanti possono esserlo
attivo.

```json
"addon_provider": {
  "id": "jdk25",
  "slot": "sdk.java",
  "mode": "exclusive",
  "exports": {
    "path": ["/opt/jdk/bin"],
    "library_path": ["/opt/jdk/lib"],
    "include_path": ["/opt/jdk/include"],
    "pkg_config_path": ["/opt/jdk/lib/pkgconfig"],
    "cmake_prefix_path": ["/opt/jdk"],
    "environment": ["JAVA_HOME=/opt/jdk"]
  }
}
```

Uno slot `exclusive` attiva un provider. Il primo provider disponibile è il
predefinito finché l'utente non ne seleziona un altro. Uno slot `multiple` si attiva ogni
provider installato, che si adatta a raccolte come gli strumenti di compatibilità di Steam.
I provider in uno slot devono utilizzare la stessa modalità.

I percorsi di esportazione sono percorsi assoluti all'interno del pacchetto composto. cpak li antepone
a `PATH`, `LD_LIBRARY_PATH`, `LIBRARY_PATH`, `CPATH`, `PKG_CONFIG_PATH` e
`CMAKE_PREFIX_PATH` a seconda dei casi. Le voci sotto `environment` sono esplicite
Coppie `NAME=value` dopo la composizione del percorso.

## Gestione dei componenti aggiuntivi

Elenca i componenti aggiuntivi supportati da un pacchetto installato:

```bash
cpak addon list github.com/containerpak/vscode
cpak addon list --json github.com/containerpak/vscode
```

Ispeziona gli slot e i relativi provider installati:

```bash
cpak addon slots github.com/containerpak/vscode
cpak addon providers github.com/containerpak/vscode
cpak addon providers github.com/containerpak/vscode sdk.go
```

Scegli un provider per uno slot esclusivo in base all'ID o all'origine provider:

```bash
cpak addon use github.com/containerpak/vscode sdk.go tinygo
```

Abilita o disabilita un componente aggiuntivo per quel pacchetto:

```bash
cpak addon enable github.com/containerpak/vscode github.com/containerpak/sdk-go
cpak addon disable github.com/containerpak/vscode github.com/containerpak/sdk-go
```

Il pacchetto manifest registra le combinazioni supportate dal suo editore. Un utente
può ancora aggiungere deliberatamente un altro pacchetto, con la responsabilità di quello locale
combinazione:

```bash
cpak addon enable --anyway github.com/example/editor github.com/example/sdk
```

`addon list` segnala se ciascuna opzione è installata e abilitata. Abilitare un
il componente aggiuntivo lo installa quando necessario. Disabilitandolo si mantiene solo il pacchetto autonomo
quando un altro genitore lo usa ancora. cpak impedisce inoltre la rimozione mentre è abilitato
per un genitore installato.

I componenti aggiuntivi mantengono le proprie versioni e aggiornano il ciclo di vita. Diventa un componente aggiuntivo aggiornato
visibile al successivo avvio del genitore.

## Esempio di vapore

Steam supporta strumenti di prestazione e build di compatibilità come componenti aggiuntivi opzionali:

```json
"addons": [
  "github.com/containerpak/gamemode",
  "github.com/containerpak/gamescope",
  "github.com/containerpak/mangohud",
  "github.com/containerpak/proton-ge",
  "github.com/containerpak/protosoda"
]
```

Gli utenti possono abilitare solo gli strumenti che desiderano:

```bash
cpak addon enable github.com/containerpak/steam github.com/containerpak/mangohud
cpak addon enable github.com/containerpak/steam github.com/containerpak/protosoda
```

MangoHud, Gamescope e GameMode aggiungono comandi, librerie e metadati runtime
il filesystem Steam composto. Funzionano già con le opzioni di avvio Steam
utilizza:

```text
mangohud %command%
gamescope -- %command%
gamemoderun %command%
```

GE-Proton e ProtoSoda installano le directory degli strumenti di compatibilità nel file
filesystem composto. Steam li scopre attraverso
`STEAM_EXTRA_COMPAT_TOOLS_PATHS`, quindi le build abilitate appaiono nella sua compatibilità
selettore senza essere copiato nella directory dei dati di Steam.

### Passaggio dei componenti aggiuntivi nel recipiente a pressione

Steam avvia i giochi all'interno del container a pressione Valve, che sostituisce `/usr` con
selezionato Steam runtime. Il pacchetto Steam collega la radice composta cpak a
che ha annidato runtime:

```sh
export PATH="$CPAK_ROOTFS/usr/bin:$CPAK_ROOTFS/usr/games:$PATH"
export STEAM_EXTRA_COMPAT_TOOLS_PATHS="$CPAK_ROOTFS/usr/share/steam/compatibilitytools.d"
export VK_ADD_LAYER_PATH="$CPAK_ROOTFS/usr/share/vulkan/implicit_layer.d"
export PRESSURE_VESSEL_FILESYSTEMS_RO="$CPAK_ROOTFS/usr"
```

`CPAK_ROOTFS` identifica la radice composta attiva. La maggior parte delle applicazioni non sono necessarie
questo ponte. È necessario quando un genitore avvia un altro container o runtime
che nasconde i percorsi forniti dai suoi componenti aggiuntivi.

## Packaging di un componente aggiuntivo

Un componente aggiuntivo è un normale pacchetto cpak con la propria origine Git, manifest, image e
cronologia delle versioni. Gli elenchi principali hanno supportato le origini dei componenti aggiuntivi in `cpak.json`; il
il componente aggiuntivo possiede ogni file a cui contribuisce. Aggiungi `addon_provider` quando dovrebbe cpak
rileva automaticamente il pacchetto o espone percorsi runtime non standard.

Posiziona i file dove il genitore già si aspetta di trovarli. I comandi possono utilizzare
`/usr/bin`, le biblioteche possono utilizzare le directory delle librerie della piattaforma e i plugin possono
utilizzare un percorso specifico del genitore. Se il rilevamento richiede una variabile di ambiente, definisci
nel pacchetto genitore in modo che si risolva con `CPAK_ROOTFS` quando necessario.

Mantieni i percorsi dei componenti aggiuntivi separati ove possibile. I componenti aggiuntivi attivi seguono l'ordine nel file
genitore manifest e un layer successivo vince quando due pacchetti forniscono lo stesso percorso.

Utilizza la stessa famiglia di piattaforme gestita dell'elemento principale quando è adatta al pacchetto.
I layer OCI uguali vengono memorizzati una volta dal digest, quindi una base condivisa non ne aggiunge un altro
copiare nel Store locale.

Un componente aggiuntivo utilizza i permessi host effettive del genitore mentre è montato al suo interno
genitore. Le permessi nel componente aggiuntivo manifest si applicano quando il componente aggiuntivo viene eseguito da solo;
non possono espandere la politica principale.

Testare entrambi gli stati prima della pubblicazione:

```bash
cpak addon enable github.com/example/parent github.com/example/addon
cpak run github.com/example/parent parent-command
cpak addon disable github.com/example/parent github.com/example/addon
cpak run github.com/example/parent parent-command
```

Il test abilitato deve dimostrare che il genitore scopre i file forniti. Il
il test disabilitato deve dimostrare che il genitore si avvia ancora e l'addon è assente.

## Scelta della relazione

Utilizza una dipendenza nidificata per uno strumento richiesto che dovrebbe mantenere il proprio sandbox.
Utilizza una dipendenza del layer per i file richiesti che devono apparire all'interno del genitore
filesystem. Utilizzare un componente aggiuntivo quando il genitore lavora senza di esso e l'utente dovrebbe
controllare la selezione.