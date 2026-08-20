---
title: Avvio rapido
description: Installa, avvia, aggiorna e rimuovi la tua prima applicazione cpak.
tags: [basics, cli]
section: start
order: 20
---

# Avvio rapido

Un pacchetto cpak viene indicato dal suo repository Git. Il repository contiene il contratto del pacchetto, mentre il manifest punta all'image OCI che contiene l'applicazione.

## Controlla il runtime

```bash
cpak doctor
```

Risolvi gli errori richiesti prima di proseguire. Gli avvisi descrivono funzionalità opzionali dell'host che cpak non può applicare sul sistema corrente.

## Installa un'applicazione

Installa un pacchetto direttamente dalla sua origine:

```bash
cpak install github.com/bottlesdevs/bottles
```

cpak risolve il riferimento al repository, valida `cpak.json`, scarica per digest i layer mancanti, installa le dipendenze dichiarate e registra il pacchetto solo quando i dati preparati sono completi.

Un pacchetto può seguire un branch o una release, oppure restare fissato a un commit:

```bash
cpak install --branch main github.com/bottlesdevs/bottles
cpak install --release v1.0.0 github.com/example/app
cpak install --commit 0123456789abcdef github.com/example/app
```

## Avvialo

Il comando accetta l'origine del pacchetto e, facoltativamente, un binario esportato:

```bash
cpak run github.com/bottlesdevs/bottles bottles
```

Gli argomenti dopo il binario vengono passati all'applicazione come vettore di argomenti:

```bash
cpak run github.com/example/editor editor ./notes.txt
```

Crea un alias per usare un comando locale più corto:

```bash
cpak alias set bottles github.com/bottlesdevs/bottles
cpak run bottles bottles
```

## Ispeziona l'installazione

```bash
cpak list
cpak list --json
cpak logs github.com/bottlesdevs/bottles
```

`cpak shell` apre una shell interattiva nel pacchetto installato. Riceve gli stessi layer e mount configurati, quindi è utile per la diagnosi.

## Aggiorna in sicurezza

```bash
cpak update github.com/bottlesdevs/bottles
cpak update
```

Se un aggiornamento chiede nuovi permessi, il comando interattivo mostra le aggiunte prima di applicarlo. L'automazione può rifiutare queste modifiche con `cpak update --non-interactive`.

Ripristina la versione installata precedente quando devi annullare un aggiornamento:

```bash
cpak rollback github.com/bottlesdevs/bottles
```

## Rimuovilo

```bash
cpak stop github.com/bottlesdevs/bottles
cpak remove github.com/bottlesdevs/bottles
cpak gc --apply
```

La rimozione conserva i layer ancora riferiti da altri pacchetti. La garbage collection segnala i dati senza riferimenti prima di eliminarli.

Continua con i [concetti di cpak](/docs/concepts) per capire come si collegano origini, image, stato e permessi.
