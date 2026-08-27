---
title: Accesso al selettore di file
description: Concedi file e cartelle selezionati senza esporre la home host.
tags: [permissions, files, desktop]
section: runtime
order: 30
---

# Accesso al selettore file

Un'applicazione cpak ha una home persistente privata a meno che il suo manifest non monti esplicitamente la home host. L'permesso di selezione file consente all'utente di portare singoli file o cartelle host in quell'ambiente quando sono necessari.

L'applicazione apre il solito selettore di file nativo. cpak gestisce la richiesta sull'host, applica la politica del pacchetto e monta ciascuna selezione accettata sotto `/run/cpak/grants`. Il percorso restituito all'applicazione punta sempre all'albero di grant privato.

Alcuni selettori desktop possono presentare autonomamente l'ambito e le scelte di durata. Quando non possono, cpak utilizza l'adattatore di dialogo desktop configurato e ricorre alla finestra di dialogo integrata. Chiudendo o negando la seconda finestra di dialogo si annulla la richiesta.

Una selezione già coperta dalle voci `filesystem` del pacchetto mantiene il suo percorso normale e non necessita di una seconda conferma. La finestra di dialogo integrata segue la preferenza chiara o scura host e il colore standard del desktop libero, inclusi gli accenti personalizzati pubblicati dal desktop.

## Politica manifest

Abilita solo le operazioni utilizzate dall'applicazione:

```json
"filePicker": {
  "openFile": true,
  "openFolder": true,
  "saveFile": true,
  "persistent": true,
  "containingFolder": true
}
```

| Campo              | Effetto                                                                    |
| ------------------ | -------------------------------------------------------------------------- |
| `openFile`         | Seleziona uno o più file esistenti.                                        |
| `openFolder`       | Seleziona una cartella esistente.                                          |
| `saveFile`         | Seleziona una destinazione scrivibile per un nuovo file.                   |
| `persistent`       | Offri un accesso che può essere ripristinato negli avvii successivi.       |
| `containingFolder` | Offri la cartella contenente il file selezionato come contesto aggiuntivo. |

La selezione di un file garantisce la sola lettura del file per impostazione predefinita. L'accesso alla cartella contenente è una decisione separata dell'utente e viene visualizzato solo quando manifest lo consente. È utile per gli eseguibili che caricano file oltre a se stessi, mentre i documenti e i caricamenti possono rimanere isolati in un file.

La selezione di una cartella garantisce la sola lettura della cartella scelta. Una richiesta di salvataggio concede la lettura/scrittura alla directory principale in modo che l'applicazione possa creare il nome selezionato e completare un salvataggio atomico.

Utilizzare un sottopercorso home portatile quando il pacchetto necessita sempre di una directory dell'applicazione ma non deve ricevere la home host completa:

```json
"filesystem": [
  {"path": "home/.local/share/example", "access": "read-write"}
]
```

Le selezioni all'interno di quella directory mantengono il loro percorso normale e saltano la conferma cpak. I file selezionati altrove utilizzano una grant dinamica.

## Persistenza

Una grant di sessione appartiene all'ambiente applicativo corrente e scompare quando si interrompe. Una grant persistente viene salvata per quel pacchetto, montata nuovamente all'avvio e rimane visibile finché l'utente non la revoca.

Il gestore grafico elenca le grant persistenti e interrompe un'applicazione in esecuzione dopo la revoca in modo che il vecchio montaggio non possa rimanere attivo:

```sh
cpak grant manage github.com/example/app
```

Le stesse operazioni sono disponibili per gli script:

```sh
cpak grant list github.com/example/app
cpak grant list github.com/example/app --json
cpak grant revoke github.com/example/app GRANT_ID
```

Un prefisso ID viene accettato quando identifica una grant.

## Flusso della richiesta

Una richiesta attraversa il confine del pacchetto attraverso una sequenza fissa:

1. manifest viene controllata per la funzionalità di apertura, cartella o salvataggio richiesta.
2. Il selettore host restituisce uno o più percorsi di file locali.
3. cpak richiede qualsiasi cartella principale opzionale o accesso persistente non raccolto dal selezionatore.
4. broker risolve e apre ogni oggetto selezionato sull'host.
5. Lo spazio dei nomi del montaggio attivo riceve un montaggio limitato e l'applicazione riceve il suo guest path.

broker accetta al massimo 128 percorsi e rifiuta URI remoti, filtri non validi, nomi di salvataggio non validi e selezioni che cambiano tipo durante l'apertura. Un file normale e una directory producono set di descrittori diversi in modo che l'operatore di montaggio possa verificare l'oggetto previsto prima di allegarlo.

Il percorso dei risultati è stabile per l'identità della grant. Un singolo file normalmente appare in `/run/cpak/grants/GRANT_ID/FILE_NAME`. Una grant della cartella contenente monta la directory e restituisce il figlio selezionato sotto di essa. Le applicazioni dovrebbero utilizzare il percorso restituito invece di costruire un percorso all'interno dell'albero delle grant.

## Integrazione dell'applicazione

Le applicazioni GTK possono mantenere il normale selettore di file. cpak inserisce un adattatore bus desktop nell'ambiente dell'applicazione e intercetta le richieste di selezione file prima di inoltrare qualsiasi accesso al bus di sessione consentito da manifest. Senza il permesso generale del bus di sessione, l'adattatore rifiuta destinazioni non correlate.

Le applicazioni che necessitano di un'integrazione diretta possono utilizzare lo shim installato:

```sh
cpak-file-picker open-file \
  --title "Select an executable" \
  --accept-label "Run" \
  --filter "Windows executables|*.exe;*.msi"
```

Utilizzare `--multiple` per più file, `open-folder` per una directory o `save-file --suggested-name report.pdf` per una destinazione. Un comando riuscito stampa i percorsi guest, uno per riga.

Lo broker trasporta richieste strutturate su un Unix socket privato. Gli oggetti selezionati vengono passati allo spazio dei nomi di montaggio in esecuzione tramite descrittori di file, quindi il montaggio rimane collegato all'oggetto approvato dall'utente anche se il suo percorso host cambia. L'adattatore desktop può utilizzare i servizi disponibili nella sessione corrente, ma il protocollo di grant e runtime headless non dipendono da D-Bus.

L'adattatore bus desktop limitato inoltra solo le chiamate accettate dalla politica `sessionBus` del manifest. Le chiamate del selettore file rimangono disponibili con il solo `filePicker`. Le applicazioni GTK e GIO ricevono così l'API prevista senza esporre servizi bus non correlati.

Le conferme di runtime utilizzano il backend selezionato dall'utente o dalla distribuzione. Consulta [Adattatori di dialogo desktop](/docs/desktop-dialogs) per la corrispondenza automatica del desktop, i file di configurazione, i tag di build e le posizioni degli helper esterni.

## Ambienti senza testa

Una richiesta interattiva non viene chiusa quando non è disponibile alcun selettore desktop supportato. Le grant persistenti possono comunque essere elencate e revocate dalla CLI. Un flusso di lavoro del server dovrebbe dichiarare un percorso ristretto del filesystem in manifest o utilizzare una grant persistente prestabilita invece di provare ad aprire un selettore grafico.

Anche la cancellazione è chiusa per impostazione predefinita. La chiusura del selettore, il rifiuto della conferma cpak, la ricezione di una risposta dell'adattatore non valida o la perdita della connessione broker non restituiscono alcun nuovo montaggio all'applicazione.
