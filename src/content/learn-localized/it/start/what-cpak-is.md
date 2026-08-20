cpak installa applicazioni su Linux. La differenza rispetto al gestore di pacchetti della distribuzione riguarda ciò che un'applicazione può fare dopo l'installazione.

Un programma installato nel modo tradizionale viene eseguito con i tuoi permessi. Può leggere ogni file accessibile al tuo account: documenti, fotografie, profilo del browser e chiavi in `~/.ssh`. Nessuno ha richiesto questi accessi e nulla li limita. Un editor di testo e un gestore di password hanno la stessa portata.

Con cpak, lo stesso programma parte senza nessuno di questi accessi: non vede directory, microfono, rete o display. Può raggiungere soltanto ciò che richiede per nome in un file leggibile prima dell'installazione.

## Cosa viene installato

Un'applicazione cpak non è un insieme di file distribuiti nel sistema. È un'immagine che contiene il programma e tutto ciò che gli serve per funzionare. L'immagine viene scaricata e conservata come un'unica unità.

Accanto all'immagine c'è il manifest, un breve file che elenca ciò che richiede l'applicazione: cartelle, dispositivi e accesso alla rete. Non viene concesso altro e non esiste un valore predefinito che aggiunga permessi senza dichiararlo.

Durante l'avvio, cpak costruisce un ambiente intorno al programma. Al suo interno l'applicazione vede la propria immagine e le risorse richieste nel manifest. Il resto della macchina è assente, non semplicemente nascosto o montato in sola lettura.

## Perché è utile

La domanda importante su un software che non hai scritto non è soltanto se oggi sia dannoso. È cosa potrebbe fare se venisse compromesso in futuro o se cambiasse chi lo mantiene.

Il manifest trasforma la fiducia in una decisione verificabile. Prima di installare un'applicazione puoi leggere ciò che richiede e valutare se sia coerente con la sua funzione. Una calcolatrice che chiede accesso all'intera home comunica già un problema.

## Tre parole che incontrerai spesso

**Pacchetto**. L'applicazione come viene installata da cpak: immagine, manifest e origine con cui è pubblicata.

**Manifest**. Il file che elenca ciò che richiede il pacchetto.

**Permesso**. Una riga del manifest: una cartella, un dispositivo, un socket o la rete. La prossima lezione mostra cosa apre realmente ogni permesso, spesso più di quanto suggerisca il nome.
