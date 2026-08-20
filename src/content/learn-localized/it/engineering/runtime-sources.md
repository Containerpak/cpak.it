Alcuni programmi possono essere pacchettizzati ma non ridistribuiti in un'immagine OCI pubblica. Una runtime source mantiene pubblica la ricetta cpak mentre la macchina dell'utente scarica l'artefatto originale dal vendor.

## Dichiarare un artefatto preciso

```
"runtime_sources": [
  {
    "name": "editor-amd64.deb",
    "url": "https://vendor.example/download/editor-amd64.deb",
    "sha256": "9f4d...64 hexadecimal characters...",
    "size": 48310272,
    "installer": "deb-extract",
    "architecture": "amd64"
  }
]
```

L'URL e ogni redirect devono usare HTTPS. cpak confronta la dimensione dichiarata con i byte ricevuti, verifica SHA-256 e applica il filtro di architettura per impedire l'installazione dell'artefatto sbagliato.

## Scegliere il contratto di installazione più piccolo

`deb-extract` e `rpm` estraggono il payload senza trasformare cpak nella distribuzione host. `tar` gestisce gli archivi. `file` installa un singolo file in un percorso esplicito sotto `/opt`. `dpkg` rimane disponibile quando gli script del maintainer sono necessari al funzionamento dell'installazione.

Non scegliere `dpkg` soltanto perché il file termina in `.deb`. Usalo quando gli script sono necessari e sono stati revisionati. Per la maggior parte delle applicazioni desktop, l'estrazione riduce il codice a cui affidare l'installazione.

## Preparare tutto prima di cambiare versione

cpak scarica in un file temporaneo, limita lo stream alla dimensione dichiarata, verifica l'hash e installa il contenuto in un layer runtime gestito. Un aggiornamento prepara il nuovo manifest, i layer OCI, le runtime source, gli export e il record del database, quindi attiva la versione soltanto quando tutte le fasi sono riuscite.

Una runtime source non è un canale di aggiornamento mobile. Se il vendor modifica l'artefatto, una nuova revisione del pacchetto deve dichiarare dimensione o digest differenti. La source installata rimane legata a quella versione e partecipa al rollback.

## Conservare nella ricetta i metadati per l'utente

L'immagine OCI ridotta contiene ancora wrapper, icona originale, voce desktop e file di integrazione. Il payload del vendor fornisce il programma; la ricetta fornisce il contratto cpak e un percorso di avvio stabile.

[Guida al manifest](/docs/manifest) elenca i campi supportati e le regole di validazione.
