---
title: Aggiorna cpak runtime
description: Configura i controlli degli aggiornamenti desktop e CLI, le build del gestore pacchetti e la selezione della finestra di dialogo nativa.
tags: [updates, desktop, packaging]
section: operations
order: 22
---

# Aggiorna cpak runtime

cpak controlla l'ultima versione ufficiale di GitHub al massimo una volta al giorno quando viene avviato un comando. Il comando richiesto prosegue quando l'endpoint di aggiornamento non è disponibile.

## Riga di comando

Controlla senza modificare il binario:

```bash
cpak self-update --check
```

Scarica e installa la versione:

```bash
cpak self-update
```

cpak seleziona le risorse `cpak-linux-ARCH` e `cpak-storaged-linux-ARCH` corrispondenti, scarica `SHA256SUMS` e verifica entrambi i file binari. Ogni file viene scritto in un eseguibile temporaneo nella directory binaria corrente, sincronizzato e rinominato in posizione. La override inizia dopo che entrambe le risorse hanno superato la verifica.

## Notifica sul desktop

Una sessione desktop mostra un avviso per ogni nuova versione. Il comando che ha attivato il controllo continua mentre la finestra di dialogo di aggiornamento viene eseguita separatamente.

Il backend è selezionato in questo ordine:

1. il backend configurato dalla distribuzione o dall'utente
2. il valore predefinito selezionato durante la compilazione di cpak
3. KDialog su KDE o Zenity su GNOME, Unity e Cinnamon quando il valore predefinito compilato è `auto`
4. l'interfaccia cpak integrata

Imposta un backend in `~/.config/cpak/cpak.json`, `/etc/cpak/cpak.json` o `/usr/share/cpak/cpak.json`:

```json
{
  "desktop": {
    "dialog_backend": "kde"
  }
}
```

I valori supportati sono `auto`, `gnome`, `kde` e `builtin`. Un backend nativo configurato ricorre all'interfaccia integrata quando il suo strumento non è disponibile.

Imposta `CPAK_OPTS_FILE` per testare un file di configurazione specifico.

## Pacchetti di distribuzione

Crea un file binario di proprietà del gestore dei pacchetti con:

```bash
make VERSION=v2.10.4 SELF_UPDATE_MODE=managed DIALOG_BACKEND=auto
```

Le build gestite continuano a verificare la versione ufficiale. La CLI e l'avviso sul desktop identificano la versione disponibile e indirizzano l'utente al manutentore del pacchetto. La override binaria diretta è disabilitata.

`DIALOG_BACKEND` accetta `auto`, `gnome`, `kde` o `builtin` e si applica sia al binario cpak che al programma di installazione cpak. Un'impostazione JSON ha ancora la precedenza e uno strumento nativo non disponibile ricorre all'interfaccia integrata.

Il flusso di lavoro GitHub utilizza `SELF_UPDATE_MODE=enabled` e `DIALOG_BACKEND=auto` per i file binari statici ufficiali. Le build di distribuzione impostano i valori selezionati in fase di compilazione.
