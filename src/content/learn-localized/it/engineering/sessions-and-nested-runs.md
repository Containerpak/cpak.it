cpak attraversa due limiti che possono sembrare simili a un'applicazione, ma appartengono a soggetti differenti. Una richiesta nested avvia un altro pacchetto con lo stesso utente. Una richiesta di sessione modifica una scelta di login controllata dall'host. Entrambe partono dall'origine di un pacchetto, ma non possono fidarsi dell'identità dichiarata dal chiamante.

## I pacchetti nested rimangono separati

Una dipendenza nested viene installata insieme al pacchetto principale, ma conserva layer immutabili, stato scrivibile e ambiente di processo propri. Il pacchetto principale riceve un endpoint limitato alla dipendenza dichiarata, non l'accesso al database cpak o al socket di controllo dell'host.

L'host risolve la dipendenza dal grafo installato, autentica l'istanza principale attraverso la connessione e interseca la policy del figlio con il limite del padre. Il chiamante non può indicare un'origine non dichiarata o attribuirsi l'identità di un altro pacchetto.

Stream, codice di uscita e cancellazione tornano attraverso il protocollo nested. I file condivisi richiedono percorsi espliciti accettati da entrambe le policy. Conserva lo stato nel pacchetto che ne è proprietario, così sostituire un runtime non trascina con sé dati non correlati dell'applicazione principale.

## Una sessione di login modifica l'host

```
"sessions": [
  {
    "id": "com.example.desktop",
    "name": "Example Desktop",
    "kind": "desktop",
    "entrypoint": "/usr/bin/example-session",
    "override": { "deviceDri": true, "deviceInput": true }
  }
]
```

Una sessione possiede un set di permessi specifico perché controlla display e dispositivi di input per tutta la durata del login. Il suo identificatore è globale e non può sostituire una voce di sistema o una registrata da un altro pacchetto. Anche l'entrypoint deve essere un binario esportato.

## Il privilegio appartiene a una sola operazione ristretta

Il processo cpak dell'utente risolve il pacchetto installato e valida la sessione prima di chiederne la registrazione alla system authority. L'authority riceve metadati fissi e un'origine del pacchetto, mai un comando arbitrario. Polkit gestisce l'autorizzazione interattiva sugli host con un bus di sistema; un socket Unix con verifica delle credenziali copre gli altri sistemi.

Il launcher root riceve in seguito soltanto l'ID della sessione registrata. Al login risolve il pacchetto installato corrente, mantenendo la sessione sullo stesso percorso di versione e aggiornamento dell'applicazione avviata in finestra.

[cpak nested](/docs/nested-cpak) documenta il protocollo figlio. [Sessioni desktop e kiosk](/docs/desktop-sessions) documenta l'authority e l'integrazione con i display manager.
