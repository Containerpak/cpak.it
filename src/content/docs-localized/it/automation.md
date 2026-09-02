---
title: Automazione e servizi
description: Utilizza l'output JSON, gli aggiornamenti non interattivi, l'orchestrazione e il ciclo di vita del servizio esplicito negli script.
tags: [automation, services, ci]
section: operations
order: 50
---

# Automazione e servizi

I comandi cpak restituiscono uno stato di uscita non riuscito quando l'operazione richiesta non riesce. Gli script dovrebbero prima controllare lo stato di uscita e utilizzare l'output JSON laddove un comando lo fornisce.

## Stato leggibile dalla macchina

```bash
cpak doctor --json
cpak list --json
cpak update --json
cpak gc --json
cpak alias list --json
```

Utilizza l'uscita JSON per controlli di stato e automazione. Le tabelle umane sono output di presentazione.

## Aggiornamenti automatici

```bash
cpak update --non-interactive --json
```

Il comando rifiuta qualsiasi aggiornamento che richieda permessi aggiuntivi. Esce con un errore quando uno o più aggiornamenti del pacchetto falliscono o vengono negati, mentre i risultati indipendenti riusciti rimangono visibili nell'output.

## Esegui diverse applicazioni

`cpak orchestrate` avvia più applicazioni installate e può esprimere dipendenze di avvio:

```bash
cpak orchestrate \
  --depends-on frontend=backend \
  --delay 2 \
  --retries 2 \
  backend frontend
```

Aggiungi `--health` quando ciascuna applicazione avviata può rispondere a un comando di integrità. Utilizzare `--ignore-errors` solo quando è possibile avviare in sicurezza le applicazioni successive dopo un errore precedente.

## Ciclo di vita del servizio

`cpak service enable` registra un comando applicativo, lo avvia e installa il migliore adattatore di boot disponibile:

```bash
cpak service enable api github.com/example/app \
  --service server \
  --restart on-failure \
  --health "/usr/bin/example health"
```

Il service manager di cpak non richiede systemd o D-Bus. Usa servizi systemd utente, cron o XDG autostart in base alle capacità dell'host e segnala quando il ripristino è disponibile soltanto dopo il login. Leggi [Servizi applicativi persistenti](/docs/services) per boot, dipendenze, file environment, secret e comandi del ciclo di vita.

Usa i comandi di stato runtime negli script:

```bash
cpak ps --json
cpak status github.com/example/app --instance api --json
cpak inspect github.com/example/app --instance api
cpak health github.com/example/app --instance api --json
```

`cpak health` restituisce uno stato di errore quando il runtime selezionato è fermo, non integro o ancora in avvio.

## Log e istanze

Le istanze denominate consentono all'automazione di separare avvii ripetuti dello stesso pacchetto:

```bash
cpak run --instance worker-a github.com/example/worker worker
cpak logs --instance worker-a --follow github.com/example/worker
cpak stop --instance worker-a github.com/example/worker
```

Acquisisci lo stato di uscita del comando e registra un'esecuzione non riuscita. cpak propaga il risultato del processo figlio per i comandi che attendono l'applicazione.

## Controlli CI del pacchetto

Utilizza `cpak validate`, `cpak lock` e `cpak test` nel pacchetto CI dopo la pubblicazione dell'image OCI. Includi un test dell'image pubblicata tramite cpak.

Mantieni le build dell'image di produzione in CI. I comandi di sviluppo locale riguardano la convalida del pacchetto e il test visivo. Il flusso di lavoro di pubblicazione firma e produce ogni architettura supportata.
