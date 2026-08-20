Un avvio cpak è più facile da diagnosticare quando il container viene considerato come una sequenza di decisioni, non come una singola operazione. Ogni fase lascia uno stato che può essere ispezionato.

## Risolvere il pacchetto

L'origine Git seleziona un manifest e il manifest seleziona un'immagine OCI. Un branch può cambiare; una release, un commit e un digest risolto identificano invece input fissi. `cpak lock` risolve l'intero grafo delle dipendenze prima dell'avvio.

```
cpak validate cpak.json
cpak lock cpak.json
cpak run -v github.com/example/editor editor
```

La validazione dice se il documento è accettato. Il lock indica cosa verrà installato. L'output verbose mostra quali record e layer installati vengono utilizzati in quel momento. Sono tre domande differenti.

## Calcolare la policy effettiva

Il manifest richiede gli accessi predefiniti. Un override locale può restringerli o ampliarli, mentre il ceiling di sistema può soltanto limitare il risultato. I pacchetti nested ricevono l'intersezione tra la propria policy effettiva e il limite del pacchetto principale. Nessuna fase successiva può ripristinare un accesso rimosso qui.

Questo calcolo è indipendente dal contenuto dell'immagine. Una libreria presente in un layer non concede accesso a un dispositivo, socket o percorso dell'host. La rende soltanto visibile nella root assemblata.

## Comporre la root

cpak ordina le dipendenze layer obbligatorie, l'applicazione e gli addon abilitati. Lo storage driver prepara le directory native dei layer immutabili. Rootless OverlayFS compone la vista read-only del pacchetto, sopra la quale viene montato il layer scrivibile dell'applicazione.

Una dipendenza nested non entra in questa root. Mantiene il proprio ambiente ed è raggiunta attraverso l'interfaccia per i pacchetti nested. Per questo Bottles può richiedere UMU senza fondere l'intero runtime di UMU nella propria immagine.

## Entrare nel limite

I namespace definiscono le viste di processi, mount, IPC, hostname, cgroup e, quando richiesto, rete. cpak monta i percorsi e i socket host dichiarati, quindi Landlock e seccomp restringono le operazioni disponibili dopo il setup. Il processo usa l'identità dell'utente corrente e non può acquisire privilegi dopo `no_new_privs`.

Un broker tipizzato gestisce il piccolo insieme di operazioni host che non possono vivere dentro questo limite. Log e codice di uscita tornano attraverso il supervisor. Quando un avvio fallisce, identifica la fase che lo ha rifiutato prima di modificare il manifest.

[Architettura](/docs/architecture) collega questa sequenza al codice sorgente. [Risoluzione dei problemi](/docs/troubleshooting) elenca i comandi per ogni classe di errore.
