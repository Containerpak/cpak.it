---
title: Architettura di esecuzione
description: Come si integrano i metadati Git, i layer OCI, lo Store locale, gli spazi dei nomi e il supervisore dell'applicazione.
tags: [architecture, runtime]
section: runtime
order: 10
---
# Architettura runtime

cpak utilizza due binari Go statici. Il client `cpak` risolve i pacchetti e avvia ambienti applicativi senza root tramite le interfacce del kernel Linux. `cpak-storaged` prepara, verifica e raccoglie i checkout dei layer persistenti durante le operazioni di manutenzione, quindi esce. Le applicazioni preparate iniziano direttamente dall'indice runtime e dal rootless OverlayFS.

## Risoluzione del pacchetto

Un'installazione inizia da un'origine Git. cpak risolve il ramo, il rilascio o commit selezionato e scarica `cpak.json`. manifest viene convalidato prima che il contenuto dell'image o le sorgenti runtime diventino attivi.

Il client di distribuzione OCI nativo risolve il riferimento all'image in un digest immutabile, seleziona l'architettura Linux corrente da un indice di image, convalida ogni descrittore e controlla il contenuto scaricato rispetto al suo digest SHA-256. I manifesti di dipendenza vengono risolti tramite lo stesso percorso. Un file di blocco può registrare gli hash manifest esatti e i digest di image per lo sviluppo e l'CI.

L'accesso al registro inizia in modo anonimo. I pacchetti privati utilizzano un'associazione di credenziali esplicita con ambito all'origine del pacchetto, al registro host e al percorso del repository. cpak mantiene queste associazioni nel proprio archivio delle credenziali.

## Archivio contenuti

La deduplicazione dello storage prevede due layer automatici. I layer OCI vengono indirizzati dal digest, quindi lo stesso layer a cui fanno riferimento più applicazioni viene scaricato una volta. FVS memorizza il contenuto del file come blocchi definiti dal contenuto condiviso, quindi intervalli uguali occupano una copia fisica anche quando build separate li posizionano su layer diversi.

Il layer OCI riutilizza un layer di corrispondenza completo. FVS funziona sotto il layout dell'image e condivide blocchi definiti dal contenuto tra image non correlate, incluse librerie, caratteri e risorse. Questo layer funziona su filesystem locali con o senza supporto hard-link e reflink.

I record dei pacchetti, i layer immutabili, lo stato dell'applicazione scrivibile, i registri, i file desktop esportati e lo stato delle transazioni vengono conservati separatamente. Il ripristino elimina i dati di gestione temporanea incompleti e preserva la versione attiva.

FVS rimane la fonte autorevole per il contenuto del layer immutabile. Uno storage driver deriva le directory native persistenti da tale origine. Il valore predefinito FVS driver riutilizza file completi tramite reflink o hard link dove il filesystem lo consente. Lo DaBaDee driver implementa lo stesso contratto per compatibilità e implementazioni alternative.

## Vista runtime

Ogni layer preparato ha un checkout nativo immutabile e una voce in un indice atomico runtime. All'avvio, cpak legge l'indice e passa l'applicazione ordinata, la dipendenza e le directory dei componenti aggiuntivi abilitati direttamente allo OverlayFS senza root. Un layer superiore scrivibile riceve le modifiche dell'applicazione mentre il contenuto FVS rimane immutabile e condiviso.

Un avvio preparato legge l'indice runtime e monta immediatamente le directory elencate. I processi di storage e la materializzazione per applicazione rimangono nel percorso di manutenzione. Se un aggiornamento è stato interrotto prima della pubblicazione di un checkout richiesto, la voce del desktop mostra l'avanzamento della preparazione, riprende i layer completi e avvia l'applicazione quando l'indice runtime è pronto.

L'ambiente riceve variabili cpak runtime. `CPAK_CONTAINER_ID` contiene un identificatore opaco per l'istanza attiva e può essere utilizzato per rilevare un avvio cpak.

## Isolamento

cpak crea direttamente utente, montaggio, PID, IPC, UTS, cgroup e spazi dei nomi di rete opzionali. Un piccolo processo PID 1 possiede il ciclo di vita del container e raccoglie i processi figli. Un Unix socket privato accetta richieste di esecuzione limitate per l'istanza in esecuzione.

I montaggi vengono preparati dal set di permessi del pacchetto e dagli override dell'utente. Il processo finale riceve `no_new_privs`, una policy seccomp e regole Landlock quando il kernel host le supporta.

## Integrazione host

Display, audio, dispositivi e prese esplicitamente richieste sono montati nell'ambiente. Notifiche, richieste URI esterne, avvii di applicazioni host e servizi host digitati utilizzano il sistema cpak broker.

I comandi di compatibilità riguardano notifiche, apertura URI, avvio di applicazioni host e servizi host supportati. Ogni spessore analizza una richiesta finita prima che attraversi il limite sandbox. broker controlla la politica del pacchetto e restituisce output, errori, stato di uscita e annullamento.

Le richieste di selezione file utilizzano un canale di grant separato. host seleziona e apre l'oggetto richiesto, quindi invia il suo descrittore a un lavoratore di montaggio collegato allo spazio dei nomi del pacchetto in esecuzione. L'applicazione riceve un percorso sotto `/run/cpak/grants` senza ricevere la home host o un percorso host senza restrizioni. Le grant persistenti vengono salvate per origine del pacchetto e ripristinate solo dopo che la relativa origine è stata nuovamente verificata.

Le conferme e le finestre di avanzamento di proprietà del runtime possono utilizzare Adwaita, GTK, KDE, Qt o l'interfaccia integrata. Il binario ufficiale incorpora gli helper nativi ed estrae solo l'adattatore selezionato. Questo layer dell'interfaccia utente è indipendente dalla politica del pacchetto e dal trasporto delle grant di file.

## Ciclo di vita

Un'applicazione può avere istanze denominate. `cpak run` avvia o si connette all'ambiente del pacchetto e avvia il binario selezionato. `cpak logs` legge l'output dell'istanza, mentre `cpak stop` termina il container supervisionato.

Un `idle_time` maggiore di zero consente l'arresto di un ambiente inutilizzato dopo il numero di minuti dichiarato. Lo stato dell'applicazione rimane disponibile per il prossimo avvio.

## Transazioni

Installa e aggiorna manifesti di fase, layer, origini runtime e modifiche al database prima di cambiare il record del pacchetto attivo. La vecchia versione rimane disponibile per il rollback dopo un aggiornamento riuscito. Il controllo e la riparazione esaminano la relazione tra record e file dopo un'operazione interrotta.

La preparazione per lo stoccaggio segue lo stesso modello. Uno driver scrive un checkout parziale privato, lo verifica, lo sincronizza e lo pubblica con una ridenominazione atomica. cpak aggiorna l'indice runtime solo dopo aver convalidato ogni directory restituita. I layer completati sopravvivono a un batch interrotto e vengono riutilizzati al tentativo successivo.