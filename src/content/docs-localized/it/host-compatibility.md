---
title: Compatibilità dell'host
description: Linux, architettura, kernel, filesystem, desktop, init e requisiti GPU per runtime v2.
tags: [host, compatibility, requirements]
section: start
order: 40
---
# Compatibilità host

cpak funziona su Linux e utilizza direttamente le funzionalità del kernel. Il binario statico runtime è pubblicato per `amd64` e `arm64`. Il supporto dell'architettura dell'applicazione dipende anche dall'image OCI pubblicata da ciascun pacchetto.

## Funzionalità host richieste

`cpak doctor` è il controllo autorevole per la macchina corrente. Un'applicazione funzionante runtime necessita di spazi dei nomi utente non privilegiati, OverlayFS rootless e operazioni di montaggio utilizzate per assemblare la visualizzazione del pacchetto.

```bash
cpak doctor
cpak doctor --json
```

Il report JSON separa i controlli richiesti dalle funzionalità opzionali di rafforzamento e risorse. Il suo stato di uscita corrisponde al campo `ready`.

## Copertura distributiva

Il flusso di lavoro di portabilità controlla che il binario statico cpak venga eseguito e generi il suo schema sulle image dello spazio utente di Debian 13, Fedora 42, Arch Linux, openSUSE Tumbleweed e Ubuntu 26.04.

I test di integrazione del kernel vengono eseguiti su diverse generazioni di runner Ubuntu GitHub. Convalida il desktop di destinazione, il filesystem, GPU e la combinazione init con `cpak doctor` e un test del fumo dell'applicazione.

## Filesystem

Lo store cpak necessita di un filesystem locale che supporti FVS e OverlayFS senza root. La condivisione dei blocchi definiti dal contenuto funziona su ogni filesystem locale supportato. I checkout dei layer nativi preferiscono i reflink, quindi i hard link, quindi i file indipendenti.

I filesystem di rete, i montaggi FUSE esistenti e le configurazioni dello spazio dei nomi utente limitato potrebbero non superare il controllo runtime. Mantieni lo store su un filesystem Linux locale per la massima compatibilità. Il percorso runtime preparato utilizza directory native e OverlayFS senza root.

## Sessioni desktop

cpak può esporre audio, accessibilità, stampa e dispositivi selezionati compatibili con Wayland, X11, PulseAudio. L'applicazione manifest deve abilitare la risorsa corrispondente e tale risorsa deve esistere nella sessione utente.

I pacchetti headless possono omettere i socket desktop. Testare i pacchetti desktop su ogni percorso di visualizzazione dichiarato.

## Init e cgroups

cpak funziona sotto il gestore del servizio utente dell'host. La sessione utente deve fornire le directory e i socket runtime richiesti.

I limiti di memoria, CPU e processo richiedono controller cgroup v2 delegati. Le applicazioni richiedono questi controller solo quando il loro manifest definisce un limite. cpak rifiuta un limite richiesto quando host non può applicarlo.

## Funzioni di sicurezza

Seccomp è richiesto dalla policy runtime. Landlock aggiunge restrizioni sul percorso sui kernel che supportano il ABI richiesto. `cpak doctor` segnala Landlock come non disponibile quando host non può applicarlo.

## Supporto GPU

I dispositivi DRI coprono i comuni stack grafici basati su Mesa. Il supporto NVIDIA risolve i file driver dello spazio utente host all'avvio. Testare il passthrough driver sull'hardware di destinazione e sulla versione host driver.

> [!NOTE] Versione sperimentale
> cpak v2 viene lanciato come opzione di distribuzione sperimentale. Il rapporto di compatibilità ti dice cosa può dimostrare localmente il runtime; la copertura hardware specifica del pacchetto è documentata da ciascun pacchetto.