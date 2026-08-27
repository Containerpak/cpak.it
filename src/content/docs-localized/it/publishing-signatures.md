---
title: Firma dell'editore
description: Firma ciò che pubblichi in modo che una macchina possa distinguere la tua build da una sua copia, senza chiave attraverso il tuo CI.
tags: [publishing, security, signing]
section: packages
order: 50
---

# Firma dell'editore

Questa pagina è per le persone che pubblicano un pacchetto cpak. Spiega cos'è un pacchetto
la firma è, cosa aggiungi al tuo flusso di lavoro per produrne una, quanto ti costa,
e cosa succede alle persone che installano il tuo pacchetto se non lo fai mai.

## Non fare nulla continua a funzionare

La firma è facoltativa e resta facoltativa. Viene installato un pacchetto senza firma
e funziona esattamente come oggi, e nulla in questa pagina lo cambia.

Ciò a cui si rinuncia non firmando è l'unica cosa che aggiunge una firma: nessuno può farlo
distinguere una build uscita dal tuo repository da una copia arrivata
da qualche altra parte, e una macchina che vuole controllare prima dell'installazione ha
niente da controllare.

## Cosa è firmato e cosa dimostra

Una firma non copre l'image. Copre la parte del tuo pacchetto
identità che puoi determinare prima che raggiunga la macchina di qualcuno:

- l'origine, ovvero il repository da cui è pubblicato il tuo manifest
- lo SHA-256 del tuo manifest
- il digest dell'image in cui manifest ha risolto
- il SHA-256 della tua serratura, quando la confezione ne ha uno
- a generazione, che ordina due stati firmati dello stesso pacchetto

manifest è all'interno della firma perché è lì che si trovano i permessi
vivere. Firmare solo l'image consentirebbe a qualcuno di scambiare `cpak.json` con uno simile
allarga il sandbox e mantiene una firma valida.

Dimostra che il pacchetto proviene dall'elemento della configurazione di quel repository e non è stato alterato
sulla strada. Non dimostra che il software sia sicuro e non lo difende
contro un repository compromesso: il repository è l'identità da dimostrare.

## Quanto ti costa

- Nessuna chiave. La firma è senza chiave tramite l'identità OIDC del tuo elemento della configurazione, quindi esiste
  niente da generare, archiviare, ruotare o perdere.
- Nessun segreto. Il flusso di lavoro seguente utilizza `secrets.GITHUB_TOKEN`, ovvero GitHub
  crea per ogni corsa. Non aggiungi nulla alle impostazioni del repository.
- Circa venti secondi di flusso di lavoro per pubblicazione.
- Un numero che sale solo e un passaggio di firma per pubblicazione. Un nuovo
  manifest o una nuova image è un nuovo stato e un vecchio stato non può sostituirlo
  esso.

## Il flusso di lavoro

Aggiungi questo lavoro al flusso di lavoro che già invia la tua image o incollalo intero
e punta la fase di costruzione verso il tuo `Dockerfile`.

```yaml
name: Publish

on:
  push:
    branches: [main]

permissions:
  contents: read
  packages: write
  id-token: write

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}:main

      - uses: sigstore/cosign-installer@v3

      - name: Install cpak-sign
        run: |
          curl -fsSLO https://github.com/Containerpak/cpak/releases/latest/download/cpak-sign-linux-amd64
          install -Dm755 cpak-sign-linux-amd64 /usr/local/bin/cpak-sign

      - name: Sign the package state
        env:
          CPAK_REGISTRY_USERNAME: ${{ github.actor }}
          CPAK_REGISTRY_PASSWORD: ${{ secrets.GITHUB_TOKEN }}
        run: |
          cpak-sign state \
            --origin "github.com/${{ github.repository }}" \
            --image "ghcr.io/${{ github.repository }}:main" \
            --generation "${{ github.run_number }}"
          cosign sign-blob --yes --new-bundle-format=true \
            --bundle cpak-state.sigstore.json cpak-state
          cpak-sign attach --image "ghcr.io/${{ github.repository }}"
```

Le tre linee che fanno il lavoro sono le tre nell'ultimo passaggio. Il primo
scrive il payload, il secondo lo firma con l'identità di questo flusso di lavoro eseguito,
il terzo allega il risultato all'image nel registro.

`permissions: id-token: write` è ciò che consente alla corsa di dimostrare chi è. Senza di esso
`cosign` non ha identità con cui firmare e il passaggio non riesce.

## Cosa c'è nel carico utile

Il payload è un breve file di testo, un campo per riga, ed è il byte esatto
stringa che viene firmata. Puoi leggerlo:

```
cpak.signature.state.v1
abi=1
origin=github.com/example/app
manifest_sha256=6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b
image_digest=sha256:2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae
lock_sha256=
generation=12
```

Niente è un segreto e niente riguarda la macchina che lo farà
installare il pacchetto. `cpak verify-signature` prende gli stessi campi e controlla a
raggrupparli manualmente, in questo modo confermi ciò che hai pubblicato
senza installare nulla.

## La generazione

`--generation` ordina due stati con segno dello stesso pacchetto e cpak lo utilizza
per distinguere uno stato più recente da uno più vecchio. `github.run_number` è ragionevole
source: aumenta di uno ad ogni esecuzione del flusso di lavoro.

Deve continuare a salire. La ridenominazione o la override del file del flusso di lavoro si riavvia
`run_number` a 1, quindi se lo rinomini, passa a un numero che continua da
dove si era interrotta l'ultima pubblicazione.

## Tags e perché il digest è ciò che viene firmato

Una firma sopra un tag non varrebbe nulla: un tag può essere richiamato
un'altra image il giorno successivo alla firma. Quindi `cpak-sign state` risolve il
riferimento che gli dai e inserisce il digest in cui è stato risolto all'interno del payload.
La firma è la spilla.

Manifest v3 rende visibile la stessa regola prima della verifica della firma: il campo
`image` deve contenere un digest OCI. Continua a pubblicare i tag per il normale uso del
registry, poi scrivi in `cpak.json` il digest prodotto dalla build prima di creare lo stato
firmato. L'hash del manifest e il digest dell'immagine indicano così la stessa pubblicazione.

`cpak-sign state` rifiuta un riferimento che non sia un digest in `--image-digest`,
ad alta voce, piuttosto che firmare qualcosa che possa muoversi sotto di esso.

## Più di un'architettura

cpak misura l'image manifest per l'architettura su cui si sta installando, quindi
l'image multi-architettura necessita di uno stato firmato per architettura. Esegui il
passo di firma su un corridore di ciascuna architettura:

```yaml
strategy:
  matrix:
    runner: [ubuntu-latest, ubuntu-24.04-arm]
runs-on: ${{ matrix.runner }}
```

Ogni esecuzione risolve lo stesso tag in manifest per la propria architettura, segni
quel digest e allega il bundle a quelil manifest. Un'unica architettura
l'image non ha bisogno di tutto questo.

## Cosa ottengono i tuoi utenti

Il pacchetto viaggia con l'image e contiene il certificato e il file
prova di registro di trasparenza al suo interno. La verifica è offline: cpak la controlla
contro una root di fiducia fornita con cpak, quindi non aggiunge alcuna chiamata di rete a
scaricato, continua a funzionare durante un'interruzione di Sigstore e funzionerà ancora in seguito
su una macchina senza Internet, che è ciò che consente di controllare un pacchetto
di nuovo molto tempo dopo l'installazione.

## Riformattazione e cosa non interrompe una firma

L'hash manifest viene preso sul posto dello JSON cpak stesso codifica il tuo manifest come,
non oltre i byte del tuo file. Reindentare `cpak.json` o riordinarne le chiavi
non invalida la firma. Modificare un permesso, un'image, un file binario o un file
la dipendenza sì, e questo è il punto.

Se uno `cpak.lock.json` si trova accanto al manifest, `cpak-sign state` include il suo
hash e si rifiuta di firmare quando la serratura è stata costruita da un manifest diverso. Corri
Ancora `cpak lock cpak.json` e commit il risultato.

## Riferimento comando

`cpak-sign state` crea il carico utile:

| Bandiera         | Significato                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| `--manifest`     | Percorso verso manifest. Il valore predefinito è `cpak.json`.                                            |
| `--lock`         | Percorso verso la serratura. Il valore predefinito è `cpak.lock.json` accanto a manifest, quando esiste. |
| `--origin`       | Il repository da cui è pubblicato manifest.                                                              |
| `--image`        | Il riferimento da risolvere. Il valore predefinito è l'image dichiarata da manifest.                     |
| `--image-digest` | Un digest da firmare così com'è, per un registro che la corsa non può raggiungere.                       |
| `--generation`   | La generazione di questo stato. Inizia alle 1.                                                           |
| `--output`       | Dove è scritto il carico utile. Il valore predefinito è `cpak-state`, `-` per uscita standard.           |

`cpak-sign attach` pubblica il bundle:

| Bandiera   | Significato                                                                        |
| ---------- | ---------------------------------------------------------------------------------- |
| `--image`  | Il repository in cui risiede l'image firmata.                                      |
| `--state`  | Il payload che è stato firmato. Il valore predefinito è `cpak-state`.              |
| `--bundle` | Il bundle `cosign` ha scritto. Il valore predefinito è `cpak-state.sigstore.json`. |

`attach` legge il digest dell'image dallo stato firmato, quindi può sempre e solo
pubblicare contro l'image coperta dalla firma. Verifica prima il pacchetto
spinge qualunque cosa e rifiuta un fascio firmato da un'identità che non può
parla a nome della tua origine, perché è una firma che ogni utente rifiuterebbe.

`CPAK_REGISTRY_USERNAME` e `CPAK_REGISTRY_PASSWORD` sono entrambi i comandi
autenticarsi nel registro. Una password non è mai una bandiera.

## Registri

La firma è allegata come riferimento OCI dell'image, che è cosa
`cosign` fa in modo nativo e ciò che supporta GHCR. `attach` fallisce se il registro
memorizza manifest senza indicizzarlo come referrer, perché cpak trova un
firma tramite l'API dei referrer e una firma che nessuno riesce a trovare non è una firma
firma pubblicata.

## Costruisci cpak: firma te stesso

Se preferisci non scaricare un file binario:

```sh
git clone --depth 1 --branch v2 https://github.com/Containerpak/cpak /tmp/cpak
go -C /tmp/cpak build -o /usr/local/bin/cpak-sign ./cmd/cpak-sign
```
