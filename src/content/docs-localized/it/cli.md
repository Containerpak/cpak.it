---
title: Riferimento CLI
description: Gli attuali comandi v2 per pacchetti, istanze, sviluppo, storage e integrazione di sistema.
tags: [cli, reference]
section: operations
order: 10
---
# Riferimento CLI

Esegui `cpak <command> --help` per i flag accettati dalla build installata. Le tabelle seguenti descrivono l'attuale superficie di comando v2.

## Ciclo di vita del pacchetto

| Comando | Scopo |
| ---------- | ---------------------------------------------------------------- |
| `install` | Installa un pacchetto da un'origine Git.                             |
| `run` | Installa quando necessario, avvia l'ambiente e avvia un file binario. |
| `list` | Elenca i pacchetti installati. Accetta `--json`.                       |
| `update` | Aggiorna un pacchetto o ogni pacchetto installato.                   |
| `rollback` | Ripristina la versione installata precedente.                          |
| `remove` | Rimuovere un pacchetto installato e le relative risorse runtime di proprietà.    |
| `extract` | Esporta un pacchetto risolto come archivio tar.                      |
| `alias` | Imposta, rimuovi o elenca gli alias di origine locale.                       |

Installa, esegui, rimuovi, arresta e accetta i selettori di ramo, rilascio o commit ove applicabile.

## Istanze in esecuzione

| Comando | Scopo |
| ------------- | ---------------------------------------------------------------------- |
| `launch` | Avvia un comando nell'ambiente del pacchetto attivo.                   |
| `shell` | Apri una shell interattiva in un'istanza del pacchetto.                      |
| `logs` | Stampa o segui l'output dell'istanza.                                      |
| `stop` | Arresta un'istanza in esecuzione.                                              |
| `service` | Avvia il servizio locale cpak.                                         |
| `orchestrate` | Avvia diverse applicazioni con ordini, controlli di integrità e nuovi tentativi. |

Utilizza `--instance` sui comandi supportati per selezionare un'istanza denominata dello stesso pacchetto.

## Sviluppo del pacchetto

| Comando | Scopo |
| ------------------ | ------------------------------------------------------- |
| `init` | Genera uno scheletro manifest v2.                        |
| `validate` | Convalida `cpak.json`.                                   |
| `gen-schema` | Scrivi lo schema generato dall'attuale runtime.      |
| `migrate-manifest` | Converti un manifest v1 in v2.                            |
| `lock` | Risolvi manifest e image OCI in `cpak.lock.json`. |
| `test` | Installa e controlla un pacchetto locale in un Store temporaneo. |
| `dev` | Testa un pacchetto locale e avvia il binario selezionato.    |

`test` e `dev` accettano `--origin` per dipendenze relative e `--lock` per un file di blocco esplicito.

## Composizione e politica

| Comando | Scopo |
| ---------- | ----------------------------------------------------------------- |
| `addon` | Ispeziona componenti aggiuntivi e slot, seleziona fornitori o modifica l'attivazione. |
| `override` | Sostituisci un valore di permesso locale.                               |
| `grant` | Elenca, gestisci o revoca le grant di file persistenti.                   |
| `doctor` | Segnala le capacità dell'runtime dell'host.                                 |
| `audit` | Controlla l'integrità del Store locale e, facoltativamente, riparalo.             |

Utilizzare `cpak addon slots` e `cpak addon providers` per ispezionare lo stato provider,
quindi `cpak addon use` per selezionare un provider esclusivo. `enable` e `disable`
rimangono disponibili per scelte aggiuntive esplicite. È disponibile l'uscita JSON per
`list`, `slots` e `providers`.

`cpak update --non-interactive` rifiuta gli aggiornamenti che richiedono permessi aggiuntivi. L'output JSON è disponibile per aggiornamento, elenco, medico, elenco alias e Garbage Collection dove mostrato dalla guida del comando.

## Conservazione

| Comando | Scopo |
| ------- | ---------------------------------------------------- |
| `dedup` | Deduplica file uguali sotto un percorso selezionato.       |
| `gc` | Segnala o elimina layer senza riferimenti e memorizza nella cache i dati. |

Esegui `cpak gc --json` prima di `cpak gc --apply` quando si automatizza la pulizia.

## Runtime e accesso al registro

| Comando | Scopo |
| ------------- | --------------------------------------------------------------------- |
| `auth` | Associa l'accesso al registro a un'origine del pacchetto e al repository OCI. |
| `self-update` | Verifica o installa un binario ufficiale cpak più recente.             |

Utilizza `cpak auth login`, `logout`, `list` o `status` per gestire l'accesso privato al registro. Leggere [Registri privati OCI](/docs/registry-authentication) prima di aggiungere un token separato host.

`cpak self-update --check` segnala una versione disponibile e lascia invariato il binario installato. Le build del gestore pacchetti mantengono l'avviso sulla versione e delegano la override al gestore pacchetti di sistema. Vedere [Aggiorna cpak runtime](/docs/runtime-updates).