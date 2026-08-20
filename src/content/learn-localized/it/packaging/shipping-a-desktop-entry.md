L'immagine contiene un file `.desktop`. Se venisse esportato senza modifiche, la riga `Exec` avvierebbe il programma sull'host, fuori dal container, con tutti gli accessi dell'utente. Per questo cpak legge il file e riscrive ogni comando affinché passi attraverso `cpak run`.

Il playground accanto alla lezione mostra la trasformazione riga per riga. Il preset iniziale, _Una voce pubblicata_, rappresenta il caso normale.

## Ogni variante, non soltanto quella evidente

Seleziona _La stessa chiave, in tre forme_. Tre righe assegnano `Exec`: una ha uno spazio iniziale, una usa una tabulazione e una contiene uno spazio prima del segno uguale. Un launcher rimuove questi spazi, interpreta le tre righe come la stessa chiave ed esegue l'ultima.

Riscrivere soltanto la prima sarebbe peggio che non intervenire: il file sembrerebbe corretto, ma il programma partirebbe ancora fuori dal container. cpak riscrive tutte e tre le forme. Sono le regole del launcher, non l'aspetto del file, a determinare cosa viene eseguito.

## E nulla che gli somigli soltanto

Seleziona _Righe che sembrano soltanto Exec_. Quattro righe contengono la parola, ma una sola assegna la chiave. Un commento non è una chiave. `Exec[de]` e `ExecPath` sono chiavi differenti. Un valore che contiene la parola Exec rimane un valore. cpak non riscrive una riga che il launcher non avrebbe eseguito, perché altrimenti corromperebbe il file.

## Cosa non farà cpak

Seleziona _Un file senza il gruppo [Desktop Entry]_. I comandi vengono comunque riscritti, perché devono essere eseguiti nella sandbox ovunque si trovino. cpak non inventa però il gruppo mancante.

La regola è semplice: cpak corregge ciò che può interpretare e non indovina ciò che il file non dichiara. Un file privo del gruppo richiesto deve essere corretto nell'immagine; l'esportazione segnala il problema.

## Due file, non uno

La voce esportata non sostituisce l'originale. Il file fornito rimane nell'immagine e quello riscritto viene salvato nella directory delle applicazioni dell'utente. Incolla il tuo file nel playground prima della pubblicazione. Se una riga che dovrebbe essere modificata rimane invariata, hai trovato un bug prima che qualcuno installi il pacchetto.

[Integrazione con il sistema](/docs/system-integration) è la guida di riferimento usata in questa lezione.
