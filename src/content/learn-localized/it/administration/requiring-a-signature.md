Un ceiling stabilisce quanto può ottenere un'applicazione. L'enforcement verifica che l'avvio corrisponda al record. Nessuno dei due risponde alla prima domanda di una flotta gestita: **chi ha pubblicato questo software?**

## Registrare o meno un pacchetto senza firma

```
cpak system signatures            # what is in force
cpak system set-signatures required
```

I valori possibili sono due. `optional` è quello predefinito: un pacchetto non firmato viene registrato e il ledger annota che non possiede una firma. Questa informazione viene conservata anche quando l'host non la usa per bloccare nulla, quindi la policy può essere attivata in seguito.

`required` rifiuta la registrazione di un'applicazione che non sia stata firmata da un'identità autorizzata a rappresentarne l'origine. Rifiuta la _registrazione_, non l'installazione. Il software già scritto sul disco resta presente ma non registrato, e cpak lo segnala chiaramente.

La policy di firma e l'enforcement lavorano insieme. Con `warn`, un'applicazione non registrata parte mostrando un avviso. Con `refuse`, non parte.

## Quali publisher sono considerati attendibili

Una firma dimostra che qualcuno ha firmato il pacchetto, non che l'host si fidi di quella persona. La policy di trust è un file:

```
cpak system set-trust /etc/cpak/trust.json
cpak system trust                 # what is in force
cpak system set-trust none        # remove it
```

```
{
  "abi": 1,
  "require_publisher": true,
  "approved_signers": [{ "issuer": "https://token.actions.githubusercontent.com" }],
  "approved_origins": ["github.com/yourcompany/"],
  "revoked": [{ "origin": "github.com/someone/thing", "reason": "key lost" }]
}
```

Una policy vuota accetta tutto, quindi un host non configurato mantiene il comportamento predefinito. Un campo assente nella definizione di un signer significa _qualsiasi valore_. Nell'esempio, l'host accetta ogni firma emessa tramite GitHub Actions, indipendentemente dal repository.

## Firmato da qualcuno e approvato da noi

`require_publisher` e `require_approval` esprimono due requisiti differenti.

Il primo richiede la firma di un publisher presente nella lista. Il secondo richiede che **l'organizzazione abbia controfirmato lo stato esatto del pacchetto**: non soltanto l'origine o il publisher, ma quella specifica build. È il controllo da usare quando serve una revisione interna del pacchetto.

## Revocare una decisione precedente

Una revoca ritira un'approvazione già concessa. Se indica una generazione, revoca soltanto quella. Se la generazione è assente, revoca tutte le generazioni dell'origine. Il motivo rimane nella policy affinché la decisione sia comprensibile anche in seguito.

Ogni risultato riporta la propria motivazione, sia quando consente l'avvio sia quando lo rifiuta. Capire perché un'applicazione è partita richiede le stesse informazioni necessarie a capire perché è stata bloccata.

[Distribuzione gestita](/docs/managed-deployment) documenta il formato completo del file.
