---
title: Distribuzione gestita
description: Decidi centralmente chi può pubblicare software sulle tue macchine e quali permessi può ottenere ogni applicazione.
tags: [enterprise, security, policy]
section: runtime
order: 55
---

# Distribuzione gestita

Su una macchina gestita, l'amministratore controlla tre aspetti distinti: il limite massimo dei permessi, gli autori considerati attendibili e il comportamento da adottare quando un'applicazione non corrisponde allo stato registrato.

Ogni controllo usa un file separato perché risponde a una domanda diversa. I file sono conservati accanto al registro di integrità e non possono essere modificati dall'account che avvia l'applicazione.

## Ceiling: il limite massimo dei permessi

Il ceiling definisce la policy più ampia consentita dall'host. Il manifest e l'override locale stabiliscono ciò che l'applicazione richiede; il ceiling limita il risultato per ogni utente della macchina.

```bash
cpak system ceiling
cpak system set-ceiling /etc/cpak/ceiling.json
cpak system set-ceiling none
```

Il file usa la stessa struttura dei permessi di un override e decide solo le chiavi che contiene. Una chiave assente resta sotto il controllo del manifest e del proprietario dell'installazione:

```json
{
  "sessionBus": {},
  "network": false,
  "filesystem": [{ "path": "xdg-download", "access": "read-only" }]
}
```

Questa policy chiude il bus di sessione e la rete, inoltre limita ogni richiesta al filesystem alla sola lettura della directory Download. Non definisce audio, dispositivi o bus di accessibilità, quindi quei permessi restano invariati.

Un valore `true` non concede un permesso. Il ceiling viene applicato per intersezione: `"deviceDri": true` lascia passare una richiesta proveniente dal manifest o da un override locale, ma non la crea. Un'applicazione che non richiede il dispositivo grafico continua a non riceverlo.

Su una macchina non gestita, il proprietario può aggiungere o rimuovere permessi tramite un override locale. Su una macchina gestita può fare lo stesso entro il ceiling, ma non può superarlo o disattivarlo.

Il ceiling è indipendente dalle firme. Viene applicato allo stesso modo a un pacchetto non firmato e a uno firmato da un autore approvato.

## Trust policy: chi può pubblicare

La trust policy stabilisce quali origini possono essere installate e quali identità possono firmarle. La verifica viene eseguita dal servizio privilegiato durante la registrazione dell'applicazione, quindi aggirare il client non aggira la decisione.

```bash
cpak system trust
cpak system set-trust /etc/cpak/trust.json
cpak system set-trust none
```

```json
{
  "abi": 1,
  "require_publisher": true,
  "approved_origins": ["github.com/acme/editor"],
  "approved_signers": [
    {
      "issuer": "https://token.actions.githubusercontent.com",
      "repo": "github.com/acme/editor"
    }
  ],
  "revoked": [
    {
      "origin": "github.com/acme/editor",
      "generation": 7,
      "reason": "CVE-2026-1234"
    }
  ]
}
```

`approved_origins` contiene origini esatte, non pattern. Un pattern di organizzazione approverebbe anche repository creati in seguito da persone diverse.

`revoked` ritira una fiducia già concessa. Senza una generazione, la revoca copre tutte le generazioni di quell'origine. Una revoca ha sempre precedenza su un'approvazione.

## Controfirma: una seconda approvazione

`require_approval` richiede che l'organizzazione firmi lo stesso stato già firmato dall'autore. In questo modo la firma dell'autore prova chi ha pubblicato il pacchetto, mentre la controfirma prova che l'organizzazione ha approvato quella release precisa.

```json
{
  "abi": 1,
  "require_approval": true,
  "approval_signers": [
    {
      "issuer": "https://token.actions.githubusercontent.com",
      "repo": "github.com/acme/approvals"
    }
  ]
}
```

## Richiedere una firma

Un host può impedire la registrazione di pacchetti non firmati:

```bash
cpak system signatures
cpak system set-signatures required
cpak system set-signatures optional
```

`optional` è il valore predefinito. Con `required`, un pacchetto non firmato può essere scaricato ma non viene registrato; il livello di enforcement decide se un tentativo di avvio debba essere segnalato o rifiutato.

## Enforcement: cosa accade al lancio

Il ceiling, le firme e la trust policy stabiliscono cosa può essere registrato. L'enforcement decide cosa accade quando il lancio non corrisponde al registro.

```bash
cpak system enforcement
cpak system set-enforcement warn
cpak system set-enforcement refuse
```

`off` è il valore predefinito. `warn` non blocca il lancio e registra ogni divergenza, così una flotta può essere osservata prima di attivare il blocco. `refuse` impedisce l'avvio delle applicazioni non riconosciute.

Uno store che contraddice il proprio stato viene rifiutato anche con `off`, perché non si tratta di uno stato sconosciuto ma di una violazione dell'integrità registrata.

## Dove vengono conservate le decisioni

Questi controlli sono conservati sotto `/var/lib/cpak/integrity`, appartengono a root e devono essere file regolari non scrivibili da altri utenti. Un file che non supera queste verifiche non viene applicato.

La modifica richiede autenticazione amministrativa. La lettura no, così un utente può capire perché un'applicazione non parte.

## Host non gestito

Se nessuno di questi controlli è configurato, cpak mantiene il comportamento normale: non esiste un ceiling di sistema e l'override locale può aggiungere o rimuovere permessi. L'aggiornamento di cpak non attiva automaticamente una policy aziendale.

## Limiti del modello

L'approvazione di un autore non garantisce che ogni sua release sia sicura. Una release compromessa deve essere revocata.

La firma non dimostra che l'immagine corrisponda al sorgente revisionato. Questo richiede build riproducibili.

Un'installazione risolta tramite lock file non può ancora presentare una firma verificabile dell'autore. Con una policy che la richiede, resta quindi non registrata. Consulta [avvio verificato](/docs/verified-launch).
