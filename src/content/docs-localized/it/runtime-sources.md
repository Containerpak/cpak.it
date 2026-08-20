---
title: Sorgenti di esecuzione
description: Aggiungi archivi verificati, pacchetti nativi o file del fornitore al momento dell'installazione.
tags: [manifest, packages, runtime]
section: packages
order: 45
---
# Origini runtime

La maggior parte dei file del pacchetto appartengono all'image OCI. Una runtime source copre il più piccolo
insieme di file che devono provenire da un artefatto HTTPS separato, ad esempio il fornitore
file di integrazione o un pacchetto nativo pubblicato indipendentemente dall'image.

cpak scarica ogni sorgente durante l'installazione, ne verifica la dimensione dichiarata e
SHA-256, quindi lo installa in un layer gestito. Il layer segue il pacchetto
attraverso aggiornamenti, rollback, audit e rimozione.

## Voce manifest

Ciascuna fonte dichiara un programma di installazione:

```json
"runtime_sources": [
  {
    "name": "desktop-integration-1.0.0.tar.gz",
    "url": "https://downloads.example.org/desktop-integration-1.0.0.tar.gz",
    "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "size": 4096,
    "installer": "tar"
  }
]
```

`name` è facoltativo e deve essere un nome file semplice. Senza di esso, cpak utilizza il file
nome dall'URL. L'URL deve utilizzare HTTPS e non può reindirizzare a un sito non sicuro
scaricare.

## Installatori

| Installatore | Artefatto accettato | Requisito nell'ambiente del pacchetto |
| ------------- | -------------------------------- | -------------------------------------- |
| `tar` | Archivio tar non compresso o gzip | Nessuno |
| `dpkg` | Pacchetto Debian | `/usr/bin/dpkg` |
| `deb-extract` | Pacchetto Debian | `/usr/bin/dpkg-deb` |
| `rpm` | Pacchetto RPM | `/usr/bin/rpm` |
| `file` | File singolo | Nessuno |

I programmi di installazione nativi vengono eseguiti all'interno della root del pacchetto, quindi le loro dipendenze e
gli script vedono lo stesso filesystem che diventerà il layer gestito. Scegli un
programma di installazione esistente nell'image della piattaforma selezionata.

`dpkg` controlla le dipendenze dei pacchetti ed esegue gli script del manutentore. `deb-extract`
decomprime solo l'archivio dati Debian. È destinato ai pacchetti i cui file dichiarati
i nomi delle dipendenze non corrispondono più alla piattaforma anche se lo è il ABI richiesto
presente. Non esegue `preinst`, `postinst`, `prerm` o `postrm`.

Il programma di installazione di `tar` scrive i percorsi di archivio relativi a `/` nel pacchetto. Un fascicolo
memorizzato come diventa `usr/share/applications/example.desktop`
`/usr/share/applications/example.desktop`. Percorsi assoluti, attraversamento genitore,
i collegamenti esterni alla radice del pacchetto e le voci del dispositivo vengono rifiutate.

Il programma di installazione di `file` copia un artefatto verificato nello `destination` dichiarato.
La destinazione deve essere un percorso assoluto inferiore a `/opt` e non può contenere l'elemento principale
trasversale e non può sostituire un collegamento simbolico:

```json
{
  "name": "application.jar",
  "url": "https://downloads.example.org/application.jar",
  "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "size": 4096,
  "installer": "file",
  "destination": "/opt/application/application.jar"
}
```

## Quando usarne uno

Conserva i normali file dell'applicazione nella build OCI. Questo dà registri e cpak
layer stabili da memorizzare nella cache e da deduplicare. Utilizzare una runtime source quando separata
l'artefatto fa parte del contratto del pacchetto e non può essere ragionevolmente copiato nel file
image pubblicata.

Ciò copre anche il software la cui licenza non consente la pubblicazione a terzi
il carico utile dell'applicazione. L'image OCI può contenere il runtime ridistribuibile,
wrapper e integrazione desktop mentre `runtime_sources` punta al funzionario
download del fornitore. L'installazione cpak dell'utente scarica l'artefatto aggiunto
da quell'origine e crea il layer gestito localmente.

Non utilizzare le origini runtime come passaggio di download non controllato. Appunta la dimensione esatta e
SHA-256 in `cpak.json`, pubblica URL di artefatti immutabili e rigenera il blocco
file quando la fonte cambia.

## Verificare una fonte

Crea o scarica l'artefatto in CI, quindi confrontalo prima con manifest
pubblicazione:

```bash
test "$(sha256sum desktop-integration-1.0.0.tar.gz | cut -d' ' -f1)" = \
  "$(jq -r '.runtime_sources[0].sha256' cpak.json)"
test "$(stat -c '%s' desktop-integration-1.0.0.tar.gz)" = \
  "$(jq -r '.runtime_sources[0].size' cpak.json)"
cpak validate cpak.json
```

Un'installazione si interrompe prima di modificare il pacchetto attivo quando il download, le dimensioni,
checksum, programma di installazione o layout di archivio non sono validi.