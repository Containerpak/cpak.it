---
title: Costruisci image OCI
description: Produci image di piccole dimensioni e multi-architettura con build CI, checksum, SBOM e attestazioni memorizzati nella cache.
tags: [images, ci, oci]
section: packages
order: 40
---
# Costruisci image OCI

cpak consuma image OCI standard. Includi l'applicazione, le sue librerie runtime, i file desktop dichiarati e le risorse richieste. Lo cpak runtime rimane sull'host.

## Utilizza più fasi

Compila o decomprimi il software in una fase di creazione, quindi copia il risultato runtime in una fase finale pulita:

```dockerfile
FROM golang:1.26-bookworm AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -o /out/example ./cmd/example

FROM debian:13-slim
COPY --from=build /out/example /usr/bin/example
ENTRYPOINT ["/usr/bin/example"]
```

Gli strumenti di creazione e le cache del gestore pacchetti rimangono all'esterno dell'image finale. Ciò è importante anche quando i layer sono condivisi perché ogni byte univoco deve comunque essere scaricato e salvato una volta.

## Pubblica con azioni GitHub

I pacchetti Containerpak ufficiali creano image nelle azioni GitHub. Un flusso di lavoro tipico pubblica `amd64` e `arm64`, utilizza la cache delle azioni GitHub e allega la provenienza e un SBOM:

```yaml
name: Publish

on:
  push:
    branches: [main]
    paths:
      - Containerfile
      - cpak.json
      - .github/workflows/publish.yml

permissions:
  contents: read
  packages: write
  attestations: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-qemu-action@v3
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.repository_owner }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          context: .
          file: Containerfile
          platforms: linux/amd64,linux/arm64
          push: true
          pull: true
          tags: ghcr.io/example/example:main
          cache-from: type=gha
          cache-to: type=gha,mode=max
          provenance: mode=max
          sbom: true
```

Aggiungi controlli specifici dell'applicazione dopo la compilazione. Verifica ogni architettura che il flusso di lavoro afferma di pubblicare.

Mantieni `pull: true` quando l'image finale segue un tag della piattaforma. Ciò fa sì che la build risolva il digest della piattaforma corrente anche quando la cache delle azioni GitHub contiene una base precedente.

## Immagini di base

Scegli una base mantenuta che fornisca i pacchetti ABI e runtime previsti dalla tua applicazione. I repository Containerpak `images` e `wine` forniscono ambienti riutilizzabili per pacchetti ufficiali con esigenze condivise. I payload dell'applicazione rimangono nelle image del pacchetto.

Mantieni esplicita la versione della distribuzione. Un tag di distribuzione mobile può sostituire le librerie senza una corrispondente revisione del pacchetto.

| Immagine | Distribuzione delle basi | Destinazione d'uso | Ricetta |
| ----------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `ghcr.io/containerpak/foundation:main` | Ubuntu 26.04 | Base Ubuntu a layer singolo fissata con certificati e policy APT cpak | [`platform/foundation`](https://github.com/Containerpak/images/blob/main/platform/foundation/Containerfile) |
| `ghcr.io/containerpak/base:main` | Ubuntu 26.04 | Nome di compatibilità per la fondazione | [`platform/base`](https://github.com/Containerpak/images/blob/main/platform/base/Containerfile) |
| `ghcr.io/containerpak/locales:main` | Ubuntu 26.04 | Dati locali compilati selezionati da cpak al momento dell'installazione; non una base applicativa | [`platform/locales`](https://github.com/Containerpak/images/blob/main/platform/locales/Containerfile) |
| `ghcr.io/containerpak/mesa64:main` | Ubuntu 26.04 | OpenGL a 64 bit, Vulkan, Wayland e carattere comune runtime | [`platform/mesa64`](https://github.com/Containerpak/images/blob/main/platform/mesa64/Containerfile) |
| `ghcr.io/containerpak/mesa-multilib:main` | Ubuntu 26.04 | `mesa64` con librerie grafiche a 32 bit | [`platform/mesa-multilib`](https://github.com/Containerpak/images/blob/main/platform/mesa-multilib/Containerfile) |
| `ghcr.io/containerpak/mesa:main` | Ubuntu 26.04 | Grafica multilib runtime con strumenti da riga di comando Mesa e Vulkan | [`platform/mesa`](https://github.com/Containerpak/images/blob/main/platform/mesa/Containerfile) |
| `ghcr.io/containerpak/gtk3:main` | Ubuntu 26.04 | Applicazioni desktop GTK 3 con audio e grafica a 64 bit | [`platform/gtk3`](https://github.com/Containerpak/images/blob/main/platform/gtk3/Containerfile) |
| `ghcr.io/containerpak/webkitgtk:main` | Ubuntu 26.04 | Applicazioni GTK 3 che utilizzano WebKitGTK 4.1 | [`platform/webkitgtk`](https://github.com/Containerpak/images/blob/main/platform/webkitgtk/Containerfile) |
| `ghcr.io/containerpak/gtk4:main` | Ubuntu 26.04 | Applicazioni desktop GTK 4 | [`platform/gtk4`](https://github.com/Containerpak/images/blob/main/platform/gtk4/Containerfile) |
| `ghcr.io/containerpak/adwaita:main` | Ubuntu 26.04 | Applicazioni GTK 4 che utilizzano libadwaita | [`platform/adwaita`](https://github.com/Containerpak/images/blob/main/platform/adwaita/Containerfile) |
| `ghcr.io/containerpak/webkitgtk6:main` | Ubuntu 26.04 | Applicazioni GTK 4 e libadwaita che utilizzano WebKitGTK 6 | [`platform/webkitgtk6`](https://github.com/Containerpak/images/blob/main/platform/webkitgtk6/Containerfile) |
| `ghcr.io/containerpak/desktop:main` | Ubuntu 26.04 | Desktop completo runtime per applicazioni che richiedono GTK 3, GTK 4, libadwaita e WebKitGTK 4.1 | [`platform/desktop`](https://github.com/Containerpak/images/blob/main/platform/desktop/Containerfile) |
| `ghcr.io/containerpak/gtk:main` | Ubuntu 26.04 | Nome compatibilità per `desktop`; i nuovi pacchetti dovrebbero selezionare un ramo GTK con versione | [`platform/gtk`](https://github.com/Containerpak/images/blob/main/platform/gtk/Containerfile) |
| `ghcr.io/containerpak/wine:main` | Ubuntu 26.04 | Librerie host per image di applicazioni che forniscono Wine o Proton, inclusi grafica, audio, input e contenuti multimediali a 32 bit | [`Containerpak/wine`](https://github.com/Containerpak/wine/blob/main/Containerfile) |

Le image SDK seguono la stessa suddivisione:

| Immagine | Destinazione d'uso | Ricetta |
| ----------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `ghcr.io/containerpak/base-sdk:main` | Ambiente di compilazione generale C e C++ | [`sdk/base`](https://github.com/Containerpak/images/blob/main/sdk/base/Containerfile) |
| `ghcr.io/containerpak/mesa64-sdk:main` | Intestazioni grafiche a 64 bit e strumenti di creazione | [`sdk/mesa64`](https://github.com/Containerpak/images/blob/main/sdk/mesa64/Containerfile) |
| `ghcr.io/containerpak/mesa-sdk:main` | Intestazioni e strumenti grafici Multilib | [`sdk/mesa`](https://github.com/Containerpak/images/blob/main/sdk/mesa/Containerfile) |
| `ghcr.io/containerpak/gtk3-sdk:main` | Intestazioni di sviluppo GTK 3 | [`sdk/gtk3`](https://github.com/Containerpak/images/blob/main/sdk/gtk3/Containerfile) |
| `ghcr.io/containerpak/webkitgtk-sdk:main` | Intestazioni di sviluppo GTK 3 e WebKitGTK 4.1 | [`sdk/webkitgtk`](https://github.com/Containerpak/images/blob/main/sdk/webkitgtk/Containerfile) |
| `ghcr.io/containerpak/gtk4-sdk:main` | Intestazioni di sviluppo GTK 4 e libadwaita | [`sdk/gtk4`](https://github.com/Containerpak/images/blob/main/sdk/gtk4/Containerfile) |
| `ghcr.io/containerpak/desktop-sdk:main` | SDK completo per GTK 3, GTK 4, libadwaita e WebKitGTK 4.1 | [`sdk/desktop`](https://github.com/Containerpak/images/blob/main/sdk/desktop/Containerfile) |
| `ghcr.io/containerpak/gtk-sdk:main` | Nome di compatibilità per `desktop-sdk` | [`sdk/gtk`](https://github.com/Containerpak/images/blob/main/sdk/gtk/Containerfile) |

Il tag `main` segue l'attuale build della piattaforma. `ubuntu-26.04` segue la build attuale per quella versione di Ubuntu. Tag come `ubuntu-26.04.20260814.3` e `sha-<revision>` identificano uno stato della piattaforma pubblicata e sono adatti per build riproducibili.

Le image ufficiali della piattaforma identificano l'image locale corrispondente nella configurazione OCI. cpak legge le impostazioni locali dell'utente, importa solo le directory compilate richieste e aggiunge il layer condiviso risultante all'applicazione. I pacchetti mantengono i propri cataloghi di traduzione e non è necessario che includano `locales-all`.

La scelta della distribuzione definisce le versioni ABI e della libreria disponibili per l'applicazione. Scegli la base più piccola che già corrisponde al software, aggiungi l'image finale dell'applicazione tramite digest tramite cpak ed esamina gli aggiornamenti della base in CI prima di pubblicarli.

Installa librerie runtime aggiuntive e pulisci APT nello stesso layer:

```dockerfile
FROM ghcr.io/containerpak/gtk3:ubuntu-26.04

RUN apt-get update && \
    apt-get install -y libexample1 && \
    cpak-clean-junk
```

La policy APT della piattaforma già disabilita i pacchetti consigliati e suggeriti, la conservazione dei pacchetti scaricati, i manuali, i report sui pacchetti e la documentazione di build. Non sostituire tale policy né installare `locales-all` in ogni image dell'applicazione. Conservare i cataloghi di traduzione delle applicazioni nel pacchetto; cpak fornisce la locale host compilata attraverso il layer locale condiviso.

## Disposizione dei layer

Raggruppare contenuti runtime stabili prima di modificare frequentemente il contenuto dell'applicazione. I registri OCI e cpak indirizzano i layer tramite digest, quindi i layer di base non modificati possono essere condivisi da molti pacchetti e conservati durante gli aggiornamenti.

Evitare un unico passo gigante `RUN` quando provoca l'invalidazione di contenuti runtime non correlati da parte di un aggiornamento dell'applicazione. Evita molti piccoli layer che esistono solo per rispecchiare i singoli comandi della shell. Divisione ai confini che probabilmente cambieranno in modo indipendente.

## Progettazione per la deduplica a due layer

Le image di base condivise sono utili oltre alla coerenza della build. cpak memorizza i layer OCI per digest, quindi le applicazioni basate sulla stessa base invariata riutilizzano un layer scaricato e salvato. Un nuovo layer viene decompresso solo quando il suo digest è assente.

cpak trasmette un nuovo layer direttamente nel content store globale FVS. FVS suddivide il contenuto del file in blocchi definiti dal contenuto e riutilizza i blocchi a cui fa già riferimento un altro layer. Ciò rileva intervalli uguali anche quando due image le collocano in file diversi o producono digest OCI diversi.

```text
OCI digest match     -> reuse the complete layer
New OCI layer        -> verify and decode as one stream
FVS block match      -> reference the existing content block
Unique block         -> store one new content block
```

Il primo layer riutilizza basi stabili e confini dei layer corrispondenti. Il secondo layer trova contenuti ripetuti su diversi layout di layer. Entrambi vengono eseguiti automaticamente durante il pull dell'image. Un'importazione riuscita mantiene la rappresentazione FVS utilizzata dai pacchetti installati.

Per i registri e i CDN che preservano le risposte dell'intervallo di byte, `zstd:chunked` consente a cpak di leggere prima il sommario dei layer e di ignorare gli intervalli di file compressi il cui contenuto completo esiste già in FVS. cpak utilizza un flusso completo per un magazzino frigorifero e passa agli intervalli solo quando il contenuto noto lo rende più economico. Un normale pull gzip o zstd rimane il fallback automatico. Leggere [Scegli e utilizza un registro OCI](/docs/registries) prima di abilitarlo in CI.

## Artefatti esterni

Preferisci scaricare gli input di build in CI e controllare il checksum fornito dal fornitore prima dell'uso. Se un elemento deve essere installato sul computer dell'utente, dichiararlo tramite `runtime_sources` con il relativo URL HTTPS, dimensione esatta, SHA-256 e un programma di installazione `tar`, `dpkg`, `deb-extract`, `rpm` o `file`. Questo è anche il limite corretto quando il fornitore consente agli utenti di scaricare un'applicazione ma non consente allo Store di ripubblicare il relativo payload. Vedere [Origini di runtime](/docs/runtime-sources) per i contratti di archivio e file e i controlli CI.

## Verificare il risultato

Dopo la pubblicazione dell'image:

```bash
cpak validate cpak.json
cpak lock cpak.json
cpak test cpak.json
```

Esegui almeno un binario dichiarato. I pacchetti desktop necessitano inoltre di un vero avvio visivo tramite cpak su ciascun percorso di visualizzazione supportato.