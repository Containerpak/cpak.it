---
title: Sandbox e modello di minaccia
description: Cosa isola cpak, cosa può riaprire manifest e quali protezioni dipendono dall'host.
tags: [security, sandbox, runtime]
section: runtime
order: 20
---
# Sandbox e modello di minaccia

cpak avvia le applicazioni come utente corrente. sandbox espone le risorse dichiarate dal pacchetto e accettate dall'utente.

## Confine dello spazio dei nomi

Il runtime utilizza namespace Linux per utenti, mount, processi, IPC, hostname, cgroup e rete. Il processo vede la root del pacchetto assemblato. Il PID 1 del pacchetto gestisce la pulizia dei processi figli e la durata dell'istanza.

Senza `network`, il namespace di rete privato non ha una route verso l'esterno. Con `network`, `slirp4netns` aggiunge accesso a internet e LAN mentre il loopback dell'host resta bloccato. cpak aggiorna soltanto questo helper quando cambia il resolver dell'host, quindi il container sopravvive a un cambio Wi-Fi o VPN. Il permesso separato `hostNetwork` condivide invece il namespace di rete dell'host e localhost.

Gli spazi dei nomi utente nidificati sono bloccati per impostazione predefinita. Un pacchetto può richiedere `userNamespaces` per applicazioni come browser che creano un altro sandbox all'interno di cpak.

## Limite del filesystem

Sono presenti solo la root del pacchetto, i montaggi runtime e i percorsi dichiarati del filesystem host. Ogni percorso host ha una modalità di sola lettura o lettura-scrittura. Landlock restringe l'accesso al percorso dopo l'impostazione del montaggio quando supportato dal kernel corrente.

Landlock aggiunge restrizioni ai percorsi dopo l'isolamento dei mount. Il kernel non permette a un processo confinato da Landlock di cambiare la topologia del filesystem, quindi cpak non applica Landlock quando il pacchetto concede esplicitamente `userNamespaces`. Quel permesso conserva l'isolamento del namespace dei mount e seccomp, ma rimuove la seconda barriera sui percorsi affinché la sandbox annidata possa creare i propri mount. `cpak doctor` segnala se l'host può applicare Landlock agli avvii normali.

## Limite delle chiamate di sistema

cpak applica `no_new_privs` prima dell'avvio dell'applicazione e utilizza seccomp per bloccare le chiamate di sistema non consentite. Dopo questo punto un pacchetto non può ottenere privilegi tramite un eseguibile setuid.

La policy include le chiamate richieste dalle applicazioni desktop supportate e da cpak runtime. Testare una nuova classe di applicazione rispetto alla policy prima di modificare il filtro globale.

## Controlli delle risorse

I limiti di memoria, CPU e processo utilizzano controller cgroup v2 delegati. Un avvio con un limite richiesto non disponibile fallisce con una diagnostica specifica.

runtime utilizza il gestore servizi disponibile nella sessione utente. Le funzionalità del kernel e le risorse della sessione determinano la compatibilità dell'host.

## Comunicazione host

Prese e dispositivi diretti sono campi manifest opt-in. Le operazioni di sistema ristrette utilizzano i broker:

- il sistema broker accetta solo tipi di azioni integrate
- la convalida peer locale collega le richieste all'istanza del pacchetto in esecuzione
- i comandi di compatibilità vengono analizzati prima di creare la richiesta al broker
- le azioni in streaming conservano canali di output, stato di uscita e cancellazione

Ogni spessore di compatibilità viene mappato a una richiesta digitata e alla relativa permesso effettiva del pacchetto.

Le richieste del selettore file nativo utilizzano un percorso di grant file separato. cpak riceve l'oggetto selezionato sull'host e passa un descrittore aperto allo spazio dei nomi di montaggio dell'applicazione. Un pacchetto senza il permesso del bus di sessione riceve un adattatore limitato che gestisce il selettore senza esporre altri servizi desktop. Vedere [Accesso alla selezione file](/docs/file-access).

## L'utente esegue l'override

manifest definisce le impostazioni predefinite del pacchetto. Gli utenti possono rimuovere l'accesso o aggiungere una grant locale. Gli aggiornamenti confrontano le vecchie e le nuove permessi effettive e chiedono prima di accettare aggiunte.

`cpak update --non-interactive` rifiuta gli aggiornamenti che richiedono nuove permessi. Questa è la modalità consigliata per i sistemi non presidiati.

## Limiti del confine

Un pacchetto con accesso home in lettura e scrittura può modificare i file dell'utente. Regole ampie per il bus di sessione possono chiamare i servizi che esse consentono. Dispositivi completi, rete host, condivisione dei processi, mount della root host e root dentro l'ambiente ampliano la superficie attendibile.

Esaminare manifest prima di eseguire un pacchetto non attendibile. Lo Store evidenzia i permessi ad alto rischio. manifest e override locale definiscono la politica autorevole.

Il limite sopra indica ciò che può raggiungere un'applicazione in esecuzione. Non dice nulla
se l'applicazione sul disco è ancora quella installata, quale
è una domanda separata con una risposta separata: vedi
[Lancio verificato](/docs/verified-launch).
