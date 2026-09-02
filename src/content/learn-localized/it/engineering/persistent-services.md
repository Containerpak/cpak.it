Un servizio applicativo persistente combina un normale avvio cpak con uno stato desiderato. Il service manager lo avvia attraverso la stessa risoluzione del pacchetto, policy, storage e sandbox usati da `cpak run`. Registra se il servizio deve essere in esecuzione e applica regole di riavvio e integrità fuori dal container applicativo.

## Assegnare un nome al comando

Definisci un servizio quando il pacchetto ha una modalità applicativa che chi lo gestisce non dovrebbe ricostruire manualmente:

```json
{
  "binaries": ["/usr/bin/example"],
  "services": {
    "server": {
      "binary": "/usr/bin/example",
      "arguments": ["serve", "--port", "3000"]
    }
  }
}
```

Il binario resta un binario esportato dal pacchetto. Il servizio associa soltanto un nome a quel binario e al suo vettore di argomenti. Non esiste un comando shell da interpretare.

Esegui il comando una volta con `cpak run --service server github.com/example/app`. Rendilo persistente con una definizione locale:

```bash
cpak service enable app-prod github.com/example/app \
  --service server \
  --restart on-failure
```

Il manifest possiede il comando applicativo. La definizione locale possiede le scelte operative: politica di riavvio, dipendenze, controlli di integrità e configurazione specifica del deploy.

## Aggiungere configurazione senza cambiare l'immagine

Gli input environment e secret sono espliciti sia su `cpak run` sia su `cpak service enable`:

```bash
cpak service enable app-prod github.com/example/app \
  --service server \
  --env APP_ENV=production \
  --env-file /etc/example/app.env \
  --secret API_TOKEN=/etc/example/api-token
```

Le voci dirette `--env` sostituiscono i nomi corrispondenti letti dai file environment. cpak controlla ogni file prima di avviare il pacchetto. Il file sorgente di un secret deve appartenere all'utente corrente e negare l'accesso a gruppo e altri utenti. I suoi byte vengono montati in sola lettura in `/run/secrets/API_TOKEN` e non sono salvati nella definizione del servizio.

## Ripristinare lo stato desiderato

L'abilitazione di un servizio installa il migliore adattatore disponibile. cpak preferisce un servizio systemd utente capace di partire prima del login, poi cron `@reboot`, systemd dopo il login e infine XDG autostart. Il service manager non dipende da systemd o D-Bus.

Ogni adattatore avvia lo stesso punto di ingresso `cpak service restore`. Definizione e comportamento di riavvio non cambiano quando cambia l'adattatore. `cpak service setup` mostra quale adattatore è attivo e se può partire prima del login.

## Osservare un solo modello di stato

Usa `cpak service status app-prod` per stato del manager e numero di riavvii. Usa i comandi runtime quando il deploy deve leggere insieme pacchetto, container, processo, integrità, ora di avvio e porte:

```bash
cpak ps
cpak status github.com/example/app --instance app-prod --json
cpak inspect github.com/example/app --instance app-prod
cpak health github.com/example/app --instance app-prod
```

`cpak health` termina con un errore quando il processo non è in esecuzione o l'integrità è `starting`, `unknown` o `unhealthy`. Può quindi essere usato come gate di deploy senza analizzare la tabella destinata alle persone.

La [guida ai servizi persistenti](/docs/services) elenca tutte le opzioni per ciclo di vita e controlli di integrità.
