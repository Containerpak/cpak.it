---
title: Aggiornamenti, pin e rollback
description: Scegli un riferimento di origine, esamina le modifiche ali permessi e ripristina la versione precedente.
tags: [updates, rollback, versions]
section: operations
order: 20
---
# Aggiornamenti, blocchi e rollback

cpak registra l'origine del pacchetto, il riferimento Git selezionato e il digest OCI risolto separatamente. Un pacchetto può seguire un ramo mantenuto o rimanere fissato a una revisione esatta.

Questa pagina copre i pacchetti di applicazioni. Utilizzare [Aggiornamenti cpak runtime](/docs/runtime-updates) per aggiornare il file binario cpak.

## Selezione della sorgente

Installa un ramo mobile:

```bash
cpak install --branch main github.com/example/app
```

Installa una versione denominata:

```bash
cpak install --release v2.0.1 github.com/example/app
```

Aggiungi un commit immutabile:

```bash
cpak install --commit 0123456789abcdef github.com/example/app
```

Le installazioni confermate riportano `pinned` durante l'aggiornamento e non si spostano. Il comportamento del ramo e del rilascio dipende dal repository host e dal riferimento selezionato.

## Aggiorna uno o tutti i pacchetti

```bash
cpak update github.com/example/app
cpak update
cpak update --json
```

Ogni risultato registra l'origine, la vecchia versione, la nuova versione, il tipo di origine, lo stato, le modifiche ali permessi, le aggiunte di permessi e il motivo dell'errore, se presente.

## Revisione permesso

Un aggiornamento interattivo mostra i pacchetti che richiedono nuove permessi e chiede una volta prima di continuare. La modalità non interattiva rifiuta tali aggiornamenti:

```bash
cpak update --non-interactive
```

Utilizzare questa modalità per i lavori non presidiati. Una negazione delil permesso rappresenta un risultato di aggiornamento non riuscito e il pacchetto precedente rimane attivo.

## Interruttore atomico

cpak mette in scena i nuovi layer manifest, OCI, origini runtime, dipendenze, esportazioni desktop e record di database. Cambia la versione attiva solo dopo che la gestione temporanea ha avuto esito positivo. Il codice di ripristino gestisce le transazioni interrotte prima di commit.

Se il digest dell'image è invariato ma manifest è cambiato, cpak aggiorna i metadati del pacchetto e i permessi effettive. L'esecuzione di un aggiornamento per una versione corrente ripara anche i comandi esportati, le voci del desktop, le icone e gli alias delle applicazioni predefinite.

## Torna indietro

```bash
cpak rollback github.com/example/app
```

Il rollback ripristina la versione installata precedente e la relativa vista runtime derivata da manifest. Lo stato dell'applicazione scrivibile rimane separato dai layer del pacchetto immutabili. Le applicazioni che migrano i propri dati potrebbero comunque richiedere il ripristino specifico dell'applicazione.

## Blocca file

`cpak lock` risolve un pacchetto locale e le dipendenze in contenuto immutabile. È pensato per lo sviluppo di pacchetti e CI, dove seguire un tag spostato durante un test renderebbe il risultato ambiguo.

```bash
cpak lock cpak.json
cpak test cpak.json --lock cpak.lock.json
```

Rigenera il file di blocco solo quando gli input del pacchetto selezionato vengono aggiornati intenzionalmente.