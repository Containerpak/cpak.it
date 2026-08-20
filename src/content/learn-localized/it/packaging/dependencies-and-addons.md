Un secondo pacchetto può unirsi a un'applicazione in tre modi. La scelta dipende dal fatto che sia obbligatorio e dalla necessità di condividere il filesystem del pacchetto principale.

## Dipendenza nested

Usa la modalità nested predefinita per uno strumento obbligatorio che deve mantenere la propria sandbox. Il pacchetto principale invoca soltanto i comandi esportati e la dipendenza riceve l'intersezione dei limiti di entrambi. Bottles usa questa relazione per UMU.

## Dipendenza layer

Usa `mode: layer` quando i file obbligatori devono apparire direttamente nel filesystem del pacchetto principale. I layer della dipendenza vengono composti sotto l'applicazione. È una relazione tra filesystem, quindi non viene creato un servizio separato.

## Addon opzionale

Usa un addon quando l'applicazione funziona senza di esso e l'utente deve poter scegliere. L'addon viene installato al primo utilizzo e i suoi layer vengono aggiunti al pacchetto principale soltanto mentre è abilitato.

```
cpak addon enable github.com/example/editor github.com/example/sdk-go
cpak addon disable github.com/example/editor github.com/example/sdk-go
```

Installa i file nei percorsi attesi dall'applicazione oppure dichiara un provider con export espliciti per binari, librerie, include, pkg-config e CMake. Verifica lo stato abilitato e quello disabilitato. Il pacchetto principale deve continuare ad avviarsi dopo la rimozione dell'addon.

[Dipendenze e addon](/docs/dependencies-addons) include esempi per Steam e gli SDK.
