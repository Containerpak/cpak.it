---
title: Host actions
description: Configurare servizi host tipizzati e basati su criteri per un'applicazione.
tags: [broker, permissions, containers]
section: runtime
order: 35
---
# Azioni dell'host

`hostActions` garantisce le funzionalità di un pacchetto da un provider implementato da cpak. Ogni provider accetta una richiesta strutturata finita e la associa a un'operazione host fissa. Gli eseguibili host arbitrari si trovano all'esterno di questa interfaccia.

## container provider

Il primo provider offre accesso controllato ai motori container host supportati:

```json
"hostActions": [
  {
    "provider": "containers",
    "capabilities": ["read", "manage-owned", "exec-owned"]
  }
]
```

| Capacità | Accesso |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| `read` | Elenca e controlla container, image, log e statistiche host.                                                     |
| `manage-owned` | Crea container con l'etichetta di proprietà del pacchetto, quindi avvia, arresta, riavvia o rimuovi solo tali container. |
| `exec-owned` | Esegui un comando solo all'interno di un container di proprietà del pacchetto richiedente.                                          |

`manage-owned` è limitato ai container che portano l'etichetta di proprietà del pacco richiedente. `exec-owned` esegue i comandi all'interno dei container di proprietà.

## Shim di compatibilità

Quando provider è abilitato, cpak inserisce gli shim `podman` e `docker` indipendenti nel pacchetto. Chiamando `podman` si seleziona il motore host Podman e chiamando `docker` si seleziona il motore host Docker. Visual Studio Code può utilizzare entrambi i motori tramite gli stessi criteri provider limitati.

Entrambi gli shim espongono lo stesso sottoinsieme CLI finito e convertono ogni invocazione in una richiesta provider. L'output standard, l'errore standard, lo stato di uscita e l'annullamento passano attraverso lo spessore. Se il motore selezionato non è installato sull'host, il comando fallisce con un errore di backend diretto non disponibile mentre l'altro spessore rimane utilizzabile.

I comandi e i flag non supportati falliscono localmente. La modalità privilegiata, le grant dei dispositivi, gli spazi dei nomi host e le opzioni di backend arbitrarie non vengono inoltrate.

## Politica del filesystem

Un container nidificato può montare percorsi di origine presenti nelil permesso cpak `filesystem`. broker risolve i link simbolici prima del confronto e preserva l'accesso in sola lettura.

## Pacchetti annidati

Uno cpak nidificato riceve l'intersezione delle capacità di azione host padre e figlio, incluse gli override dell'utente locale.

## Manifesti legacy

Il vecchio campo `allowedHostCommands` rimane leggibile per la migrazione. cpak converte `notify-send`, `xdg-open` e `cpak-launch-app` nelle relative permessi digitate. Le voci esterne a questa mappatura non superano la convalida manifest.