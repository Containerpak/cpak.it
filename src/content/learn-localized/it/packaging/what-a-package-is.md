Pubblicare con cpak significa distribuire tre elementi, ma soltanto uno richiede decisioni specifiche sui permessi.

## L'immagine

Un'immagine OCI contiene il programma e tutto ciò che gli serve per funzionare. Se hai già costruito un container, l'artefatto e gli strumenti sono gli stessi. A cpak interessa soltanto che l'immagine possa essere scaricata e che il digest corrisponda a quello dichiarato.

L'immagine non decide cosa può raggiungere l'applicazione. Un programma che tenta di aprire `/etc/shadow` all'interno di un container cpak fallisce anche se l'immagine è stata costruita come root, perché quel file non è stato esposto al container in esecuzione.

## Il manifest

È un breve file JSON accanto all'immagine. Definisce il nome dell'applicazione, i binari e le voci desktop da esportare, oltre agli accessi richiesti. Quest'ultimo elenco è il tema del corso.

```
{
  "manifest_version": "2.0",
  "name": "Fotoritocco",
  "description": "A photo editor",
  "image": "ghcr.io/example/fotoritocco:3.2",
  "binaries": ["/usr/bin/fotoritocco"],
  "override": {
    "socketWayland": true,
    "filesystem": [{ "path": "xdg-pictures", "access": "read-write" }]
  }
}
```

Considera l'override una promessa, non una semplice configurazione. cpak lo mostra riga per riga prima di scaricare il pacchetto. Ogni accesso aggiunto deve quindi essere comprensibile e giustificato.

## L'origine

Un pacchetto viene installato dall'indirizzo di un repository, non dal nome presente in un indice centrale:

```
cpak install github.com/you/fotoritocco
```

Non esiste una coda di revisione. Nessuno impedisce la pubblicazione, ma nessuno garantisce il pacchetto al posto dell'autore. Chi installa può valutare il manifest e verificare la firma.

## Perché esiste il manifest

Il manifest non crea la sandbox. La sandbox esiste comunque e, senza override, non espone display, audio, rete o directory. Il manifest richiede soltanto gli accessi necessari all'applicazione.

Il lavoro di chi prepara il pacchetto si riduce quindi a una domanda per ogni riga: **qual è l'accesso minimo necessario al funzionamento?** Non ciò che basta sulla propria macchina con i propri file, ma ciò che serve all'applicazione in generale. Le prossime lezioni applicano questa domanda al filesystem e alla voce desktop, i due punti in cui è più facile concedere troppo.

[La guida al manifest](/docs/manifest) documenta ogni campo e può restare aperta durante il resto del corso.
