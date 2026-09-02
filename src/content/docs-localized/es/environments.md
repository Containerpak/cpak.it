---
title: Entornos persistentes
description: Cree entornos Linux modificables a partir de paquetes de distribución, conserve su estado y administre permisos y procesos.
tags: [entorno, distribuciones, shell, permisos]
section: operations
order: 15
---

# Entornos persistentes

Un entorno cpak convierte un paquete instalado en un espacio de trabajo modificable con nombre. Los paquetes de distribución usan esta interfaz para ofrecer Fedora, Ubuntu, Debian, Arch Linux, openSUSE y otros sistemas completos de línea de comandos sin sustituir el runtime de cpak.

El paquete sigue definiendo la base inmutable, el origen de las actualizaciones y el límite máximo de permisos. El entorno añade una capa escribible persistente y un hogar privado. Los paquetes instalados, la configuración y los archivos permanecen después de detener el entorno o reiniciar el host.

## Cree y abra un entorno

Instale primero el paquete de la distribución. El entorno queda vinculado a la identidad de ese paquete instalado:

```bash
cpak install github.com/containerpak/archlinux
cpak environment create --name arch --origin github.com/containerpak/archlinux
cpak environment shell --environment arch
```

`--environment` acepta el nombre o el ID que muestra `cpak environment list`. Los nombres no distinguen mayúsculas y minúsculas y deben ser únicos.

La acción `shell` ejecuta `sh -i` de forma predeterminada. Seleccione otro comando y pase sus argumentos después de los argumentos de la acción:

```bash
cpak environment shell --environment arch --command /bin/bash -- -l
```

El código de otro paquete no puede iniciar un entorno. Es un espacio de trabajo del usuario host, no una forma de adquirir la autoridad de otro paquete.

## Estado persistente y actualizaciones

Detener un entorno termina su contenedor activo, pero conserva la capa escribible, el hogar privado, la base de datos del gestor de paquetes y los metadatos:

```bash
cpak environment stop --environment arch
```

El siguiente acceso usa el mismo estado. Al actualizar el paquete de la distribución, el entorno pasa a la nueva versión y conserva su capa escribible:

```bash
cpak update github.com/containerpak/archlinux
cpak environment shell --environment arch
```

Elimine el entorno solo cuando ya no necesite los paquetes instalados y sus datos:

```bash
cpak environment delete --environment arch
```

La eliminación detiene el contenedor y borra los metadatos, la capa escribible y los datos privados del entorno. No desinstala el paquete de la distribución.

## Inspeccione los entornos

```bash
cpak environment list
cpak environment inspect --environment arch
cpak environment inspect --environment arch --json
```

`list` muestra el nombre, el origen del paquete, la versión y el ID estable. `inspect` imprime el registro seleccionado. Use `--json` para automatización.

## Política de permisos

Un entorno comienza con la política efectiva de su paquete instalado. Su política local puede quitar permisos, pero no añadir nada por encima de ese límite.

Muestre por separado la política actual y el límite del paquete:

```bash
cpak environment policy --environment arch
cpak environment permissions --environment arch
```

Para restringir el entorno, guarde un objeto override completo y aplíquelo:

```json
{
  "network": false,
  "hostNetwork": false,
  "filesystem": [],
  "env": []
}
```

```bash
cpak environment policy --environment arch --policy policy.json
```

Use `--policy -` para leer el objeto JSON desde la entrada estándar. Aplicar una política detiene el entorno activo para que el siguiente shell empiece con el nuevo límite. Se rechaza cualquier política que amplíe los permisos del paquete instalado.

## Procesos y señales

La inspección de procesos queda limitada al entorno en ejecución seleccionado:

```bash
cpak environment processes --environment arch
cpak environment processes --environment arch --json
cpak environment signals
cpak environment signal --environment arch --pid 1234 --signal TERM
```

El PID debe pertenecer a ese entorno. `cpak environment signals` enumera los nombres admitidos; se rechazan las señales numéricas arbitrarias o desconocidas.

## Instrucciones específicas del paquete

Lea la página del paquete en la [cpak Store](/store/Distributions) antes de crear un entorno. Quien mantiene una distribución puede publicar un `STORE-README.md` junto a `cpak.json` con el gestor de paquetes, el primer comando de actualización, las notas de acceso y los límites de arquitectura exactos para esa release.
