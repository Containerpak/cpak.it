---
title: Testare un pacchetto
description: Convalida i contratti, esegui controlli isolati sui pacchetti e monitora il comportamento del desktop prima della pubblicazione.
tags: [testing, ci, packaging]
section: packages
order: 70
---
# Testare un pacchetto

Il test del pacchetto riguarda manifest, image, file esportati, comportamento di runtime e integrazione desktop. I comandi dello sviluppatore eseguono tali controlli in un archivio isolato.

## Convalida statica

```bash
cpak validate cpak.json
```

Vengono rifiutati campi sconosciuti, versioni manifest non valide, voci di permessi non valide, campi obbligatori mancanti e valori esterni allo schema v3.

Genera lo schema corrente direttamente da runtime durante il confronto dell'editor o della convalida CI:

```bash
cpak gen-schema --output manifest-v3.json
```

## Risoluzione riproducibile

```bash
cpak lock cpak.json
```

Il file di blocco registra i manifesti della radice e delle dipendenze, i relativi hash SHA-256 e i riferimenti alle image OCI immutabili. Salva un file di blocco quando il flusso di lavoro del progetto richiede input CI riproducibili. Rigeneralo quando un ramo o una versione selezionata vengono aggiornati intenzionalmente.

## Test di installazione isolata

```bash
cpak test cpak.json
cpak test cpak.json --binary /usr/bin/example -- --version
```

Il comando crea un Store cpak temporaneo, installa il pacchetto, controlla ogni file binario e desktop dichiarato e, facoltativamente, avvia un file binario. Le esportazioni desktop rimangono all'interno dell'Store temporaneo.

Utilizzare `--origin` per la risoluzione delle dipendenze relative e `--lock` per selezionare un percorso di blocco non predefinito.

## Lancio dello sviluppatore

```bash
cpak dev cpak.json --binary /usr/bin/example
```

`cpak dev` utilizza la stessa configurazione del pacchetto isolato e avvia l'applicazione richiesta. Questo è il percorso più breve per i controlli visivi durante la modifica di un repository di pacchetti.

## Controlli di runtime

Coprire il comportamento di cui l'applicazione ha effettivamente bisogno:

- crea e riapre lo stato scrivibile
- apri ogni voce desktop dichiarata e binario esportato
- permessi per visualizzazione allenamento, audio, GPU, input, stampa o fotocamera abilitate
- verifica che le risorse negate rimangono non disponibili
- aggiorna il pacchetto e conferma che lo stato rimane intatto
- Ripristina e verifica che la versione precedente sia ancora avviata

Gli SDK necessitano di una vera compilazione ed esecuzione di test. I pacchetti con dipendenze necessitano di un avvio che utilizzi la dipendenza. I pacchetti con componenti aggiuntivi necessitano di esecuzioni sia abilitate che disabilitate.

## CI e copertura dell'architettura

Costruisci image OCI in CI ed esegui test del fumo specifici dell'applicazione per ogni architettura pubblicata. Conserva i comandi di test finali nel repository del pacchetto in modo che i manutentori possano ripeterli.

Esegui `cpak test` rispetto all'image pubblicata come parte della convalida del pacchetto. Ciò verifica manifest e runtime fino a cpak.

## Applicazioni visive

Un pacchetto desktop necessita di un avvio visivo cpak oltre a un controllo `--version`. Conferma il rendering di Windows, controlla le icone e le voci del desktop ed esercita i flussi di lavoro principali. Testare i percorsi Wayland e X11 quando manifest li abilita entrambi.
