Un'applicazione desktop può avere bisogno di un servizio dell'host. Esporre un comando host sarebbe pericoloso. Una host action cpak descrive invece l'operazione, così la policy può valutarla prima che venga chiamato un backend.

## Parti dalle capacità, non dai comandi

Il provider dei container è un buon esempio:

```
"hostActions": [
  {
    "provider": "containers",
    "capabilities": ["read", "manage-owned", "exec-owned"]
  }
]
```

`read` elenca e ispeziona. `manage-owned` crea e modifica soltanto container che portano l'etichetta di proprietà del pacchetto richiedente. `exec-owned` esegue processi all'interno di quei container. Nessuna capacità significa "inoltra qualsiasi comando a Podman".

L'altro provider integrato è `cpak`. Le capacità `read`, `manage` ed `exec` coprono il rilevamento limitato e le operazioni sugli ambienti persistenti tramite lo shim `cpak-host`. Non espongono l'intera CLI cpak o una shell host. La guida [Host actions](/docs/host-actions) elenca ogni operazione accettata.

## Definisci una richiesta finita

Un provider deve avere un insieme finito di operazioni e uno schema per ognuna. Valida nomi, identificatori, percorsi e opzioni prima di scegliere il backend. Rifiuta i campi sconosciuti. Risolvi i link simbolici prima di confrontare un mount richiesto con la policy filesystem del pacchetto.

La proprietà deriva dall'identità autenticata del pacchetto, mai da un'etichetta fornita dal chiamante. La cancellazione appartiene al contesto della richiesta, così fermare un pacchetto non lascia in esecuzione un'operazione sull'host.

## Gli shim di compatibilità sono parser

cpak può esporre comandi `podman` e `docker` senza inoltrarne l'intera riga di comando. Ogni shim accetta un sottoinsieme documentato della CLI, lo interpreta localmente e produce una richiesta tipizzata. Comandi e flag non supportati falliscono prima di raggiungere il broker.

Uno shim utile conserva standard input, output, error, codice di uscita e cancellazione. Un editor può così usare strumenti conosciuti senza trasformare lo shim in un canale generico di esecuzione sull'host.

## I pacchetti nested intersecano le capacità

Una dipendenza nested riceve soltanto le capacità consentite dal proprio manifest e dal pacchetto principale. Non può ampliare il limite del padre. Un override locale può restringere ancora il risultato.

Verifica la validazione della richiesta e il controllo della proprietà nel backend, quindi esegui una chiamata completa allo shim con stream e cancellazione. Un solo caso positivo non dimostra la tenuta del limite.

[Host action](/docs/host-actions) documenta i provider e le capacità disponibili.
