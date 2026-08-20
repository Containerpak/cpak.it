La composizione parte da una domanda: il pacchetto principale richiede questa capacità o può funzionare senza? I pacchetti obbligatori sono dipendenze. Le capacità opzionali sono addon.

## Scegli la relazione runtime

Una dipendenza nested mantiene la propria sandbox ed espone soltanto i comandi dichiarati. Una dipendenza layer aggiunge file direttamente alla root del pacchetto principale. Un addon viene installato e composto solo dopo che l'utente lo abilita per quell'applicazione.

I layer degli addon seguono l'ordine del manifest principale. Se due pacchetti forniscono lo stesso percorso, prevale il layer successivo. L'addon non può ampliare i permessi host del pacchetto principale; i permessi del suo manifest valgono soltanto quando viene eseguito da solo.

## Un provider dichiara la capacità fornita

```
"addon_provider": {
  "id": "go",
  "slot": "sdk.go",
  "mode": "exclusive",
  "exports": {
    "path": ["/opt/go/bin"],
    "include_path": ["/opt/go/include"]
  }
}
```

Lo slot identifica la capacità, non il repository del pacchetto. L'ID del provider identifica una specifica implementazione nello slot. Gli export aggiungono percorsi per strumenti, librerie, include, pkg-config e CMake senza presumere che ogni SDK venga installato in `/usr`.

## Gli slot exclusive e multiple risolvono casi differenti

Uno slot `exclusive` attiva un solo provider. Uno sviluppatore può installare Go e TinyGo, quindi scegliere quale dei due fornisca `sdk.go` all'editor. Uno slot `multiple` attiva tutti i provider abilitati, come nel caso degli strumenti di compatibilità Steam GE-Proton e ProtoSoda.

```
cpak addon slots github.com/containerpak/vscode
cpak addon providers github.com/containerpak/vscode sdk.go
cpak addon use github.com/containerpak/vscode sdk.go go
```

La scelta viene salvata per il pacchetto principale. Installare un nuovo provider non sostituisce una selezione esplicita. La rimozione del provider attivo cancella oppure rifiuta la selezione secondo il contratto dello slot.

## Il rilevamento rimane locale

cpak valuta i provider tra gli addon installati supportati dal pacchetto principale. Lo Store non sceglie un vincitore globale. Le origini restano decentralizzate e le applicazioni ottengono nomi stabili per le capacità.

[Dipendenze e addon](/docs/dependencies-addons) documenta la composizione e i test con addon abilitati e disabilitati.
