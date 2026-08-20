Un editor fotografico deve poter aprire delle immagini. Esistono quattro modi per dichiarare questo accesso e non sono equivalenti. Seleziona ogni preset nel playground e osserva la colonna di destra.

## Quattro ambiti, dal peggiore al migliore

**L'intera macchina.** `host` in modalità read-only espone ogni file del sistema leggibile dall'utente che esegue l'applicazione. Seleziona _L'intera macchina_ e osserva quante risorse diventano accessibili. Esistono casi che lo richiedono, ma un editor fotografico non è uno di questi.

**L'intera home.** `home` comprende documenti, download e directory nascoste, inclusa quella in cui il browser conserva la sessione. È l'accesso eccessivo più comune perché permette quasi sempre al programma di funzionare.

**Una directory utente.** `xdg-pictures`, `xdg-documents`, `xdg-download` e le altre chiavi vengono risolte secondo la configurazione del desktop. `xdg-pictures` resta quindi corretto anche su una macchina in cui la cartella si chiama _Immagini_. Seleziona _Tutte le directory utente_ e confronta il nome a sinistra con il percorso risolto a destra.

**Un percorso.** `home/.config/fotoritocco` indica una sola directory. Molte applicazioni richiedono un percorso simile per le proprie impostazioni e una directory XDG per i file aperti dall'utente, senza bisogno di altro.

## Read-only è un vero livello di accesso

Ogni voce dichiara una modalità. Un visualizzatore che non salva file dovrebbe richiedere read-only. Un convertitore che legge da una directory e scrive in un'altra dovrebbe dichiarare due voci: read-only sulla prima e read-write sulla seconda.

Modifica soltanto la modalità nel playground. I percorsi non cambiano; cambia ciò che l'applicazione può fare al loro interno.

## Cosa rifiuta cpak

Seleziona _Un elenco rifiutato da cpak_. Alcune voci sembrano ragionevoli, ma non lo sono: un percorso relativo non ha una base, `/` nasconde una richiesta per l'intera macchina e lo stesso percorso ripetuto assegna due risposte differenti alla stessa domanda. cpak rifiuta il manifest invece di sceglierne una.

## La domanda da porre per ogni riga

Per ogni voce, indica il primo file che il programma dovrà aprire. Se non riesci a farlo, quella voce è un'ipotesi e deve restare fuori dal manifest finché un problema reale non la giustifica. È facile aggiungere un permesso in seguito; recuperare la fiducia dopo aver richiesto l'intera home è molto più difficile.

[Permessi](/docs/permissions) elenca tutti gli ambiti e i percorsi a cui vengono risolti.
