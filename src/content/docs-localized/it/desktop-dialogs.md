---
title: Adattatori di dialogo desktop
description: Seleziona, impacchetta e sostituisci il backend di dialogo nativo utilizzato da cpak.
tags: [desktop, dialogs, distributions]
section: runtime
order: 35
---
# Adattatori di dialogo desktop

cpak utilizza adattatori di dialogo desktop per conferme e finestre di avanzamento che appartengono a runtime, comprese le scelte di grant dei file, l'installazione dei pacchetti, gli aggiornamenti e la preparazione dell'storage. Il selettore di file dell'applicazione rimane il selettore nativo fornito dal desktop host.

Il binario ufficiale cpak include Adwaita, GTK, KDE, Qt e l'interfaccia integrata. Solo l'helper selezionato viene estratto e avviato. Un helper mancante, una risposta di protocollo non supportata o un errore di processo restituiscono il controllo all'interfaccia integrata.

## Selezione automatica

Il backend `auto` legge `XDG_CURRENT_DESKTOP` e applica il seguente ordine:

| Scrivania | Backend preferito | Ripiego |
| ------------------------ | ----------------- | -------- |
| GNOMO | Advaita | integrato |
| KDE Plasma | KDE, quindi Qt | integrato |
| MATE, Xfce, Cannella | GTK | integrato |
| LXQt | Qt | integrato |
| Altra o nessuna corrispondenza desktop | integrato | integrato |

KDE e Qt usano i widget Qt. L'helper KDE si identifica separatamente in modo che la selezione automatica e la politica dei pacchetti possano distinguere una build orientata a Plasma senza richiedere i framework KDE.

Una scelta esplicita viene risolta in questo ordine:

1. Il backend passato dal chiamante cpak.
2. `CPAK_UI_ADAPTER` nell'ambiente di processo.
3. `desktop.dialog_backend` nella configurazione `cpak.json`.
4. Il valore predefinito compilato nel file binario.

I valori supportati sono `auto`, `builtin`, `adwaita`, `gtk`, `kde` e `qt`.

## Configurazione runtime

Imposta una preferenza utente in `$XDG_CONFIG_HOME/cpak/cpak.json`, normalmente `~/.config/cpak/cpak.json`:

```json
{
  "desktop": {
    "dialog_backend": "adwaita"
  }
}
```

cpak controlla il file utente prima di `/etc/cpak/cpak.json` e `/usr/share/cpak/cpak.json`. `CPAK_OPTS_FILE` può puntare a un file di configurazione completo, mentre `CPAK_UI_ADAPTER` può sostituire solo il backend per un processo:

```sh
CPAK_UI_ADAPTER=qt cpak run github.com/example/app
```

L'interfaccia integrata è sempre disponibile. Un processo headless non produce un desktop interattivo e le operazioni che richiedono l'input dell'utente falliscono a meno che non dispongano di un percorso di policy non interattivo.

## Build di distribuzione

Il target Make predefinito compila ogni helper nativo e incorpora ogni payload nella variante Go build corrispondente:

```sh
make all
```

`UI_ADAPTERS` controlla quali aiutanti entrano nel binario. `DIALOG_BACKEND` imposta il valore predefinito compilato:

```sh
make all UI_ADAPTERS=adwaita DIALOG_BACKEND=adwaita
make all UI_ADAPTERS=kde,qt DIALOG_BACKEND=auto
make all UI_ADAPTERS=builtin DIALOG_BACKEND=builtin
```

`all` e `builtin` sono selezioni complete e non possono essere combinate con un altro valore. Una selezione separata da virgole incorpora solo gli helper denominati.

La compilazione nativa richiede una toolchain C e C++, `pkg-config`, file di sviluppo GTK 3, file di sviluppo libadwaita e file di sviluppo Qt 6 Widgets. Una build che seleziona un adattatore necessita solo del toolkit di quell'adattatore.

I tag Go build equivalenti sono:

| Adattatore | Costruisci tag |
| -------- | ----------------- |
| integrato | `cpak_ui_builtin` |
| Advaita | `cpak_ui_adwaita` |
| GTK | `cpak_ui_gtk` |
| KDE | `cpak_ui_kde` |
| Qt | `cpak_ui_qt` |

Il Makefile prima compila gli eseguibili nativi, quindi esegue `cmd/cpak-ui-bundle` per generare l'origine del payload Go utilizzato per quella build. Le invocazioni dirette di `go build` possono utilizzare i tag senza incorporare un carico utile quando gli helper corrispondenti vengono installati separatamente.

## Aiutanti esterni

Una build gestita da pacchetti può installare gli helper sotto una di queste directory:

```text
$HOME/.local/libexec/cpak/ui
/usr/libexec/cpak/ui
/usr/local/libexec/cpak/ui
```

`CPAK_UI_ADAPTER_DIR` punta una build di sviluppo a un'altra directory. Una build ufficiale con un helper incorporato lo materializza prima sotto `$XDG_CACHE_HOME/cpak/ui-adapters/<digest>` e ne verifica il protocollo eseguibile prima dell'uso.

Ogni helper implementa la versione 1 del protocollo. `probe` stampa la sua identità:

```text
cpak-ui 1 adwaita
```

L'operazione `prompt` riceve etichette, identità dell'applicazione, ambito delle risorse, scelte predefinite e se l'azione primaria è consigliata. Restituisce una decisione e i valori dell'ambito selezionati sull'output standard. L'operazione `progress` riceve record di avanzamento separati da tabulazioni sull'input standard fino al termine dell'operazione. cpak rifiuta le risposte non valide e utilizza il backend integrato.

## Confezione dell'applicazione

Le applicazioni non dipendono da un adattatore di dialogo specifico. Il pacchetto manifest dichiara l'operazione, ad esempio `filePicker`, mentre l'utente o la distribuzione seleziona il modo in cui cpak presenta la propria conferma. Non aggiungere librerie di toolkit a un'image dell'applicazione esclusivamente per le finestre di dialogo cpak.

Il comportamento del selettore file, la durata della grant e la revoca sono documentati in [Accesso al selettore file](/docs/file-access). Le permessi del pacchetto sono elencate in [permessi](/docs/permissions).

## Verifica

Costruisci ogni helper ufficiale e controlla il suo protocollo prima di pubblicare un binario cpak:

```sh
make ui-adapters UI_ADAPTERS=all
.build/ui-adapters/cpak-ui-adwaita probe
.build/ui-adapters/cpak-ui-gtk probe
.build/ui-adapters/cpak-ui-kde probe
.build/ui-adapters/cpak-ui-qt probe
```

Testa il backend nativo selezionato sul suo desktop e testa il fallback integrato con `CPAK_UI_ADAPTER=builtin`. Una distribuzione che modifica il set incorporato dovrebbe anche creare le combinazioni di tag Go pertinenti e confermare che non è possibile selezionare un helper escluso.