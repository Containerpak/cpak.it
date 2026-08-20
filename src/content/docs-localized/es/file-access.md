---
title: Acceso al selector de archivos
description: Otorgue archivos y carpetas seleccionados sin exponer el directorio personal del host.
tags: [permissions, files, desktop]
section: runtime
order: 30
---
# Acceso al selector de archivos

Una aplicación cpak tiene un hogar persistente privado a menos que su manifest monte explícitamente el hogar host. El permiso de selección de archivos permite al usuario traer archivos o carpetas host individuales a ese entorno cuando sea necesario.

La aplicación abre su selector de archivos nativo habitual. cpak maneja la solicitud en el host, aplica la política del paquete y monta cada selección aceptada debajo de `/run/cpak/grants`. La path devuelta a la aplicación siempre apunta a ese árbol de concesión privado.

Algunos selectores de escritorio pueden presentar ellos mismos las opciones de alcance y vida útil. Cuando no pueden, cpak utiliza el adaptador de diálogo de escritorio configurado y recurre a su diálogo integrado. Cerrar o negar ese segundo diálogo cancela la solicitud.

Una selección que ya está cubierta por las entradas `filesystem` del paquete mantiene su path normal y no necesita una segunda commit. El cuadro de diálogo integrado sigue la preferencia clara u oscura del host y el color de acento estándar de Freedesktop, incluidos los acentos personalizados publicados por el escritorio.

## Política manifiesta

Habilite solo las operaciones utilizadas por la aplicación:

```json
"filePicker": {
  "openFile": true,
  "openFolder": true,
  "saveFile": true,
  "persistent": true,
  "containingFolder": true
}
```

| Campo | Efecto |
| ------------------ | ------------------------------------------------------------------ |
| `openFile` | Seleccione uno o más archivos existentes. |
| `openFolder` | Seleccione una carpeta existente. |
| `saveFile` | Seleccione un destino de escritura para un archivo nuevo. |
| `persistent` | Ofrezca acceso que se pueda restaurar en inicios posteriores. |
| `containingFolder` | Ofrezca la carpeta que contiene el archivo seleccionado como contexto adicional. |

Al seleccionar un archivo, dicho archivo se otorga como de solo lectura de forma predeterminada. El acceso a la carpeta contenedora es una decisión independiente del usuario y aparece solo cuando el manifest lo permite. Es útil para ejecutables que cargan archivos uno al lado del otro, mientras que los documentos y las cargas pueden permanecer aislados en un solo archivo.

Una selección de carpeta otorga a la carpeta elegida acceso de solo lectura. Una solicitud de guardado otorga lectura y escritura a su directorio principal para que la aplicación pueda crear el nombre seleccionado y completar un guardado atómico.

Utilice una subruta de inicio portátil cuando el paquete siempre necesite un directorio de aplicación pero no deba recibir el inicio de host completo:

```json
"filesystem": [
  {"path": "home/.local/share/example", "access": "read-write"}
]
```

Las selecciones dentro de ese directorio mantienen su path normal y omiten la commit cpak. Los archivos seleccionados en otro lugar utilizan una concesión dinámica.

## Vida

Una concesión de sesión pertenece al entorno de aplicación actual y desaparece cuando se detiene. Se almacena una concesión persistente para ese paquete, se vuelve a montar en el momento del inicio y permanece visible hasta que el usuario la revoca.

El administrador gráfico enumera las concesiones persistentes y detiene una aplicación en ejecución después de la revocación para que el montaje anterior no pueda permanecer activo:

```sh
cpak grant manage github.com/example/app
```

Las mismas operaciones están disponibles para los scripts:

```sh
cpak grant list github.com/example/app
cpak grant list github.com/example/app --json
cpak grant revoke github.com/example/app GRANT_ID
```

Se acepta un prefijo de identificación cuando identifica una concesión.

## Flujo de solicitudes

Una solicitud cruza el límite del paquete mediante una secuencia fija:

1. Se comprueba que el manifest tenga la capacidad de apertura, carpeta o guardado solicitada.
2. El selector de host devuelve una o más paths de archivos locales.
3. cpak solicita cualquier carpeta principal opcional o acceso persistente no recopilado por el seleccionador.
4. El intermediario resuelve y abre cada objeto seleccionado en el host.
5. El espacio de nombres de montaje activo recibe un montaje restringido y la aplicación recibe su path de invitado.

El corredor acepta como máximo 128 paths y rechaza URI remotos, filtros con formato incorrecto, nombres guardados no válidos y selecciones que cambian de tipo mientras se abren. Un archivo normal y un directorio producen diferentes conjuntos de descriptores para que el trabajador de montaje pueda verificar el objeto esperado antes de adjuntarlo.

La path del resultado es estable para la identidad de concesión. Normalmente aparece un solo archivo en `/run/cpak/grants/GRANT_ID/FILE_NAME`. Una concesión de carpeta contenedora monta el directorio y devuelve el elemento secundario seleccionado debajo de él. Las aplicaciones deben utilizar la path devuelta en lugar de construir una path dentro del árbol de concesión.

## Integración de aplicaciones

Las aplicaciones GTK pueden mantener su selector de archivos normal. cpak coloca un adaptador de bus de escritorio en el entorno de la aplicación e intercepta las solicitudes de selección de archivos antes de reenviar cualquier acceso al bus de sesión permitido por el manifest. Sin el permiso general del bus de sesión, el adaptador rechaza destinos no relacionados.

Las aplicaciones que necesitan una integración directa pueden utilizar el shim instalado:

```sh
cpak-file-picker open-file \
  --title "Select an executable" \
  --accept-label "Run" \
  --filter "Windows executables|*.exe;*.msi"
```

Utilice `--multiple` para varios archivos, `open-folder` para un directorio o `save-file --suggested-name report.pdf` para un destino. Un comando exitoso imprime paths de invitados, una por línea.

El corredor transporta solicitudes estructuradas a través de un socket Unix privado. Los objetos seleccionados se pasan al espacio de nombres del montaje en ejecución a través de descriptores de archivos, por lo que el montaje permanece adjunto al objeto aprobado por el usuario incluso si cambia la path del host. El adaptador de escritorio puede utilizar los servicios disponibles en la sesión actual, pero el protocolo de concesión y el runtime sin cabeza no dependen de D-Bus.

El adaptador de bus de escritorio restringido reenvía el tráfico de bus de sesión normal solo cuando `socketSessionBus` está habilitado. Las llamadas al selector de archivos siguen estando disponibles solo con `filePicker`. Esto proporciona a las aplicaciones GTK y GIO su API esperada sin exponer servicios de bus no relacionados.

Las commits en runtime utilizan el backend seleccionado por el usuario o la distribución. Consulte [Adaptadores de diálogo de escritorio](/docs/desktop-dialogs) para obtener coincidencias automáticas de escritorios, archivos de configuración, tags de build y ubicaciones de ayuda externa.

## Entornos sin cabeza

Una solicitud interactiva no se cierra cuando no hay ningún selector de escritorio compatible disponible. Las concesiones persistentes aún se pueden enumerar y revocar desde la CLI. Un workflow de servidor debe declarar una path estrecha del filesystem en el manifest o utilizar una concesión persistente preestablecida en lugar de intentar abrir un selector gráfico.

La cancelación también está cerrada por defecto. Cerrar el selector, negar la commit cpak, recibir una respuesta de adaptador con formato incorrecto o perder la conexión del intermediario no devuelve ningún montaje nuevo a la aplicación.