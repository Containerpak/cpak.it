---
title: Sostituisci Flatpak con cpak
description: Installa cpak, sposta le applicazioni installate con Flatpak insieme ai loro dati e rimuovi Flatpak quando nulla dipende più da lui.
tags: [flatpak, migration, install]
section: start
order: 27
---

# Sostituisci Flatpak con cpak

cpak installa da sé le applicazioni Flatpak, quindi un sistema può usarle senza Flatpak. Il passaggio richiede tre fasi: installare cpak, migrare le applicazioni, poi rimuovere Flatpak quando le applicazioni migrate funzionano. Fino all'ultima fase le due installazioni convivono e non si perde niente.

## Installa cpak

Segui [Installa cpak](/docs/install), poi controlla l'host e la build:

```bash
cpak doctor
cpak capabilities
```

La migrazione richiede cpak 2.14.9 o successivo, dove `cpak capabilities` elenca `flatpak-install`.

## Migra le applicazioni

```bash
cpak migrate-flatpak
```

cpak legge direttamente l'installazione utente in `~/.local/share/flatpak` e quella di sistema in `/var/lib/flatpak`, quindi per questa fase il comando `flatpak` non deve essere installato. Per ogni applicazione scopre quale id, branch e remote chiedere, poi la installa di nuovo da quel remote. Dalla installazione dell'host non viene importato niente: la build viene scaricata e verificata con la chiave di cui cpak si fida. Un remote che cpak conosce già dal suo indirizzo, Flathub prima di tutti, mantiene la chiave di cpak; un remote che cpak non conosce viene preso con la chiave con cui lo autentica l'installazione Flatpak, e il piano lo dice.

Il piano elenca ogni applicazione con i permessi che avrà sotto cpak, poi chiede se continuare. Per spostare una sola applicazione:

```bash
cpak migrate-flatpak org.gnome.Calculator
```

## Cosa succede ai dati

Ogni applicazione teneva i suoi file in `~/.var/app/<id>`. cpak li copia nella home privata che le assegna: `config` diventa `.config`, `data` diventa `.local/share`, e tutto il resto mantiene il suo nome. La cache resta indietro, perché l'applicazione la ricostruisce ed è spesso la parte più grande.

La copia si fa una volta sola. Un file che l'applicazione ha già scritto sotto cpak è più recente della copia Flatpak, quindi viene mantenuto. Rilanciare la migrazione riconosce le applicazioni già spostate da un'esecuzione precedente, senza interrogare il loro remote, e non copia i loro dati una seconda volta: non riporta indietro niente di quello che hai cancellato sotto cpak nel frattempo.

Un'applicazione che sotto Flatpak aveva accesso a tutta la home legge i suoi dati da lì e non ha niente da copiare. I suoi dati restano dove sono.

## Controlla il risultato

Le installazioni Flatpak restano come sono, quindi il menu del desktop mostra ogni applicazione migrata due volte finché Flatpak non viene rimosso. Avvia la copia cpak da terminale per essere sicuro di quale parte:

```bash
cpak list
cpak run calculator
```

`cpak migrate-flatpak` esce con 0 solo quando tutte le applicazioni sono state spostate. Esce con 11 quando un remote non era raggiungibile e con 12 quando una risposta non ha superato la verifica, così uno script sa quando riprovare. Un'applicazione che fallisce viene segnalata e resta su Flatpak.

## Rimuovi le copie Flatpak

Quando le applicazioni migrate funzionano, le copie Flatpak possono andare:

```bash
cpak migrate-flatpak --delete-flatpaks
```

Questo disinstalla da Flatpak ogni applicazione migrata insieme a quello che teneva in `~/.var/app`, poi rimuove i runtime Flatpak che nessuno usa più. Siccome i dati vanno via con lei, cpak ti chiede di scrivere per intero una frase di consenso, e `--yes` non la sostituisce. Un'applicazione che non è stata migrata, o che aveva accesso a tutta la home, non viene mai cancellata. Questa fase usa il comando `flatpak`, quindi eseguila prima di rimuovere Flatpak dal sistema.

## Rimuovi Flatpak

Con tutte le applicazioni su cpak, rimuovi il pacchetto Flatpak con il gestore di pacchetti del sistema, per esempio:

```bash
sudo dnf remove flatpak
sudo apt remove flatpak
sudo pacman -R flatpak
```

Da quel momento le applicazioni di Flathub si installano con cpak. Vedi [Installa app da Flathub](/docs/flathub).
