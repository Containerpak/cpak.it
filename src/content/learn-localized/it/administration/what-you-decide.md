Partiamo da ciò che non decidi. cpak installa ogni pacchetto nella home dell'utente che lo ha richiesto, senza root e senza un elenco di pacchetti condiviso da tutto il sistema. Non puoi approvare l'installazione di un altro account, vederne i pacchetti o rimuoverli dalla macchina.

Questa separazione è intenzionale, ma un computer gestito deve comunque avere una policy comune. cpak offre quindi tre decisioni che riguardano l'intero host, non una singola installazione.

## Uno: quanto può ottenere un'applicazione

Un **ceiling** è un file di policy applicato a ogni installazione presente sull'host. I permessi richiesti dal pacchetto o aggiunti dall'utente tramite override non possono superare ciò che consente il ceiling.

```
cpak system set-ceiling /etc/cpak/ceiling.json
cpak system ceiling            # what is in force now
cpak system set-ceiling none   # remove it
```

L'impostazione richiede l'autenticazione dell'amministratore. cpak legge e convalida il file prima di richiederla, quindi un percorso errato produce subito un errore. Il ceiling si applica a tutti gli account della macchina, compreso quello dell'amministratore.

La prossima lezione mostra come scriverlo. Il punto essenziale è questo: **un ceiling non concede mai un permesso**. Può soltanto lasciare invariata o restringere una richiesta.

## Due: se un avvio deve corrispondere al record

Quando installa un'applicazione, cpak registra i layer, la policy e l'identità di chi ha firmato il pacchetto. L'**enforcement** stabilisce cosa accade quando un avvio non corrisponde a quel record.

```
cpak system set-enforcement warn
cpak system enforcement        # what is in force now
```

I livelli sono tre:

**off** è il valore predefinito. Una macchina mai configurata continua a comportarsi come prima.

**warn** mostra a ogni avvio ciò che `refuse` avrebbe bloccato, ma consente all'applicazione di partire. È il livello da usare prima di applicare una policy restrittiva a una flotta.

**refuse** impedisce l'avvio di un'applicazione che il ledger non riconosce.

Passare direttamente da off a refuse significa scoprire i pacchetti non registrati quando smettono di funzionare. Warn permette di trovarli prima.

## Tre: quale software accetta questo host

La policy di firma decide se un pacchetto non firmato può essere registrato e quali publisher sono considerati attendibili. Una lezione successiva copre questa configurazione, che usa un file di policy dedicato.

## Cosa non possono fare queste policy

Un ceiling non può abilitare un permesso se non lo richiedono il manifest o un override locale salvato. L'enforcement non può trasformare un pacchetto non firmato in uno firmato. Entrambi restringono decisioni già esistenti. La policy di firma serve invece a limitare l'installazione al software approvato.
