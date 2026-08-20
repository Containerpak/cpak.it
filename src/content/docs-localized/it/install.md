---
title: Installa cpak
description: Installa il comando v2, controlla host e scopri dove cpak conserva i suoi dati.
tags: [install, host]
section: start
order: 10
---
# Installa cpak

cpak è distribuito come due binari Go statici ed estrae il contenuto OCI tramite l'API di distribuzione. Il comando `cpak` possiede il ciclo di vita del pacchetto e dell'applicazione. `cpak-storaged` prepara e verifica i checkout dei layer nativi durante l'installazione, l'aggiornamento o la manutenzione, quindi esce. Un'applicazione preparata inizia direttamente dal suo indice runtime.

## Scarica il file binario

Apri l'[ultima versione di cpak](https://github.com/Containerpak/cpak/releases/latest) e scarica `cpak-linux-amd64` più `cpak-storaged-linux-amd64` su x86-64 o le due risorse `arm64` corrispondenti su ARM64. Scarica `SHA256SUMS` dalla stessa versione, quindi verifica e installa entrambi i file binari sul tuo utente `PATH`:

```bash
sha256sum -c --ignore-missing SHA256SUMS
install -Dm755 cpak-linux-amd64 "$HOME/.local/bin/cpak"
install -Dm755 cpak-storaged-linux-amd64 "$HOME/.local/bin/cpak-storaged"
cpak --help
```

Sostituisci entrambi i nomi delle risorse `amd64` con le rispettive varianti `arm64` su ARM64.

Mantieni entrambi i file binari nella stessa directory. cpak rileva il proprio servizio di storage accanto al comando attivo prima di controllare l'utente `PATH`. L'installazione a layer di sistema è facoltativa. Il programma di installazione grafico e `cpak self-update` sostituiscono entrambi i file insieme e preparano la memorizzazione dell'applicazione esistente prima della restituzione.

## Installa un'applicazione dallo Store

Ogni pagina dell'applicazione nello [cpak Store](/store) fornisce un programma di installazione grafico firmato, il comando terminale equivalente e un URL del programma di installazione diretto. Il file scaricato installa cpak, il relativo servizio di storage corrispondente e l'applicazione selezionata.

I browser normalmente salvano i file scaricati senza il bit eseguibile. Abilita l'esecuzione nelle proprietà del file o esegui:

```bash
chmod +x Application-amd64.cpak-installer
./Application-amd64.cpak-installer
```

Aprendolo da una sessione desktop mostra i dettagli dell'applicazione, i permessi richiesti, l'avanzamento e il risultato finale. Avviarlo da un terminale utilizza un prompt di testo equivalente. Leggi il [programma di installazione cpak](/docs/cpak-installer) per i dettagli di verifica, l'ispezione dei metadati, i collegamenti diretti e l'integrazione degli sviluppatori.

## Controllare host

Eseguire il controllo della funzionalità host prima di installare un'applicazione:

```bash
cpak doctor
cpak doctor --json
```

Il rapporto riguarda gli spazi dei nomi utente, i controller rootless OverlayFS, `mount_setattr`, seccomp, Landlock, i controller delegati cgroup v2, l'accesso audio e display e il bridge di comando controlsull'host. Un avviso spiega la mancanza di un layer di rafforzamento opzionale o di un controller delle risorse. Una funzionalità richiesta non riuscita impedisce l'avvio del percorso runtime interessato.

> [!NOTA] Supporto host
> Landlock e i cgroup delegati dipendono dal kernel e dal gestore delle sessioni. `cpak doctor` segnala se ciascuna funzione è attiva.

## Posizioni dei dati

cpak segue la convenzione della directory di base XDG. Il suo archivio locale contiene record di pacchetti, layer OCI indirizzati al contenuto, stato dell'applicazione scrivibile, voci desktop esportate, registri e override utente.

Imposta la variabile di ambiente XDG corrispondente prima di eseguire cpak se hai bisogno di una posizione non predefinita. Mantieni insieme il database e le directory dei layer quando sposti un Store. I riferimenti registrati nel database vengono utilizzati da audit, garbage collection e rollback.

## Integrazione desktop

I pacchetti possono esportare file binari e file `.desktop` dichiarati dal loro manifest. cpak scrive le voci rivolte all'utente sotto la directory dei dati utente standard, in modo che i launcher possano rilevarle senza un'installazione root.

Esegui un'applicazione installata dalla voce del desktop o con `cpak run`. Entrambi i percorsi utilizzano lo stesso stato del pacchetto, permessi e componenti aggiuntivi abilitati.

## Aggiorna cpak

Controlla e installa una versione cpak più recente:

```bash
cpak self-update --check
cpak self-update
cpak doctor
cpak audit
```

Su un desktop, cpak esegue il controllo una volta al giorno mentre viene eseguito un altro comando. GNOME utilizza Zenity quando è installato, KDE utilizza KDialog e altre sessioni utilizzano la finestra di dialogo cpak incorporata. Entrambi gli asset runtime vengono scaricati dalla versione ufficiale, confrontati con `SHA256SUMS`, scritti accanto ai file binari attuali e installati con rinominazioni atomiche. Le applicazioni già in esecuzione continuano a utilizzare i processi esistenti.

Il primo aggiornamento che introduce un layout di storage più recente prepara i layer installati prima dell'avvio dell'applicazione successiva. L'operazione è atomica e ripristinabile. Gli avvii sul desktop mostrano una finestra di dialogo di avanzamento quando la preparazione richiede più di 400 millisecondi; gli avvii del terminale segnalano i progressi nel terminale.

Un pacchetto di distribuzione può disabilitare la override binaria in fase di compilazione. cpak segnala comunque che esiste una versione più recente e dice all'utente di richiederla al manutentore del pacchetto. Leggi gli [aggiornamenti cpak runtime](/docs/runtime-updates) per la configurazione del packager e la selezione del backend desktop.

## Rimuovere cpak

I dati dell'applicazione rimangono nello Store locale dopo aver rimosso i file binari runtime. Rimuovi i pacchetti indesiderati ed esegui la garbage collection prima di eliminare lo store. L'eliminazione dell'archivio elimina ogni pacchetto installato e il relativo stato scrivibile.

```bash
cpak list
cpak remove github.com/containerpak/example
cpak gc --apply
```
