---
title: Pubblica nello Store
description: Preparare un pacchetto per il catalogo ufficiale e aggiungere i metadati e i contenuti multimediali revisionati.
tags: [store, publishing, catalog]
section: packages
order: 80
---

# Pubblica nello Store

Lo Store è un layer di scoperta. I pacchetti sono anche installabili direttamente da un'origine Git valida.

## Preparare l'origine del pacchetto

Prima dell'invio del catalogo, il repository del pacchetto dovrebbe contenere:

- un file manifest v3 valido in `cpak.json`, con l'immagine fissata al digest OCI
- a ha pubblicato un'image OCI per ogni architettura pubblicizzata
- un README conciso con comandi di installazione e test
- un flusso di lavoro CI che crea l'image e controlla i relativi file binari esportati
- un test reale cpak del percorso dell'applicazione primaria

Eseguire il flusso di convalida del pacchetto rispetto al riferimento al repository pubblico prima dell'invio.

Il repository `README.md` appartiene ai manutentori e ai contributori. Aggiungi un `STORE-README.md` opzionale quando gli utenti necessitano di istruzioni specifiche del pacchetto come la configurazione dell'account, l'accesso al registro, i termini di licenza, un primo download di grandi dimensioni o il comportamento alla prima esecuzione. Lo Store esegue il rendering di questo file nella pagina dell'applicazione solo quando la relativa voce di catalogo è bloccata con `release` e lo legge da quell'esatto tag di rilascio. Non legge mai `STORE-README.md` da `main`.

## Preparare i supporti del catalogo

Lo Store ufficiale conserva i metadati di rilevamento in [Containerpak/store](https://github.com/Containerpak/store). Ciascuna directory dell'applicazione include un catalogo `manifest.json` e un'icona dell'applicazione originale denominata `icon.svg`. Gli screenshot utilizzano file WebP numerati e un `showcase.webm` opzionale può dimostrare l'applicazione.

Utilizza la grafica originale del progetto. Non inventare un'icona sostitutiva per un'applicazione upstream. Preservare i requisiti di licenza e attribuzione.

## Scegli una categoria

Posiziona la voce del catalogo sotto la categoria corrispondente e il percorso di origine. Il percorso di origine segue l'indirizzo del repository quindi rimane univoco e ispezionabile.

```text
Graphics/
  github/
    com/
      example/
        editor/
          manifest.json
          icon.svg
          screenshot-1.webp
```

Non modificare manualmente gli indici dei cataloghi generati. Il flusso di lavoro di convalida dell'archivio li ricostruisce e li controlla dalle voci di origine.

## Rivedi i permessi del pacchetto

Lo Store mostra i permessi manifest effettive agli utenti. L'accesso ampio al filesystem, l'accesso a tutti i dispositivi, l'accesso al bus di sistema, l'esecuzione root, la condivisione dei processi e le funzionalità del servizio host richiedono un motivo concreto per il pacchetto.

Le permessi di runtime provengono dal manifest installato e dagli override locali dell'utente. I metadati del catalogo vengono utilizzati per il rilevamento e la presentazione del programma di installazione.

## Mantieni aggiornata la voce

Gli aggiornamenti del pacchetto normalmente seguono il riferimento alla fonte registrato dalla voce del catalogo. Aggiorna screenshot e descrizioni quando cambia il comportamento visibile dell'applicazione. Rimuovi le affermazioni che non sono più vere.

Il repository del pacchetto è la fonte di `cpak.json` e dei riferimenti alle image. I metadati del Store puntano a quel contratto di pacchetto.

## Download del programma di installazione

Il flusso di lavoro di rilascio cpak produce programmi di installazione grafici e terminali firmati per le applicazioni elencate. Il catalogo delle versioni unisce i metadati dello Store, la revisione del codice sorgente, l'architettura, i permessi e la base di installazione in una capsula verificata.

Leggi [cpak-installer](/docs/cpak-installer) per l'endpoint diretto, il contratto di integrazione, le risorse di rilascio e il modello di verifica.

## Cataloghi federati

L'identità del pacchetto di cpak è decentralizzata. Un altro progetto può mantenere il proprio indice rivisto con categorie e politiche diverse pur puntando alle stesse origini del pacchetto. L'installazione del pacchetto rimane indipendente da qualsiasi catalogo.
