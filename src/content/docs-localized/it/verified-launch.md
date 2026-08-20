---
title: Lancio verificato
description: cpak registra cos'è un'applicazione quando viene installata e si rifiuta di avviarla quando lo store non la mantiene più.
tags: [integrity, security, sandbox]
section: runtime
order: 45
---
# Lancio verificato

Un'applicazione installata è un insieme di layer, una configurazione e un'permesso
impostare. Tutto risiede in un Store di proprietà dell'utente, il che significa qualsiasi cosa sul
macchina in esecuzione poiché quell'utente può modificarla e fino ad ora nulla se ne accorgerebbe.
L'avvio verificato chiude che: cpak registra cos'è un'applicazione quando lo è
installato e si rifiuta di avviarlo quando ciò che contiene il Store non corrisponde più.

## Confronto con cui viene controllato un avvio

Vengono derivati tre valori e vengono tenuti separati perché cambiano per
motivi diversi.

Il **pacchetto root** copre cos'è l'applicazione: la sua origine, versione, image
digest, configurazione, l'elenco ordinato dei suoi layer con lo stato del Store ciascuno
uno prodotto, le sue dipendenze, componenti aggiuntivi, file binari, voci desktop e sessioni.
Cambia quando l'applicazione viene installata o aggiornata.

La **radice della policy** copre ciò che l'applicazione può fare: l'efficacia
permesso impostata dopo manifest e qualsiasi override applicato dall'utente. Cambia
quando i permessi cambiano, che è un evento separato con una risposta separata.

La **root di avvio** combina i due. È il valore registrato nel libro mastro e
quello con cui viene confrontato un avvio.

Mantenere separate identità e policy è ciò che ti consente di restringere il campo di applicazione di un'applicazione
permessi senza reinstallarlo e cosa consente a un aggiornamento di modificare il file
applicazione senza modificare silenziosamente ciò che può fare.

## Dove vengono mantenute le aspettative

Il registro si trova sotto `/var/lib/cpak/integrity/v1`, di proprietà di root, un record
per utente e origine. L'account che avvia un'applicazione non può scriverla.
Questo è il punto: ogni altro file da cui dipende un avvio appartiene a
user, quindi un confronto tra due file di proprietà dell'utente non prova nulla.

La scrittura di un record passa attraverso l'autorità di sistema, lo stesso servizio privilegiato
che registra le sessioni di accesso, sul bus di sistema quando ce n'è uno, sul suo
socket quando non c'è, e direttamente quando il chiamante è già root.

## Cosa succede quando il Store non è d'accordo

Un avvio raggiunge una di queste conclusioni.

**Riconosciuto**: ciò che deriva dal avvio è ciò che contiene il registro. Inizia.

**Tampered**: il Store si contraddice. Un'associazione di layer nomina uno stato
repository non serve più oppure un checkout preparato non ha la forma a cui è associato
lo stato descrive. Questo viene rifiutato a ogni layer di applicazione, incluso quello off,
perché non è un'incognita, è un disaccordo interno al Store.

**Non riconosciuto**: il registro contiene una radice e l'avvio ne deriva una diversa
uno. Rifiutato al momento della registrazione della domanda.

**Non legato**: un layer non ha vincoli, quindi l'avvio non può essere descritto
tutto. Il messaggio nomina il comando che lo risolve.

**Non registrato**: il registro non contiene nulla per questa applicazione. Cosa succede dopo
è l'unica cosa che decide il layer di applicazione.

## layer di applicazione

L'applicazione governa l'ignoto. Non governa mai il male conosciuto: un manomesso
il Store viene rifiutato ad ogni layer.

`off` è l'impostazione predefinita e si comporta esattamente come prima cpak. Un non iscritto
viene avviata l'applicazione.

`warn` non rifiuta nulla e segnala ogni disaccordo sull'errore standard, quindi a
la macchina può essere guardata prima che venga accesa qualsiasi cosa.

`refuse` trasforma le persone non iscritte e non verificabili in rifiuti.

Il layer viene mantenuto accanto al registro, di proprietà della radice, e non viene mai letto dal file
ambiente o da qualsiasi cosa sotto una directory home, perché decide se
avviene un rifiuto.

```bash
cpak system enforcement
cpak system set-enforcement warn
cpak system set-enforcement refuse
```

La modifica richiede una password di amministratore.

## Lettura dello stato

```bash
cpak audit
cpak system explain github.com/example/app
```

`cpak audit` riporta, per applicazione, quanti dei suoi layer sono vincolati, se
vengono misurate le sue casse e se è iscritto. `cpak system explain`
mette ciò che contiene il libro mastro accanto a ciò che deriva da un avvio, quindi può verificarsi un disaccordo
essere letto invece che indovinato.

Un'installazione effettuata prima dell'esistenza del avvio verificato non ha vincoli. Non lo è
rifiutato al layer predefinito e può essere aggiornato senza
reinstallare:

```bash
cpak audit --backfill-bindings
```

Un backfill registra ciò che è presente sul disco in questo momento. Non è una verifica, e il
il comando lo dice.

## Cosa dimostra l'iscrizione e cosa no

La registrazione registra ciò che è stato installato nel momento in cui è stato installato. Questo è
fidatevi della prima installazione. Si tratta di una vera affermazione su una macchina il cui proprietario è
fidato, ed è la giusta garanzia per un desktop: un'applicazione, o
qualsiasi altra cosa in esecuzione come te, non può alterare un'altra applicazione, le sue permessi,
o il launcher che avrebbe controllato, senza rifiutare l'avvio successivo.

L'iscrizione di per sé non è autenticità. Ciò non dimostra che il pacco sia arrivato
dal suo autore: per questo un editore deve firmare ciò che pubblica, e cpak
deve controllare la firma prima di registrare qualsiasi cosa. Questo è
[firma dell'editore](/docs/publishing-signatures) e un host può richiederlo.

Due limiti in più, dichiarati perché una garanzia di cui nessuno possa vederne i bordi
peggio di uno più piccolo:

Il confronto al momento del avvio riguarda i metadati. Percorsi, tipi, dimensioni, bit di permesso e
gli obiettivi dei link simbolici sono coperti. Il contenuto del file non lo è, perché legge ogni byte
di un'applicazione di grandi dimensioni costa pochi secondi e un avvio non può ripagarlo. Il contenuto è
controllato su richiesta piuttosto che sul percorso di avvio.

Qualcuno che possiede il Store e tiene una sessione locale attiva può installare a
applicazione modificata e registrarla così com'è. E' lo stesso
dichiarazione come fiducia alla prima installazione, vista dall'altro lato.

## Per un autore di pacchetti

Non c'è niente da aggiungere ad un manifest e niente da firmare. L'avvio verificato è
derivato sulla macchina che installa l'applicazione, dall'image, il file
manifest e il set di permessi che già pubblichi. Un pacchetto costruito prima di questo
esistente è iscritto allo stesso modo di quello costruito dopo di esso.

La firma è una dichiarazione diversa ed è facoltativa. Dimostra che il pacco è arrivato
dall'elemento della configurazione del repository, che la registrazione di per sé non rivendica. Là
non è una chiave da gestire, perché è senza chiave attraverso l'identità del tuo elemento della configurazione. Vedi
[firma dell'editore](/docs/publishing-signatures) per il flusso di lavoro e tienilo presente
un pacchetto senza firma si installa e funziona esattamente come oggi.

Una cosa influisce su un editore. Uno layer consegnato tramite un pull parziale è
ricostruito dagli intervalli e il BLOB con i suoi nomi digest non viene mai letto, quindi non è possibile farlo
legare quelil layer allo stato che ha prodotto. Un'applicazione i cui layer arrivano
in questo modo viene installato e lasciato non registrato e su `refuse` non si avvia
finché l'utente non registra ciò che è sul disco con `cpak audit --backfill-bindings`. Se
le tue image portano le annotazioni in blocchi e desideri che i tuoi utenti si iscrivano
la prima installazione, pubblicali senza.

## Richiede una firma

Uno host può decidere che un'applicazione venga registrata solo quando un editore ha firmato
cosa installa e che l'identità che lo ha firmato possa parlare per il
origine del pacchetto:

```bash
cpak system signatures
cpak system set-signatures required
```

Il valore predefinito è facoltativo e si comporta come descritto sopra: un pacchetto firmato
record che lo hanno firmato, uno non firmato viene iscritto lo stesso e il record
dice che non era firmato. Sotto `required` un'applicazione il cui stato non è firmato
da un'identità che può parlare per la sua origine non è affatto iscritto, e a
`refuse` quindi non si avvia.

L'impostazione richiede una password di amministratore e il layer si trova accanto a
registro in cui l'account di avvio non può riscriverlo.

Un limite che vale la pena conoscere prima di accenderlo: un'installazione risolta tramite a
lock non può presentare una firma verificabile oggi, perché il lock viene riscritto
il riferimento all'image in manifest prima di manifest viene sottoposto ad hashing, quindi no
la firma copre lo stato che ne risulta. Tali domande rimangono non registrate
sotto `required`.

## Per una macchina amministrata

Quando la persona alla tastiera non è la persona che controlla root, il file
la garanzia è più forte, perché l'iscrizione e l'esecuzione sono decise da un
account che l'utente non possiede. Imposta il layer su `refuse` e un'applicazione
il registro non riconosce non si avvia, qualunque cosa l'utente faccia da solo
Store.