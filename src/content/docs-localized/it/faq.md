---
title: Domande frequenti
description: Risposte brevi su demoni, image OCI, portabilità, Flatpak, Docker, archivi di pacchetti e stato dell'applicazione.
tags: [faq, concepts]
section: project
order: 30
---
# Domande frequenti

## cpak ha bisogno di Docker o Podman?

No. Gli autori del pacchetto possono utilizzare qualsiasi builder OCI standard in CI. Lo cpak runtime installato estrae e monta direttamente il contenuto OCI.

## Un pacchetto cpak è un'image OCI?

L'image contiene file dell'applicazione. Il pacchetto è l'origine Git più il relativo manifest convalidato, il riferimento all'origine selezionato, il digest dell'image risolto, le dipendenze, i permessi, le esportazioni desktop e lo stato locale.

## È richiesto lo Store?

No. Installa qualsiasi pacchetto valido in base alla sua origine Git. Lo Store fornisce metadati e contenuti multimediali di rilevamento esaminati.

## In cosa cpak è diverso da Flatpak?

cpak utilizza un contenuto Git manifest, OCI, un binario runtime, layer indirizzati al contenuto, dipendenze dirette del pacchetto, componenti aggiuntivi e operazioni host basate su policy.

I formati hanno sandbox e contratti di distribuzione diversi. Le applicazioni possono rilevare un avvio cpak tramite `CPAK_CONTAINER_ID`.

## cpak condivide i tempi di esecuzione di base?

SÌ. I layer OCI uguali vengono memorizzati una volta e FVS memorizza i blocchi di contenuto uguali una volta su diversi layout di layer. Le image di base condivise rimangono input di build OCI.

## Dove vanno a finire i dati dell'applicazione?

Ogni pacchetto ha uno stato scrivibile separato dai layer di image immutabili. Le permessi esplicite del filesystem possono anche esporre percorsi host selezionati. Rimuovere un pacchetto ed eliminare il suo stato è diverso dalla raccolta dei rifiuti di layer immutabili inutilizzati.

## Un pacchetto può usarne un altro?

Le dipendenze richieste vengono installate con il genitore. I componenti aggiuntivi opzionali sono abilitati per ogni applicazione. cpak nidificato aggiunge un percorso di esecuzione controllato per una dipendenza che necessita del proprio ambiente di pacchetto.

## Posso aggiungere un SDK di lingua a un editor?

SÌ. Installa un pacchetto SDK supportato e abilitalo come componente aggiuntivo per quell'editor. La toolchain diventa parte della vista dell'editor runtime.

## cpak funziona senza systemd?

Sì, a condizione che host fornisca le funzionalità del kernel richieste e le risorse della sessione utente. I limiti delegati dei cgroup dipendono dal gestore dei cgroup host e potrebbero non essere disponibili.

## Gli aggiornamenti sono automatici?

`cpak update` aggiorna una o tutte le applicazioni installate. Le nuove grant di permessi richiedono l'approvazione. `--non-interactive` rifiuta gli aggiornamenti che richiedono accesso aggiuntivo.

Il binario cpak verifica la presenza di una nuova versione ufficiale una volta al giorno. Le installazioni desktop possono mostrare una finestra di dialogo di aggiornamento e installarla dopo la conferma. Le build gestite dalla distribuzione segnalano l'aggiornamento ma lasciano l'installazione al gestore dei pacchetti di sistema.

## cpak può estrarre un'image privata?

SÌ. `cpak auth login` memorizza una credenziale esplicita per l'origine di un pacchetto e l'esatto repository OCI dichiarato dal suo manifest. Le credenziali desktop utilizzano i servizi segreti. I sistemi headless possono inserire un file di credenziali `0600` in modalità di proprietà dell'utente. I collegamenti delle credenziali cpak rimangono indipendenti dai motori dei container.

## Posso tornare indietro?

SÌ. cpak mantiene la versione del pacchetto installato precedente per `cpak rollback`. Le migrazioni dei dati gestiti dalle applicazioni potrebbero comunque richiedere il ripristino specifico dell'applicazione.

## cpak è stabile?

cpak v2 verrà lanciato come opzione sperimentale. Vengono testati i flussi di transazioni principali, sandbox, storage, pacchetti, SDK e desktop, mentre la copertura hardware e di distribuzione più ampia continua a crescere.