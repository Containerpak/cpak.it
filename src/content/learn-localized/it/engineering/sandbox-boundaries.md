Il sandbox di cpak usa confini indipendenti. Chiamarli tutti container nasconde sia il motivo per cui un permesso funziona sia il motivo per cui un bypass fallisce.

## I namespace scelgono ciò che vede il processo

Il namespace dei mount inizia dalla rootfs composta del pacchetto. I namespace di processi, IPC, hostname e cgroup separano lo stato del runtime dall'host. Il namespace di rete viene usato salvo quando il manifest concede l'accesso alla rete. I namespace utente permettono tutto questo senza rendere l'applicazione un processo root dell'host.

I namespace utente annidati sono bloccati per impostazione predefinita. Browser e programmi simili possono richiedere `userNamespaces` quando devono creare un altro sandbox dentro cpak. Il permesso è specifico: non concede il filesystem o il bus di sistema dell'host.

## I mount scelgono gli oggetti dell'host disponibili

Un grant al filesystem diventa un path nel namespace dei mount, con modalità esplicita `read-only` o `read-write`. Display, audio, dispositivi e bus hanno campi separati nel manifest perché ciascuno apre un oggetto diverso dell'host. Un oggetto assente non diventa raggiungibile tentando un altro path.

## Landlock restringe l'accesso ai path dopo la configurazione

Il runtime installa le regole Landlock dopo aver aperto e montato i path richiesti. Il processo riceve quindi un elenco di path leggibili e scrivibili imposto dal kernel, anche nel suo namespace. L'ABI disponibile dipende dal kernel dell'host: `cpak doctor` la segnala e un avvio può richiedere Landlock quando il fallback non è accettabile.

## seccomp restringe le chiamate di sistema

`no_new_privs` impedisce l'acquisizione di privilegi tramite esecuzione setuid. seccomp filtra poi le chiamate di sistema non consentite, comprese quelle necessarie a creare un altro namespace utente quando il relativo permesso non è stato concesso. L'isolamento dei mount e seccomp risolvono problemi diversi: uno decide gli oggetti visibili, l'altro le operazioni concesse dal kernel.

## I broker non aggirano il sandbox

Una richiesta che deve raggiungere l'host diventa una host action tipizzata. Porta un'operazione finita e campi validati, non un comando di shell. La convalida del peer la collega all'istanza del pacchetto, che deve avere il permesso corrispondente.

I manifest pericolosi restano evidenti: accesso completo alla home, bus di sessione o di sistema, dispositivi ampi, condivisione dei processi e mount della root dell'host allargano il confine. Il sandbox non rende ristretto un permesso ampio.

[Sandbox e modello di minaccia](/docs/sandbox) elenca tutti i confini e i requisiti dell'host.
