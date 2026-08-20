---
title: Scegli e gestisci un registro OCI
description: Seleziona un registro, pubblica image cpak, abilita pull parziali ed esegui un registro privato in modo sicuro.
tags: [registry, oci, hosting, zstd]
section: packages
order: 45
---
# Scegli e gestisci un registro OCI

Un pacchetto cpak mantiene il suo manifest in Git mentre un registro OCI fornisce il suo contenuto di image immutabile. cpak implementa il client di distribuzione OCI e inserisce manifest e layer direttamente nel suo archivio locale.

## Compatibilità con il client

cpak accetta manifest di image OCI, indici OCI, manifest dello schema 2 Docker ed elenchi Docker manifest. L'image selezionata deve contenere un Linux manifest per l'architettura host.

Il registro deve fornire:

- API di distribuzione OCI
Download di manifest e BLOB -  tramite tag o digest SHA-256
- dimensioni del descrittore e contenuto del blob corretti
- HTTPS, ad eccezione di un registro associato all'interfaccia di loopback locale
- Pull anonimi o autenticazione Basic/Bearer

cpak verifica manifest e i digest dei layer prima di pubblicare il contenuto nel proprio archivio locale. Un reindirizzamento del registro può puntare all'storage di oggetti HTTPS o a una rete CDN. Le credenziali del registro non vengono mai inoltrate a quell'host. Un'autenticazione separata host deve essere approvata esplicitamente tramite `cpak auth login`.

## Scegli un servizio

| Registro | Buona vestibilità | Lavoro operativo |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [Registro container GitHub](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry) | Pacchetti la cui sorgente e CI sono già presenti su GitHub | Gestito da GitHub; la visibilità del pacchetto e l'accesso al repository rimangono impostazioni separate |
| [Porto](https://goharbor.io/docs/) | Team che necessitano di un'interfaccia utente Web, policy di progetto, replica, scansione e conservazione | Gestire Harbour, il suo database, l'storage di oggetti, i backup e gli aggiornamenti |
| [Distribuzione CNCF](https://distribution.github.io/distribution/about/deploying/) | Un piccolo registro privato o pubblico con una superficie di servizio ristretta | Fornire TLS, autenticazione, storage, monitoraggio, backup e garbage collection |
| Un altro registro OCI | Infrastruttura esistente che già serve image OCI conformi | Verifica i manifesti, i reindirizzamenti, l'autenticazione e il comportamento dell'intervallo di byte prima del rilascio |

I pacchetti pubblici funzionano meglio con l'accesso BLOB anonimo. I repository privati necessitano di un'associazione di credenziali per ogni origine del pacchetto e per l'esatto repository del registro. Leggi [Registri privati OCI](/docs/registry-authentication) per il modello di associazione.

## Pubblica layer OCI regolari

I layer gzip e zstd funzionano su registri conformi. cpak verifica e decomprime ogni nuovo layer direttamente nella sua rappresentazione FVS conservata.

Qualsiasi editore OCI può produrre l'image. Mantieni il manifest finale nel formato OCI quando il sistema di compilazione lo supporta, pubblica gli indici dell'architettura solo per le architetture che sono state testate e registra il digest risultante tramite `cpak lock`.

## Abilita tiri parziali

`zstd:chunked` aggiunge un sommario a un layer zstd. Il descrittore del layer riporta la posizione e il checksum di quella tabella. cpak può ispezionarlo con una richiesta di intervallo di byte, riutilizzare il contenuto completo del file già presente in FVS e scaricare solo gli intervalli compressi necessari per i file mancanti.

cpak seleziona intervalli parziali quando il contenuto FVS noto li rende più economici di un flusso completo. Un Store vuoto utilizza un flusso verificato completo. Un warm store può ignorare i payload dei file già indicizzati da FVS. L'image pubblicata rimane identica per entrambi i percorsi.

Podman può pubblicare direttamente questo formato:

```bash
podman push \
  --format oci \
  --compression-format zstd:chunked \
  --force-compression \
  ghcr.io/example/application:main
```

Il registro e ogni CDN o reindirizzamento di storage di oggetti di fronte ad esso devono preservare le richieste `Range` e restituire `206 Partial Content` con un `Content-Range` esatto. cpak verifica il checksum della tabella compressa, i digest dei file, gli offset e le lunghezze delle risposte. Annotazioni mancanti, un proxy non supportato o una risposta non valida disabilitano il percorso parziale per quel layer e cpak scarica invece il layer zstd completo.

Le normali image gzip e zstd rimangono completamente supportate. `zstd:chunked` aggiunge il percorso di trasferimento parziale opzionale.

## GitHub Esempio di azioni

La seguente fase push pubblica un'image OCI con metadati del blocco dopo l'autenticazione:

```yaml
- name: Login to GHCR
  run: echo "${{ secrets.GITHUB_TOKEN }}" | podman login ghcr.io --username "${{ github.actor }}" --password-stdin

- name: Publish image
  run: |
    podman build --format oci --tag ghcr.io/example/application:main .
    podman push --format oci --compression-format zstd:chunked --force-compression ghcr.io/example/application:main
```

Concedere il flusso di lavoro `packages: write` e `contents: read`. Non inserire un token di registro nel manifest, nel repository, nell'image o nel testo del flusso di lavoro.

## Lista di controllo per il self-hosting

Inizia con un'implementazione di distribuzione OCI mantenuta e applica la relativa guida alla distribuzione di produzione.

Prima di pubblicare i pacchetti, configura:

- un nome e certificato HTTPS stabili
- autenticazione e permesso del repository quando i pull non sono pubblici
- filesystem persistente o storage di oggetti
- backup per la configurazione e il contenuto del registro
- regole di monitoraggio e conservazione dell'storage
- garbage collection per manifest e BLOB senza riferimenti
- limiti di richiesta che consentono manifesti di image e trasferimenti BLOB di grandi dimensioni
- regole proxy e CDN che mantengono `Range`, `Content-Range`, `Content-Length` e `Docker-Content-Digest`

Un registro con storage del filesystem locale dovrebbe essere eseguito come singolo scrittore a meno che l'storage non sia condivisa correttamente. I frontend replicati necessitano di un backend di storage comune e di uno stato di autenticazione coerente. Segui il modello di storage documentato dal registro selezionato invece di copiare la directory dei dati di un nodo tra istanze attive.

La Garbage Collection del Registro di sistema rimuove i BLOB remoti dopo la scomparsa del riferimento manifest finale. `cpak gc` esegue l'operazione corrispondente nei negozi FVS e DaBaDee locali. La migrazione dello spazio di storage utilizza `cpak storage migrate`.

## Verificare prima del rilascio

Controlla l'endpoint del registro e quindi esercita il pacchetto tramite cpak:

```bash
curl --fail --silent --show-error https://registry.example/v2/
cpak validate cpak.json
cpak lock cpak.json
cpak test cpak.json
```

Ripeti il test su ogni architettura pubblicata. Testalo una volta con un Store cpak vuoto, quindi aggiorna dall'image precedente in modo che i layer condivisi, i pull parziali, il riutilizzo FVS e il rollback vengano eseguiti rispetto alle risposte reali del registro.

Per un pacchetto privato, ripetere il test attraverso lo stesso flusso `cpak auth` che seguiranno gli utenti. Ciò verifica direttamente l'ambito delle credenziali cpak e la policy token-host.

## Comportamento di errore

cpak tratta gli errori di ottimizzazione separatamente dagli errori di integrità:

- Gli intervalli di byte non disponibili rientrano nel download di un layer completo
- Le annotazioni `zstd:chunked` mancanti utilizzano il normale percorso gzip o zstd
- a digest o mancata corrispondenza delle dimensioni rifiuta il layer
- a manifest senza un'architettura Linux corrispondente viene rifiutato
- una richiesta di token cross-host non approvata viene rifiutata

Ciò mantiene la compatibilità del pacchetto legata all'image OCI, mentre le funzionalità prestazionali specifiche del registro rimangono facoltative.