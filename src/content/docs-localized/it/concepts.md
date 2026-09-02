---
title: Concetti cpak
description: Il piccolo insieme di oggetti dietro pacchetti, layer, stato, permessi e versioni.
tags: [basics, architecture]
section: start
order: 30
---

# Concetti di cpak

cpak separa l'identità del pacchetto dal contenuto del pacchetto. Un repository Git descrive il pacchetto e un registro OCI memorizza i suoi layer di image.

## Origine

L'origine è il repository del pacchetto senza protocollo o `.git` finale, come `github.com/bottlesdevs/bottles`. È l'identità stabile utilizzata dai comandi di installazione, aggiornamento, esecuzione, override, componente aggiuntivo e rollback.

Un alias è un collegamento locale per un'origine installata. Gli aggiornamenti continuano a essere risolti dal repository del pacchetto originale.

## Manifest

`cpak.json` è il contratto del pacchetto. Manifest v3 dichiara:

- Metadati del pacchetto e un'immagine OCI fissata a digest
- binari esportati e voci desktop
- dipendenze cpak richieste e componenti aggiuntivi opzionali
- Comportamento del ciclo di vita, incluso idle
- Permessi per filesystem, dispositivi, servizi desktop, broker, rete e risorse
- Artefatti verificati da installare durante l'installazione del pacchetto

La validazione rifiuta campi sconosciuti, tag immagine modificabili e socket host grezzi rimossi.

## Immagine e layer

L'image contiene il filesystem dell'applicazione. cpak risolve l'image in un digest OCI immutabile e memorizza ogni layer in base al digest del contenuto. I pacchetti che fanno riferimento agli stessi byte condividono questi layer.

L'origine rimane l'identità del pacchetto quando un aggiornamento modifica il riferimento all'image. I dati dell'applicazione seguono l'origine in questi aggiornamenti.

## Stato scrivibile

I layer di image immutabili sono montati sotto un layer di applicazione scrivibile. Le scritture dell'applicazione vanno a quel layer. I record dei pacchetti, lo stato runtime, i registri e i file desktop esportati utilizzano percorsi di storage e ripristino separati.

## Dipendenze e componenti aggiuntivi

Una dipendenza è richiesta dal pacchetto e installata con esso. Il suo manifest fa parte del grafico delle dipendenze risolto.

Un componente aggiuntivo è facoltativo. L'autore del pacchetto dichiara quali origini del componente aggiuntivo sono compatibili e l'utente abilita una selezione per un'applicazione installata. Gli SDK utilizzano questo meccanismo per aggiungere toolchain agli editor senza ricostruire l'image dell'editor.

## Permessi e override

manifest dichiara l'accesso host predefinito per un'applicazione. Un utente override modifica localmente i permessi effettive impostate. Gli aggiornamenti confrontano le vecchie e le nuove permessi effettive e le nuove grant richiedono l'approvazione nel flusso interattivo.

Le permessi controllano le risorse concrete e le azioni broker. Ciò include percorsi, dispositivi, socket, spazi dei nomi di rete, spazi dei nomi utente nidificati, limiti delle risorse, notifiche, apertura di URI esterni, applicazioni host e servizi host digitati.

## Riferimenti alla fonte

Un pacchetto può seguire un ramo, selezionare una versione o aggiungere un commit esatto. Le installazioni di commit rimangono bloccate durante l'aggiornamento. I file di blocco registrano hash manifest immutabili e digest OCI per lo sviluppo locale e l'IC.

## Store e catalogo

Qualsiasi origine di pacchetto valida può essere installata direttamente. Lo [Containerpak Store](/store) aggiunge metadati, categorie, icone e screenshot di rilevamento esaminati. I manifesti e le image dei pacchetti rimangono nei repository e nei registri originali.
