---
title: Registri OCI privati
description: Associa una credenziale del registro a un'origine e a un repository del pacchetto senza importare la configurazione del motore del container.
tags: [registry, authentication, security]
section: operations
order: 25
---
# Registri privati OCI

cpak estrae le image pubbliche OCI in modo anonimo. Un pacchetto il cui manifest punta a un repository privato necessita di un'associazione esplicita di credenziali.

## Memorizza una credenziale

L'autenticazione di base utilizza un nome utente e una password:

```bash
cpak auth login github.com/example/private-app --username account
```

L'autenticazione del token omette il nome utente:

```bash
cpak auth login github.com/example/private-app --token
```

Il comando login legge il pacchetto manifest, analizza il riferimento all'image e associa la credenziale a tutti e tre i valori seguenti:

- origine del pacchetto
- registro host
Percorso dell'archivio - OCI

La credenziale non può autenticare un'altra origine del pacchetto o un altro repository nello stesso registro. L'elemento Secret Service associa inoltre il nome utente e ogni token approvato host, quindi la modifica dei metadati pubblici non può reindirizzare un segreto esistente.

## storage sul desktop

L'accesso interattivo memorizza il segreto tramite l'API desktop Secret Service D-Bus. I metadati di associazione pubblici vengono scritti nella directory di configurazione cpak con la modalità `0600`. Password e token non vengono scritti in quel file.

cpak comunica direttamente con i servizi segreti e mantiene i collegamenti delle credenziali separati da Docker, Podman, Buildah e dalla configurazione dell'assistente credenziali del container.

Elenca le associazioni o esamina un'origine:

```bash
cpak auth list
cpak auth status github.com/example/private-app
```

Rimuovere un'origine e il relativo segreto salvato:

```bash
cpak auth logout github.com/example/private-app
```

## Sistemi senza testa

Leggi il segreto da un file normale di proprietà dell'utente con la modalità `0600`:

```bash
install -m 0600 /dev/null token.txt
cpak auth login github.com/example/private-app --token --secret-file token.txt
```

cpak memorizza il percorso assoluto del file nell'associazione e legge il segreto da quel file per ogni richiesta di registro. I metadati di associazione contengono solo il percorso. Mantieni il file in quel percorso con lo stesso proprietario e modalità. `cpak auth logout` rimuove l'associazione e lascia intatto il file di proprietà dell'utente.

Uno runtime automatizzato può iniettare `CPAK_REGISTRY_AUTH_FILE`. Il file JSON deve essere di proprietà dell'utente corrente e avere la modalità `0600`:

```json
{
  "records": [
    {
      "origin": "github.com/example/private-app",
      "registry": "ghcr.io",
      "repository": "example/private-app",
      "access_token": "TOKEN"
    }
  ]
}
```

L'autenticazione di base utilizza `username` e `password` invece di `access_token`. Un record che mescola entrambe le forme viene rifiutato.

## Servizi token

cpak accetta le sfide del registro Basic e Bearer. Per impostazione predefinita, le credenziali vengono inviate al registro host. Un registro che utilizza un token separato host richiede una voce esplicita nella lista consentita:

```bash
cpak auth login github.com/example/private-app \
  --username account \
  --token-host auth.example.com
```

Gli endpoint token devono utilizzare HTTPS, ad eccezione dei registri di loopback utilizzati per lo sviluppo locale. I reindirizzamenti non possono trasportare credenziali a un altro host. I token ottenuti tramite una verifica del registro rimangono in memoria fino alla loro breve scadenza.