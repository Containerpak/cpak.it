---
title: Environment persistenti
description: Crea environment Linux modificabili da pacchetti di distribuzione, conserva il loro stato e gestisci permessi e processi.
tags: [environment, distribuzioni, shell, permessi]
section: operations
order: 15
---

# Environment persistenti

Un environment cpak trasforma un pacchetto installato in uno spazio di lavoro modificabile con un nome. I pacchetti di distribuzione usano questa interfaccia per offrire Fedora, Ubuntu, Debian, Arch Linux, openSUSE e altri sistemi completi da riga di comando senza sostituire il runtime cpak.

Il pacchetto continua a definire la base immutabile, l'origine degli aggiornamenti e il limite massimo dei permessi. L'environment aggiunge un layer scrivibile persistente e una home privata. Pacchetti installati, configurazione e file restano disponibili dopo l'arresto dell'environment o il riavvio dell'host.

## Crea ed entra in un environment

Installa prima il pacchetto della distribuzione. L'environment rimane legato all'identità di quel pacchetto installato:

```bash
cpak install github.com/containerpak/archlinux
cpak environment create --name arch --origin github.com/containerpak/archlinux
cpak environment shell --environment arch
```

`--environment` accetta il nome o l'ID mostrato da `cpak environment list`. I nomi non distinguono maiuscole e minuscole e devono essere univoci.

L'azione `shell` esegue `sh -i` per impostazione predefinita. Seleziona un altro comando e passa i suoi argomenti dopo quelli dell'azione:

```bash
cpak environment shell --environment arch --command /bin/bash -- -l
```

Un environment non può essere avviato da codice dentro un altro pacchetto. È uno spazio di lavoro dell'utente host, non un modo per acquisire l'autorità di un altro pacchetto.

## Stato persistente e aggiornamenti

Arrestare un environment termina il container attivo ma conserva layer scrivibile, home privata, database del gestore pacchetti e metadati:

```bash
cpak environment stop --environment arch
```

Il successivo accesso usa lo stesso stato. Aggiornando il pacchetto della distribuzione, l'environment passa alla nuova versione e conserva il proprio layer scrivibile:

```bash
cpak update github.com/containerpak/archlinux
cpak environment shell --environment arch
```

Elimina l'environment solo quando i pacchetti installati e i dati al suo interno non servono più:

```bash
cpak environment delete --environment arch
```

L'eliminazione arresta il container e rimuove metadati, layer scrivibile e dati privati dell'environment. Non disinstalla il pacchetto della distribuzione.

## Ispeziona gli environment

```bash
cpak environment list
cpak environment inspect --environment arch
cpak environment inspect --environment arch --json
```

`list` mostra nome, origine del pacchetto, versione e ID stabile. `inspect` stampa il record selezionato. Usa `--json` per l'automazione.

## Policy dei permessi

Un environment parte dalla policy effettiva del pacchetto installato. La policy locale può rimuovere permessi, ma non può aggiungere nulla oltre quel limite.

Stampa separatamente la policy corrente e il limite del pacchetto:

```bash
cpak environment policy --environment arch
cpak environment permissions --environment arch
```

Per restringere l'environment, salva un oggetto override completo e applicalo:

```json
{
  "network": false,
  "hostNetwork": false,
  "filesystem": [],
  "env": []
}
```

```bash
cpak environment policy --environment arch --policy policy.json
```

Usa `--policy -` per leggere l'oggetto JSON dallo standard input. L'applicazione di una policy arresta l'environment attivo: la shell successiva parte con il nuovo limite. Una policy che amplia i permessi del pacchetto installato viene rifiutata.

## Processi e segnali

L'ispezione dei processi è limitata all'environment in esecuzione selezionato:

```bash
cpak environment processes --environment arch
cpak environment processes --environment arch --json
cpak environment signals
cpak environment signal --environment arch --pid 1234 --signal TERM
```

Il PID deve appartenere a quell'environment. `cpak environment signals` elenca i nomi supportati; segnali numerici arbitrari o sconosciuti vengono rifiutati.

## Istruzioni specifiche del pacchetto

Leggi la pagina del pacchetto nel [cpak Store](/store/Distributions) prima di creare un environment. Chi mantiene una distribuzione può pubblicare un `STORE-README.md` accanto a `cpak.json` con il gestore pacchetti, il primo comando di aggiornamento, le note di accesso e i limiti di architettura esatti per quella release.
