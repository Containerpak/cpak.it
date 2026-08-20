---
title: Adaptadores de diálogo de escritorio
description: Seleccione, empaquete y reemplace el backend de diálogo nativo utilizado por cpak.
tags: [desktop, dialogs, distributions]
section: runtime
order: 35
---
# Adaptadores de diálogo de escritorio

cpak utiliza adaptadores de diálogo de escritorio para commits y ventanas de progreso que pertenecen al runtime, incluidas opciones de concesión de archivos, instalación de paquetes, actualizaciones y preparación de almacenamiento. El selector de archivos de la aplicación sigue siendo el selector nativo proporcionado por el escritorio del host.

El binario oficial cpak incluye Adwaita, GTK, KDE, Qt y la interfaz incorporada. Sólo se extrae e inicia el ayudante seleccionado. Un asistente faltante, una respuesta de protocolo no compatible o una falla en el proceso devuelven el control a la interfaz integrada.

## Selección automática

El backend `auto` lee `XDG_CURRENT_DESKTOP` y aplica el siguiente orden:

| De oficina | Servidor preferido | Retroceder |
| ------------------------- | ----------------- | -------- |
| GNOMO | Adwaita | incorporado |
| Plasma KDE | KDE, luego Qt | incorporado |
| MATE, Xfce, Canela | GTK | incorporado |
| LXQt | cuarto | incorporado |
| Otra coincidencia de escritorio o ninguna | incorporado | incorporado |

KDE y Qt utilizan widgets Qt. El asistente de KDE se identifica por separado para que la selección automática y la política de paquetes puedan distinguir una build orientada a Plasma sin necesidad de KDE Frameworks.

Una elección explícita se resuelve en este orden:

1. El backend pasó por la persona que llama cpak.
2. `CPAK_UI_ADAPTER` en el entorno del proceso.
3. `desktop.dialog_backend` en configuración `cpak.json`.
4. El valor predeterminado compilado en el binario.

Los valores admitidos son `auto`, `builtin`, `adwaita`, `gtk`, `kde` y `qt`.

## Configuración de runtime

Establezca una preferencia de usuario en `$XDG_CONFIG_HOME/cpak/cpak.json`, normalmente `~/.config/cpak/cpak.json`:

```json
{
  "desktop": {
    "dialog_backend": "adwaita"
  }
}
```

cpak verifica el archivo de usuario antes de `/etc/cpak/cpak.json` y `/usr/share/cpak/cpak.json`. `CPAK_OPTS_FILE` puede apuntar a un archivo de configuración completo, mientras que `CPAK_UI_ADAPTER` puede reemplazar solo el backend de un proceso:

```sh
CPAK_UI_ADAPTER=qt cpak run github.com/example/app
```

La interfaz incorporada siempre está disponible. Un proceso sin cabeza no fabrica un escritorio interactivo y las operaciones que requieren la entrada del usuario fallan a menos que tengan una path de política no interactiva.

## Construcciones de distribución

El destino Make predeterminado compila cada ayudante nativo e integra cada payload en la variante de build Go correspondiente:

```sh
make all
```

`UI_ADAPTERS` controla qué ayudantes ingresan al binario. `DIALOG_BACKEND` establece el valor predeterminado compilado:

```sh
make all UI_ADAPTERS=adwaita DIALOG_BACKEND=adwaita
make all UI_ADAPTERS=kde,qt DIALOG_BACKEND=auto
make all UI_ADAPTERS=builtin DIALOG_BACKEND=builtin
```

`all` y `builtin` son selecciones completas y no se pueden combinar con otro valor. Una selección separada por comas incorpora solo los ayudantes nombrados.

La build nativa necesita una toolchain C y C++, `pkg-config`, archivos de desarrollo GTK 3, archivos de desarrollo libadwaita y archivos de desarrollo de widgets Qt 6. Una build que selecciona un adaptador solo necesita el kit de herramientas de ese adaptador.

Las tags de build de Go equivalentes son:

| Adaptador | tag de build |
| -------- | ----------------- |
| incorporado | `cpak_ui_builtin` |
| Adwaita | `cpak_ui_adwaita` |
| GTK | `cpak_ui_gtk` |
| KDE | `cpak_ui_kde` |
| cuarto | `cpak_ui_qt` |

Makefile primero compila los ejecutables nativos y luego ejecuta `cmd/cpak-ui-bundle` para generar la fuente de payload de Go utilizada para esa build. Las invocaciones directas `go build` pueden usar las tags sin incorporar una payload cuando los asistentes coincidentes se instalan por separado.

## Ayudantes externos

Una build administrada por paquetes puede instalar ayudas debajo de uno de estos directorios:

```text
$HOME/.local/libexec/cpak/ui
/usr/libexec/cpak/ui
/usr/local/libexec/cpak/ui
```

`CPAK_UI_ADAPTER_DIR` apunta una build de desarrollo a otro directorio. Una build oficial con un asistente integrado la materializa primero a continuación `$XDG_CACHE_HOME/cpak/ui-adapters/<digest>` y verifica su protocolo ejecutable antes de su uso.

Cada ayudante implementa la release 1 del protocolo. `probe` imprime su identidad:

```text
cpak-ui 1 adwaita
```

La operación `prompt` recibe tags, identidad de la aplicación, alcance del recurso, opciones predeterminadas y si se recomienda la acción principal. Devuelve una decisión y los valores de alcance seleccionados en la salida estándar. La operación `progress` recibe registros de progreso separados por tabulaciones en la entrada estándar hasta que finaliza la operación. cpak rechaza respuestas con formato incorrecto y utiliza el backend integrado.

## Embalaje de aplicaciones

Las aplicaciones no dependen de un adaptador de diálogo específico. El manifest del paquete declara la operación, como `filePicker`, mientras que el usuario o la distribución selecciona cómo cpak presenta su propia commit. No agregue bibliotecas de kits de herramientas a la imagen de una aplicación únicamente para los cuadros de diálogo cpak.

El comportamiento del selector de archivos, la duración de la concesión y la revocación se documentan en [Acceso al selector de archivos](/docs/file-access). Los permisos de los paquetes se enumeran en [Permisos](/docs/permissions).

## Verificación

Construya cada ayudante oficial y verifique su protocolo antes de publicar un binario cpak:

```sh
make ui-adapters UI_ADAPTERS=all
.build/ui-adapters/cpak-ui-adwaita probe
.build/ui-adapters/cpak-ui-gtk probe
.build/ui-adapters/cpak-ui-kde probe
.build/ui-adapters/cpak-ui-qt probe
```

Pruebe el backend nativo seleccionado en su escritorio y pruebe el respaldo integrado con `CPAK_UI_ADAPTER=builtin`. Una distribución que cambia el conjunto integrado también debe crear las combinaciones de tags Go relevantes y confirmar que no se puede seleccionar un ayudante excluido.