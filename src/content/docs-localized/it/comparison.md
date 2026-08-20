---
title: Confronta i formati dei pacchetti Linux
description: Scegli tra cpak, Flatpak, Snap, AppImage, pacchetti nativi e Distrobox in base a ciò che devi distribuire.
tags: [comparison, flatpak, snap, appimage, deb, rpm, distrobox]
section: start
order: 35
---
# Confronta i formati dei pacchetti Linux

Linux ha diversi buoni modi per fornire software. Risolvono diversi problemi, quindi la scelta giusta dipende dall'applicazione, dai suoi utenti e da chi manterrà il pacchetto.

| Formato | Migliore vestibilità | Compila input | Base condivisa | Isolamento | Distribuzione |
| ---------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| cpak | App desktop, strumenti per sviluppatori, servizi e sessioni complete realizzate come image OCI | Immagine Containerfile, OCI e `cpak.json` | Pacchetti della piattaforma con versione e dipendenze nidificate | Spazi dei nomi con permessi manifest esplicite e azioni host digitate | Qualsiasi origine Git e registro OCI; lo Store cpak è opzionale |
| Confezione piatta | Applicazioni desktop a distribuzione incrociata | Moduli Flatpak manifest e flatpak-builder | Runtime Flatpak con versione | Bubblewrap sandbox, permessi statici e portali desktop | Qualsiasi telecomando Flatpak; Flathub è il principale catalogo pubblico |
| Scatta | Software per desktop, server e dispositivi nell'ecosistema Snap | `snapcraft.yaml` e parti Snapcraft | Snap base versione | Confinamento rigoroso tramite AppArmor, seccomp e interfacce; disponibile anche il confinamento classico | Snap Store e canali snap |
| Immagine dell'app | Un eseguibile desktop portatile che viene eseguito senza installazione | Directory dell'applicazione raggruppata in un'unica image | Non è necessario condividere runtime | Nessun sandbox è fornito dal formato | Download diretto del file o di qualsiasi file host |
| DEB o RPM | Componenti di sistema e software mantenuti per una distribuzione specifica | Sorgente di distribuzione e ricette del pacchetto binario | Librerie di distribuzione host | permessi host normali a meno che l'applicazione non aggiunga il proprio isolamento | Repository di distribuzione o repository di terze parti |
| Distribuzione | Ambienti di sviluppo mutabili e da riga di comando integrati con host | Un'image del container gestita tramite Podman, Docker o Lilipod | Immagine di distribuzione del container | Spazi dei nomi del motore container con ampia integrazione host in base alla progettazione | Registri dei container; non è un formato di archivio di applicazioni |

## Quando cpak è adatto

cpak è utile quando il software è già integrato in uno Containerfile, necessita dell'integrazione diretta di Linux o deve essere eseguito in più di un contesto. Lo stesso modello di pacchetto può descrivere un'applicazione desktop, uno strumento da riga di comando, un servizio o una sessione desktop completa. I layer OCI forniscono il riutilizzo del trasporto, mentre i driver di storage cpak deduplicano i contenuti localmente tra i pacchetti.

manifest elenca gli accessi host prima dell'installazione. Le applicazioni possono utilizzare azioni host digitate e selettori di file nativi senza essere riscritte attorno a un'API del portale. Un pacchetto può essere pubblicato dal proprio repository e registro Git, quindi elencato nello Store senza trasferire la proprietà a un servizio di compilazione centrale.

cpak è più giovane degli altri formati in questo confronto. Il suo catalogo pubblico e il pacchetto di distribuzione sono più piccoli e alcuni ambienti Linux hanno ricevuto meno test sul campo. Utilizza la [Guida alla compatibilità host](/docs/host-compatibility) prima di renderlo l'unico metodo di consegna per un vasto pubblico.

## Quando Flatpak si adatta

Flatpak dispone di un ecosistema maturo incentrato sul desktop, tempi di esecuzione consolidati e ampio supporto di distribuzione. Il suo sandbox inizia con un accesso limitato all'host, quindi i manifest e i [portali](https://docs.flatpak.org/en/latest/basic-concepts.html#portals) forniscono le risorse necessarie all'applicazione. Flathub offre agli utenti un luogo familiare in cui scoprire e aggiornare le applicazioni.

Scegli Flatpak quando la portata del desktop, gli strumenti esistenti e l'integrazione del portale sono più importanti del riutilizzo di uno Containerfile o della distribuzione al di fuori del modello Flatpak runtime.

## Quando Snap si adatta

Snap copre software desktop, server e dispositivi gestiti. Gli snap rigorosi utilizzano [interfacce](https://snapcraft.io/docs/explanation/interfaces/all-about-interfaces/) per accedere alle risorse host, mentre gli snap di base forniscono il filesystem runtime. I canali e gli aggiornamenti automatici sono integrati in Snapd e nello Snap Store.

Scegli Snap quando il Store, il modello di aggiornamento, l'integrazione con Ubuntu o la gestione dei dispositivi corrispondono alla distribuzione. Il confinamento classico è disponibile per il software che non può funzionare all'interno di interfacce rigide, ma la sua pubblicazione richiede la revisione dello store.

## Quando AppImage è adatto

AppImage è diretto: scarica un file eseguibile, contrassegnalo come eseguibile ed eseguilo. Non richiede un servizio di sistema o l'installazione di pacchetti. Ciò lo rende utile per strumenti portatili, build di test e software forniti da un sito Web di progetto.

Il formato non fornisce sandbox, un servizio di aggiornamento obbligatorio o runtime condivisi. Queste funzionalità possono essere aggiunte da applicazioni e strumenti esterni, ma non sono garanzie del formato stesso. Consulta i [concetti di AppImage](https://docs.appimage.org/introduction/concepts.html) per il relativo modello.

## Quando DEB o RPM sono adatti

I pacchetti nativi rimangono la scelta giusta per kernel, driver, servizi di sistema e componenti che devono seguire il ciclo di vita della distribuzione. Si integrano con il gestore pacchetti host e utilizzano le librerie, le politiche e il processo di aggiornamento esatti gestiti da quella distribuzione.

Tale integrazione crea anche lavoro di manutenzione tra distribuzioni e rilasci. Un pacchetto di applicazioni native potrebbe richiedere ricette separate, nomi di dipendenze e test per Debian, Ubuntu, Fedora, openSUSE e le loro versioni supportate.

## Quando Distrobox è adatto

Distrobox crea ambienti Linux mutevoli con accesso ravvicinato alla casa, al display, all'audio e ai dispositivi dell'utente. È particolarmente utile per strumenti di sviluppo, comandi specifici della distribuzione e lavoro interattivo. La propria documentazione descrive il [modello di integrazione host](https://distrobox.it/).

Non sostituisce direttamente il catalogo di un pacchetto applicativo. Sceglilo quando l'utente desidera un ambiente container in cui può accedere e modificare. Scegli un formato di applicazione quando l'editore deve definire l'applicazione, i permessi, gli aggiornamenti e la voce desktop come un unico pacchetto revisionato.

## Verifica il pacchetto, non solo il formato

Un formato non può rendere sicuro un editore non affidabile. Controlla l'origine, la ricetta di compilazione, i permessi richiesti, la fonte di aggiornamento e il manutentore per il pacchetto esatto che intendi installare. Per questo motivo, lo Store cpak espone l'image manifest, OCI, le dipendenze e i permessi su ogni pagina dell'applicazione.