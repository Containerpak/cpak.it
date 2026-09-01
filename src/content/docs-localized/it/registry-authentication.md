---
title: Repository GitHub e registri OCI privati
description: Associa le credenziali di sorgente e immagine a una sola origine senza importare la configurazione del motore container.
tags: [registry, authentication, security]
section: operations
order: 25
---
# Repository GitHub e registri OCI privati

L'accesso al sorgente del pacchetto e all'immagine OCI usa credenziali separate. Un repository GitHub privato richiede una richiesta autenticata per leggere `cpak.json`. Un'immagine privata richiede l'autenticazione al registro. cpak associa entrambe le forme a una sola origine esatta.

## Repository GitHub privati

Usa la sessione GitHub CLI corrente quando `cpak.json` si trova in un repository privato:

```bash
cpak auth login github.com/example/private-app --github
```

cpak legge il token conservato da `gh auth`. Se non esiste una sessione GitHub e il comando è interattivo, avvia `gh auth login` nel browser con gli scope per repository e pacchetti. La credenziale sorgente viene accettata soltanto per l'origine esatta `github.com/owner/repository`.

Quando il manifest privato punta a GHCR, la stessa credenziale GitHub viene associata anche al repository OCI esatto indicato nell'immagine. Un'immagine ospitata su un altro registro richiede comunque un login separato.

`--github` non può essere combinato con `--username`, `--token` o `--token-host`.

## Registri OCI privati

### Memorizza una credenziale del registro

L'autenticazione di base utilizza un nome utente e una password:

```bash
cpak auth login github.com/example/private-app --username account
```

L'autenticazione del token omette il nome utente:

```bash
cpak auth login github.com/example/private-app --token
```

Per GHCR, passa il nome utente GitHub con `--username` e inserisci un personal access token come password. Il flag `--token` è destinato ai bearer token emessi dal registro e non può essere combinato con un nome utente.

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

Lo stesso file può fornire un token GitHub per il sorgente privato:

```bash
cpak auth login github.com/example/private-app --github --secret-file token.txt
```

cpak memorizza il percorso assoluto del file nell'associazione e legge il segreto da quel file per ogni richiesta di registro. I metadati di associazione contengono solo il percorso. Mantieni il file in quel percorso con lo stesso proprietario e modalità. `cpak auth logout` rimuove l'associazione e lascia intatto il file di proprietà dell'utente.

Uno runtime automatizzato può iniettare `CPAK_REGISTRY_AUTH_FILE`. Il file JSON deve essere di proprietà dell'utente corrente e avere la modalità `0600`:

```json
{
  "records": [
    {
      "origin": "github.com/example/private-app",
      "source_host": "github.com",
      "registry": "ghcr.io",
      "repository": "example/private-app",
      "username": "account",
      "password": "TOKEN"
    }
  ]
}
```

Ometti `registry`, `repository` e `username` quando il token serve soltanto per il sorgente GitHub privato. L'autenticazione bearer del registro usa `access_token` invece di `username` e `password`. Un record che mescola entrambe le forme viene rifiutato.

## Servizi token

cpak accetta le sfide del registro Basic e Bearer. Per impostazione predefinita, le credenziali vengono inviate al registro host. Un registro che utilizza un token separato host richiede una voce esplicita nella lista consentita:

```bash
cpak auth login github.com/example/private-app \
  --username account \
  --token-host auth.example.com
```

Gli endpoint token devono utilizzare HTTPS, ad eccezione dei registri di loopback utilizzati per lo sviluppo locale. I reindirizzamenti non possono trasportare credenziali a un altro host. I token ottenuti tramite una verifica del registro rimangono in memoria fino alla loro breve scadenza.
