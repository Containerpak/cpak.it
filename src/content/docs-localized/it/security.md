---
title: Segnalazione di sicurezza
description: Segnala una vulnerabilità in privato e includi le prove necessarie per riprodurla.
tags: [security, reporting]
section: runtime
order: 50
---
# Report sulla sicurezza

Non aprire un problema pubblico per una vulnerabilità senza patch che potrebbe esporre i dati dell'utente, oltrepassare i limiti del pacchetto, eseguire un'operazione host non dichiarata o danneggiare lo Store locale.

## Segnalare in privato

Utilizzare la [segnalazione privata delle vulnerabilità GitHub](https://github.com/Containerpak/cpak/security/advisories/new) per cpak runtime. Seleziona invece il repository del pacchetto quando il problema esiste solo in un pacchetto ufficiale o in una ricetta di image.

Il repository cpak ha la segnalazione privata delle vulnerabilità abilitata. La bozza dell'avviso rimane privata mentre i manutentori riproducono e risolvono il problema.

## Includi prove utili

Fornire la versione cpak o commit interessata, l'origine del pacchetto, il kernel host, il filesystem e la parte pertinente di `cpak doctor --json`. Aggiungi una riproduzione minima con comandi esatti e accesso osservato.

Per un problema sandbox, indica quali permessi manifest sono state abilitate. Per un problema relativo a un Store, includere la sequenza operativa e l'output del controllo. Per un problema broker, identificare l'operazione richiesta e la policy che avrebbe dovuto rifiutarla.

Non includere credenziali attive o file personali non correlati. Sostituisci i segreti preservando la struttura necessaria per riprodurre il parser o il comportamento di trasporto.

## Minoscopio

Le aree cpak sensibili alla sicurezza includono configurazione dello spazio dei nomi, montaggi, seccomp, Landlock, override dell'utente, azioni host digitate, richieste di sistema broker, permesso dei pacchetti nidificati, verifica OCI, checksum dell'runtime source, transazioni di aggiornamento ed esportazioni desktop.

Un'applicazione che si comporta in modo dannoso entro i permessi esplicitamente concesse dal suo manifest non è automaticamente un bypass del confine cpak. Un permesso nascosta, segnalata erroneamente o non applicata rimane un problema di sicurezza valido.

## Follow-up pubblico

Una volta disponibile una correzione, l'advisory può documentare le versioni interessate, le versioni con patch, l'impatto e le fasi di aggiornamento. Mantieni privati i dettagli dell'exploit finché gli utenti non avranno un percorso ragionevole per l'aggiornamento.