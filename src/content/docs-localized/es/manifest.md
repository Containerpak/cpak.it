---
title: Referencia del manifest v3
description: Cada campo de nivel superior en cpak.json, con validación estricta y ejemplos portátiles.
tags: [manifest, reference]
section: packages
order: 20
---

# Referencia del manifest v3

Manifest v3 es el contrato JSON estricto actual. Fija la imagen OCI mediante un digest y sustituye los sockets de escritorio sin filtrar por operaciones tipadas y reglas exactas para el bus de sesión. Agregue la URL del esquema para recibir autocompletado y validación en el editor.

```json
{
  "$schema": "https://raw.githubusercontent.com/Containerpak/cpak/v2/schema/manifest-v3.json",
  "manifest_version": "3.0",
  "name": "Example",
  "description": "Example desktop application.",
  "version": "1.0.0",
  "image": "ghcr.io/example/example@sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "binaries": ["/usr/bin/example"],
  "desktop_entries": ["/usr/share/applications/example.desktop"],
  "dependencies": [],
  "addons": [],
  "idle_time": 0,
  "override": {
    "socketWayland": true,
    "deviceDri": true,
    "filesystem": [{ "path": "home", "access": "read-write" }],
    "network": true
  }
}
```

## Campos de paquete

| Campo              | Requerido | Significado                                                                              |
| ------------------ | --------- | ---------------------------------------------------------------------------------------- |
| `$schema`          | No        | JSON URI de esquema utilizado por los editores.                                          |
| `manifest_version` | Sí        | Debe ser `3.0`.                                                                          |
| `name`             | Sí        | Nombre de la aplicación legible por humanos.                                             |
| `description`      | Sí        | Breve descripción del paquete.                                                           |
| `version`          | No        | La release de la aplicación se muestra con cpak.                                         |
| `image`            | Sí        | Referencia de imagen OCI fijada con `@sha256:`.                                          |
| `binaries`         | Sí        | Una o más paths ejecutables absolutas.                                                   |
| `desktop_entries`  | No        | paths absolutas a `.desktop` archivos en la imagen.                                      |
| `sessions`         | No        | Sesiones de escritorio o quiosco ofrecidas a un administrador de pantalla.               |
| `dependencies`     | No        | Requerido cpak orígenes del paquete.                                                     |
| `addons`           | No        | Orígenes de complementos opcionales admitidos por este paquete.                          |
| `addon_provider`   | No        | Exportaciones de capacidad y runtime proporcionadas cuando se utilizan como complemento. |
| `idle_time`        | Sí        | Minutos antes de que se detenga un container inactivo. Zero desactiva el temporizador.   |
| `override`         | Sí        | Permisos de host predeterminados y límites de recursos.                                  |
| `runtime_sources`  | No        | Artefactos HTTPS verificados instalados en un layer administrada.                        |

Los campos anidados y de nivel superior desconocidos no superan la validación.

## Imagen inmutable

El campo `image` debe indicar un repositorio OCI y un digest. Las etiquetas como `main` y `latest` se rechazan, y `image_ref` no forma parte de v3. Escriba en `cpak.json` el digest devuelto por la compilación antes de firmar el estado del paquete.

## Dependencias

Cada dependencia necesita un origen. Un branch, un release o un commit puede seleccionar su referencia de origen.

```json
"dependencies": [
  {
    "origin": "github.com/containerpak/umu",
    "branch": "main"
  }
]
```

Utilice solo un selector de fuente por dependencia. El archivo de bloqueo registra el manifest de dependencia resuelto, su hash y el resumen de imagen OCI inmutable.

## Complementos

La matriz `addons` enumera los orígenes de los paquetes que pueden unirse a esta aplicación. Los complementos habilitados utilizan los permisos de host efectivos de los padres.

```json
"addons": [
  "github.com/containerpak/sdk-go",
  "github.com/containerpak/sdk-node-lts"
]
```

Un complemento puede declarar una ranura de provider con nombre y las paths que agrega a su padre:

```json
"addon_provider": {
  "id": "go",
  "slot": "sdk.go",
  "mode": "exclusive",
  "exports": {
    "path": ["/usr/local/go/bin"],
    "environment": ["GOROOT=/usr/local/go"]
  }
}
```

`exclusive` permite un provider activo en un espacio. `multiple` compone todos los providers disponibles. Consulte [Dependencias y complementos](/docs/dependencies-addons) para seleccionar el provider y cada exportación admitida.

## Fuentes de runtime

Una fuente de runtime descarga un artefacto HTTPS externo en el momento de la instalación y lo instala en un layer administrada.

```json
"runtime_sources": [
  {
    "name": "example.deb",
    "url": "https://downloads.example.org/example.deb",
    "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "size": 1048576,
    "installer": "dpkg"
  }
]
```

La URL debe utilizar HTTPS. cpak verifica el tamaño de bytes declarado y SHA-256 antes de ejecutar el instalador. Una discrepancia cancela la instalación.

Establezca `installer` en `dpkg`, `deb-extract`, `rpm`, `tar` o `file`. `dpkg` verifica las dependencias de los paquetes y ejecuta scripts de mantenimiento, mientras que `deb-extract` solo descomprime el archivo de datos de Debian. El instalador tar acepta archivos tar simples y comprimidos con gzip. La fuente de un archivo también declara un `destination` debajo de `/opt`. Lea [Fuentes de ejecución](/docs/runtime-sources) para conocer los requisitos del paquete, el diseño del archivo y las comprobaciones de CI.

## Permisos

El objeto `override` declara los valores predeterminados del paquete para sockets, dispositivos, paths del filesystem, operaciones de selección de archivos, redes, procesos compartidos, espacios de nombres de usuarios anidados, límites de recursos y acciones del agente del sistema. Consulte [Permisos](/docs/permissions) para conocer cada campo y su efecto.

Manifest v3 elimina `socketX11`, `socketSessionBus`, `socketSystemBus`, `socketAtSpiBus` y `socketBluetooth`. Las notificaciones, URI externos, selección de archivos y apertura de aplicaciones del host usan permisos tipados. No existe un permiso para el bus de sistema sin filtrar.

Una aplicación que necesite un método del bus de sesión puede declarar el destino, la ruta del objeto, la interfaz y los métodos aceptados mediante `sessionBus`. La lista `own` indica los nombres conocidos que puede adquirir el paquete.

### Política de selección de archivos

`filePicker` otorga operaciones, no paths de host. Cada campo está deshabilitado de forma predeterminada:

```json
"filePicker": {
  "openFile": true,
  "openFolder": false,
  "saveFile": true,
  "persistent": false,
  "containingFolder": false
}
```

`openFile`, `openFolder` y `saveFile` habilitan sus modos de selección coincidentes. `persistent` permite que la commit ofrezca una subvención que sobreviva al entorno actual. `containingFolder` permite que una solicitud de archivo ofrezca su directorio principal como contexto. El usuario aún aprueba el objeto seleccionado y cada concesión más amplia o más larga.

Utilice `filesystem` para paths que siempre deben existir dentro del paquete. Utilice `filePicker` cuando el acceso comience con una selección de usuario interactiva. Consulte [Acceso al selector de archivos](/docs/file-access) para conocer las paths de invitado y la revocación.

## Sesiones de inicio de sesión

La matriz `sessions` opcional convierte un binario exportado en una opción de escritorio o quiosco en la pantalla de inicio de sesión del sistema. Cada sesión tiene su propio conjunto de permisos. El registro es explícito y pasa por la autoridad del sistema cpak. Consulte [Sesiones de escritorio y quiosco](/docs/desktop-sessions).

## Validar y migrar

```bash
cpak validate cpak.json
cpak gen-schema --manifest-version 3.0 --output manifest-v3.json
cpak migrate-manifest old-cpak.json --output cpak.json
```

`migrate-manifest` convierte los campos v1 admitidos a su representación v2. Para pasar de v2 a v3, fije el digest OCI, elimine `image_ref`, sustituya los sockets retirados por permisos tipados o reglas `sessionBus`, establezca `manifest_version` en `3.0` y ejecute `cpak validate`.
