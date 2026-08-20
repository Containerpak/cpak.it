Un'immagine cpak è una normale immagine OCI, ma ha uno scopo più limitato rispetto a un container server. Deve contenere l'applicazione e le librerie usate a runtime. Non servono cpak, un service manager, manuali o strumenti di compilazione.

## Scegli la platform più piccola compatibile

Parti dalla platform mantenuta che fornisce già l'ABI necessaria: Mesa per la grafica, GTK o Qt per un toolkit desktop, Wine per un pacchetto che include il proprio runtime Wine o Proton. Quando più pacchetti usano lo stesso digest, il layer condiviso viene scaricato e conservato una sola volta.

Fissa una release della distribuzione. Una base mobile può sostituire librerie senza una revisione del pacchetto. I tag delle platform Containerpak indicano la release Ubuntu e possono identificare anche uno stato pubblicato preciso.

## Separa la compilazione dall'esecuzione

```
FROM golang:1.26-bookworm AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -o /out/example ./cmd/example

FROM ghcr.io/containerpak/base:ubuntu-26.04
COPY --from=build /out/example /usr/bin/example
ENTRYPOINT ["/usr/bin/example"]
```

Cache del compilatore e header rimangono nello stage di build. Installa le librerie runtime ed esegui `cpak-clean-junk` nello stesso layer, così gli indici del package manager e i file rimossi non restano in un layer OCI precedente.

## Conserva le traduzioni dell'applicazione

Il layer locale condiviso fornisce i dati di sistema compilati per la lingua dell'utente. I cataloghi di traduzione dell'applicazione devono invece rimanere nella sua immagine. Non installare `locales-all` e non eliminare i cataloghi letti dall'interfaccia.

## Verifica ogni architettura pubblicata

Un manifest multiarch dichiara che ogni immagine funziona. La CI deve costruire e ispezionare tutte le architetture dichiarate, quindi avviare almeno un binario esportato. Un pacchetto desktop richiede anche un vero avvio grafico su ogni display che dichiara di supportare.

[Costruire immagini OCI](/docs/images) elenca le platform e le immagini SDK correnti.
