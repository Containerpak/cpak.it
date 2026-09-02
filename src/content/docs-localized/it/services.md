---
title: Servizi applicativi persistenti
description: Esegui un comando applicativo dichiarato in background, ripristinalo al login o al boot e controllane lo stato.
tags: [services, automation, observability, boot]
section: operations
order: 20
---

# Servizi applicativi persistenti

Un servizio cpak è un comando applicativo con nome gestito fuori dal terminale interattivo. cpak registra lo stato desiderato, avvia il pacchetto nella sua sandbox, applica una politica di riavvio e ripristina i servizi abilitati dopo il login o il boot.

Il service manager non richiede systemd o D-Bus. cpak installa il migliore adattatore disponibile in questo ordine:

1. un'unità systemd utente con lingering, se supportata dall'host;
2. una voce `@reboot` nel crontab utente;
3. un'unità systemd utente avviata dopo il login;
4. una voce XDG autostart.

Esegui `cpak service setup` per installare o controllare l'adattatore selezionato. Il comando segnala quando l'host può ripristinare i servizi soltanto dopo un login interattivo.

## Dichiarare un comando applicativo

Chi pubblica un pacchetto può assegnare un nome stabile a un comando in `cpak.json`:

```json
"binaries": ["/usr/bin/example"],
"services": {
  "server": {
    "binary": "/usr/bin/example",
    "arguments": ["serve", "--port", "3000"]
  }
}
```

Il binario del servizio deve comparire anche in `binaries`. Gli argomenti vengono passati come valori separati, senza interpretazione da parte di una shell.

Avvia direttamente il comando dichiarato quando non serve persistenza:

```bash
cpak run --service server github.com/example/app
```

## Abilitare un servizio

`cpak service enable` registra il servizio e lo avvia subito:

```bash
cpak service enable app-prod github.com/example/app \
  --service server \
  --restart on-failure \
  --health "/usr/bin/example health"
```

Il primo argomento è il nome locale del servizio. Il secondo è l'origine del pacchetto. Usa `--service` per un comando dichiarato dal manifest oppure inserisci il binario esportato e i suoi argomenti dopo l'origine:

```bash
cpak service enable app-prod github.com/example/app \
  /usr/bin/example serve --port 3000
```

Le politiche di riavvio sono `never`, `on-failure` e `always`. Il valore predefinito è `on-failure`. I controlli di integrità accettano ritardo, intervallo, tentativi e timeout tramite i flag `--health-*` corrispondenti.

Le dipendenze indicano altri nomi di servizio locali e possono essere ripetute:

```bash
cpak service enable web github.com/example/web \
  --service server \
  --depends-on database \
  --depends-on cache
```

## Environment e secret

Passa valori e file environment ripetibili durante l'abilitazione:

```bash
cpak service enable app-prod github.com/example/app \
  --service server \
  --env APP_ENV=production \
  --env-file /etc/example/app.env \
  --secret API_TOKEN=/etc/example/api-token
```

I file environment contengono righe `NAME=value`. Le righe vuote e quelle che iniziano con `#` vengono ignorate. Un valore diretto `--env` sostituisce lo stesso nome proveniente da un file. I file devono essere regolari, assoluti, non superiori a 1 MiB e i nomi `CPAK_` sono riservati.

Il file sorgente di un secret deve essere regolare, assoluto, appartenere all'utente corrente, non essere un link simbolico e negare i permessi a gruppo e altri utenti. cpak lo monta in sola lettura in `/run/secrets/NAME`. Il contenuto non viene copiato nei record del servizio né stampato dai comandi.

Gli stessi flag `--env`, `--env-file` e `--secret` sono disponibili con `cpak run`.

## Controllare il servizio

```bash
cpak service list
cpak service status app-prod
cpak service logs app-prod
cpak service logs --lines 200 app-prod
cpak service restart app-prod
cpak service stop app-prod
cpak service start app-prod
cpak service disable app-prod
cpak service remove app-prod
```

`disable` conserva la definizione e cancella lo stato di esecuzione desiderato. `remove` elimina la definizione. Nessuno dei due comandi rimuove il pacchetto installato o i suoi dati.

## Ispezionare lo stato runtime

I comandi di osservabilità combinano stato del servizio, container, processo, integrità, ora di avvio e porte in ascolto:

```bash
cpak ps
cpak ps --json
cpak status github.com/example/app --instance app-prod
cpak inspect github.com/example/app --instance app-prod
cpak health github.com/example/app --instance app-prod
```

`cpak status` e `cpak health` accettano `--json`. `cpak inspect` restituisce sempre JSON. Se il controllo fallisce, `cpak health` termina con uno stato di errore e può quindi essere usato direttamente da un supervisor o da uno script di deploy.

`cpak ps` mostra le porte come `host:PORT`. Il comando osserva lo stato corrente e non modifica la rete del pacchetto. Il servizio richiede comunque il permesso di rete dichiarato dal pacchetto.
