---
title: Fuentes de runtime
description: Agregue archivos verificados, paquetes nativos o archivos de providers en el momento de la instalación.
tags: [manifest, packages, runtime]
section: packages
order: 45
---
# Fuentes de runtime

La mayoría de los archivos de paquetes pertenecen a la imagen OCI. Una fuente de runtime cubre el conjunto más pequeño de archivos que deben provenir de un artefacto HTTPS separado, como archivos de integración de providers o un paquete nativo publicado independientemente de la imagen.

cpak descarga cada fuente durante la instalación, verifica su tamaño declarado y SHA-256, luego lo instala en un layer administrada. El layer sigue al paquete a través de actualizaciones, reversión, auditoría y eliminación.

## Entrada manifiesta

Cada fuente declara un instalador:

```json
"runtime_sources": [
  {
    "name": "desktop-integration-1.0.0.tar.gz",
    "url": "https://downloads.example.org/desktop-integration-1.0.0.tar.gz",
    "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "size": 4096,
    "installer": "tar"
  }
]
```

`name` es opcional y debe ser un nombre de archivo simple. Sin él, cpak usa el nombre del archivo de la URL. La URL debe utilizar HTTPS y no puede redirigir a una descarga no segura.

## Instaladores

| Instalador | Artefacto aceptado | Requisito en el entorno del paquete. |
| ------------- | -------------------------------- | -------------------------------------- |
| `tar` | Archivo tar sin comprimir o gzip | Ninguno |
| `dpkg` | paquete debian | `/usr/bin/dpkg` |
| `deb-extract` | paquete debian | `/usr/bin/dpkg-deb` |
| `rpm` | paquete RPM | `/usr/bin/rpm` |
| `file` | Fila india | Ninguno |

Los instaladores nativos se ejecutan dentro de la raíz del paquete, por lo que sus dependencias y scripts ven el mismo filesystem que se convertirá en el layer administrada. Elija un instalador que exista en la imagen de la plataforma seleccionada.

`dpkg` verifica las dependencias del paquete y ejecuta scripts de mantenimiento. `deb-extract` solo descomprime el archivo de datos de Debian. Está destinado a paquetes cuyos nombres de dependencia declarados ya no coinciden con la plataforma aunque el ABI requerido esté presente. No ejecuta `preinst`, `postinst`, `prerm` o `postrm`.

El instalador `tar` escribe paths de archivo relativas a `/` en el paquete. Un archivo almacenado como `usr/share/applications/example.desktop` se convierte en `/usr/share/applications/example.desktop`. Se rechazan las paths absolutas, el recorrido principal, los enlaces fuera de la raíz del paquete y las entradas de dispositivos.

El instalador `file` copia un artefacto verificado en el `destination` declarado. El destino debe ser una path absoluta debajo de `/opt`, no puede contener un recorrido principal y no puede reemplazar un enlace simbólico:

```json
{
  "name": "application.jar",
  "url": "https://downloads.example.org/application.jar",
  "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "size": 4096,
  "installer": "file",
  "destination": "/opt/application/application.jar"
}
```

## Cuando usar uno

Mantenga los archivos de aplicación normales en la build OCI. Esto proporciona registros y cpak layers estables para almacenar en caché y deduplicar. Utilice una fuente de runtime cuando el artefacto independiente forme parte del contrato del paquete y no sea sensato copiarlo en la imagen publicada.

Esto también cubre el software cuya licencia no permite a un tercero publicar la payload de la aplicación. La imagen OCI puede contener el runtime redistribuible, el container y la integración de escritorio, mientras que `runtime_sources` apunta a la descarga oficial del provider. La instalación cpak del usuario descarga el artefacto anclado desde ese origen y construye el layer administrada localmente.

No utilice fuentes de runtime como paso de descarga no marcado. Fije el tamaño exacto y SHA-256 en `cpak.json`, publique URL de artefactos inmutables y regenere el archivo de bloqueo cuando cambie la fuente.

## Verificar una fuente

Compile o descargue el artefacto en CI y luego compárelo con el manifest antes de publicarlo:

```bash
test "$(sha256sum desktop-integration-1.0.0.tar.gz | cut -d' ' -f1)" = \
  "$(jq -r '.runtime_sources[0].sha256' cpak.json)"
test "$(stat -c '%s' desktop-integration-1.0.0.tar.gz)" = \
  "$(jq -r '.runtime_sources[0].size' cpak.json)"
cpak validate cpak.json
```

Una instalación se detiene antes de cambiar el paquete activo cuando la descarga, el tamaño, la suma de comprobación, el instalador o el diseño del archivo no son válidos.