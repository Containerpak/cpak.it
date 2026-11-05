---
title: Installa app da Flathub
description: Trova un'applicazione su Flathub, installala con cpak e tienila aggiornata senza installare Flatpak.
tags: [flatpak, flathub, install]
section: start
order: 25
---

# Installa app da Flathub

cpak installa le applicazioni Flatpak senza Flatpak. Legge l'applicazione, il suo runtime e le loro estensioni dal repository OSTree del remote, controlla ogni oggetto con la chiave di firma del remote e li conserva come layer cpak. L'applicazione gira poi nel sandbox di cpak come qualsiasi altro pacchetto. Flathub è già configurato, con la sua chiave inclusa in cpak, quindi non c'è niente da aggiungere prima della prima installazione. Il supporto Flatpak richiede cpak 2.14.9 o successivo; `cpak capabilities` elenca `flatpak-install` quando la build lo include.

## Trova un'applicazione

Cerca su [flathub.org](https://flathub.org). Ogni pagina di applicazione ha un indirizzo nella forma `https://flathub.org/apps/<id>`, e l'ultima parte è l'id che serve a cpak, come `org.gnome.Calculator` o `org.mozilla.firefox`. Lo stesso id compare nel comando di installazione che Flathub mostra sotto il pulsante Install.

## Installala

Passa l'id a `cpak install --flatpak`:

```bash
cpak install --flatpak org.gnome.Calculator
```

Prima di scaricare qualcosa, cpak mostra l'applicazione, il runtime che le serve e i permessi che chiede, tradotti in una policy cpak. Le richieste che hanno un equivalente in cpak vengono concesse come cpak le concede. Quelle che non ne hanno, o che indebolirebbero il sandbox, vengono rifiutate ed elencate con il motivo: il bus di sessione o di sistema diretto, la root dell'host, `/tmp`, i socket di altri servizi sotto `xdg-run`, `devel` e tutto `/dev`. Rispondi alla domanda per installare, oppure passa `--yes` negli script.

Il pulsante Install di Flathub punta anche a un file `.flatpakref`. cpak lo legge da un percorso o da un indirizzo HTTPS:

```bash
cpak install --flatpak https://dl.flathub.org/repo/appstream/org.gimp.GIMP.flatpakref
```

Un branch diverso da quello predefinito si sceglie con `--branch`:

```bash
cpak install --flatpak org.mozilla.firefox --branch stable
```

Alcune applicazioni, come Google Chrome o Discord, su Flathub hanno solo una piccola ricetta e scaricano il programma vero dal loro editore. cpak scarica quel file durante l'installazione, lo controlla con il checksum promesso dalla build Flathub ed esegue il passo di estrazione dell'applicazione dentro il sandbox, senza accesso alla rete.

## Avviala

L'applicazione compare nel menu del desktop come tutte le altre. Da terminale, cpak crea un alias breve dall'ultima parte dell'id quando il nome è libero, e lo stampa alla fine dell'installazione:

```bash
cpak run calculator
```

L'applicazione è installata con l'origine `flatpak/<remote>/<id>`, per esempio `flatpak/flathub/org.gnome.calculator`. Quell'origine funziona con ogni comando che ne accetta una.

## Tienila aggiornata

Le applicazioni Flatpak seguono lo stesso ciclo di vita dei pacchetti cpak:

```bash
cpak list
cpak update
cpak rollback flatpak/flathub/org.gnome.calculator
cpak remove flatpak/flathub/org.gnome.calculator
```

Il runtime viene installato accanto all'applicazione e condiviso con tutte le applicazioni sullo stesso branch. Viene rimosso insieme all'ultima applicazione che lo usa.

## Cambia i permessi

Un permesso che cpak ha rifiutato all'installazione può comunque essere concesso, e uno concesso tolto, con un override:

```bash
cpak override edit flatpak/flathub/org.gnome.calculator
```

## Altri remote

Flathub è il remote predefinito. Un altro remote si aggiunge installando dal suo `.flatpakref`: cpak mostra l'impronta della chiave prima di fidarsene, e le installazioni successive da quel remote si scelgono con `--flatpak-remote`:

```bash
cpak install --flatpak org.example.App --flatpak-remote example
```

## Integrazione col desktop

L'applicazione raggiunge il desktop come farebbe con Flatpak, attraverso i portali, ma senza nessun servizio portale. cpak serve da sé il bus di sessione del sandbox e risponde a selettori di file, link, notifiche, impostazioni, stato della rete e risoluzione dei proxy tramite il suo broker. I processi di supporto avviati con `flatpak-spawn` girano nello stesso sandbox, mai sull'host. Il driver NVIDIA dell'host viene usato tramite il supporto NVIDIA di cpak, e Mesa arriva dal runtime.

Per spostare le applicazioni che hai già installato con Flatpak, vedi [Sostituisci Flatpak con cpak](/docs/replace-flatpak).
