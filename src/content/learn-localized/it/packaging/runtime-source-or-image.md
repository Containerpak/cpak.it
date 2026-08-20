Inserisci l'applicazione nell'immagine OCI quando la licenza ne consente la ridistribuzione. L'immagine diventa un runtime completo, identificato dal contenuto, che i registri possono conservare in cache e cpak può deduplicare per layer.

Usa una runtime source quando il software può essere pacchettizzato, ma il vendor richiede che ogni utente scarichi l'artefatto originale. L'immagine rimane piccola e contiene wrapper, icona, voce desktop e file di integrazione.

## Una runtime source rimane fissata

```
"runtime_sources": [
  {
    "url": "https://vendor.example/editor.deb",
    "sha256": "9f4d...",
    "size": 48310272,
    "installer": "deb-extract",
    "architecture": "amd64"
  }
]
```

cpak accetta URL HTTPS, verifica dimensione esatta e SHA-256, quindi installa il contenuto in un layer gestito. Se il vendor cambia il file, deve cambiare anche la revisione del pacchetto. Un URL mobile non può modificare silenziosamente un'installazione esistente.

## Non eseguire gli script del pacchetto senza motivo

Usa `deb-extract` o `rpm` quando serve soltanto il payload. Usa `dpkg` esclusivamente quando sono necessari script del maintainer già revisionati. Gli archivi tar usano `tar`; un singolo artefatto usa `file` con una destinazione esplicita sotto `/opt`.

Verifica il pacchetto con una cache delle runtime source vuota. Un avvio riuscito su una macchina che possiede già il programma del vendor non dimostra che la ricetta sia corretta.
