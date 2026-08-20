---
title: cpak-instalador
description: Instale una aplicación de la Tienda con el instalador gráfico o de terminal firmado, o agregue descargas del instalador a una página de paquete.
tags: [installer, store, security, publishing]
section: start
order: 15
---
# cpak-instalador

cpak-installer es un ejecutable firmado para una aplicación de la Tienda. Contiene los binarios `cpak` y `cpak-storaged` coincidentes, además de metadatos de paquetes verificados. En el momento de la instalación, resuelve el manifest, la imagen OCI, las dependencias, los permisos y las exportaciones de escritorio.

## Para usuarios

Abra una aplicación en la [cpak Store](/store) y seleccione **Descargar instalador**. La Tienda elige la arquitectura actual cuando sea posible. El menú al lado del botón también proporciona el comando de terminal equivalente y una URL de instalación directa.

Los navegadores normalmente guardan el archivo sin el bit ejecutable. Habilite la ejecución en las propiedades del archivo o ejecute:

```bash
chmod +x Application-amd64.cpak-installer
./Application-amd64.cpak-installer
```

Al abrir el archivo desde un escritorio X11 o XWayland se muestra el nombre de la aplicación, el icono original, la descripción, la fuente, los permisos solicitados, el progreso de la instalación y el resultado final. Iniciar el mismo archivo desde una terminal muestra un texto de commit e informa el progreso allí. Utilice `--terminal` para solicitar la interfaz del terminal explícitamente.

El instalador coloca o actualiza `cpak` y `cpak-storaged` en `~/.local/bin`, luego instala el paquete seleccionado desde su revisión Git fijada. Los binarios de runtime coincidentes se reutilizan.

Inspeccione los metadatos verificados sin instalar nada:

```bash
./Application-amd64.cpak-installer --inspect
```

El comando imprime el origen del paquete, los metadatos de visualización, la arquitectura, la referencia de origen, los permisos solicitados y el resumen del instalador.

## Lo que verifica la descarga

Cada cápsula lleva metadatos firmados con Ed25519. La firma cubre:

- el origen del paquete y la referencia inmutable Git
- el nombre de la aplicación, la descripción, el icono y los permisos solicitados
- la arquitectura de destino
- el resumen SHA-256 de la base completa del instalador

cpak-installer verifica la firma, el esquema de metadatos, la arquitectura y el resumen base completo antes de mostrar la interfaz o escribir un archivo. Cambiar la identidad de la aplicación, la referencia de origen, los permisos, los archivos binarios de runtime integrados o el código del instalador invalida la cápsula.

Cada binario en runtime se escribe a través de un archivo temporal y se le cambia el nombre solo después de que la escritura se realiza correctamente. Luego, la instalación del paquete sigue la misma path de transacción y validación del manifest que `cpak install`.

## Para desarrolladores de paquetes

Publique un repositorio de paquetes válido y sus OCI imágenes, luego agregue la entrada revisada a [Containerpak/store](https://github.com/Containerpak/store). El workflow de la release cpak produce una base de instalador para cada arquitectura compatible y un catálogo firmado que describe cada paquete listado.

La Tienda ensambla una descarga cuando se solicita este punto final:

```text
https://cpak.it/install/github.com/OWNER/REPOSITORY?arch=amd64
```

Utilice `arch=arm64` para ARM64. El punto final carga la base del instalador y el catálogo de la release cpak configurada, verifica el resumen base con el catálogo, agrega los metadatos y la firma del paquete y devuelve el resultado como `application/vnd.cpak.installer`.

El origen de la Store solicitado y el catálogo de inicio firmado son entradas exclusivas de identidad del paquete. Una base de instalador sirve para cada paquete listado.

Enlace al punto final para obtener una path de instalación gráfica directa. Publique el comando de terminal al lado:

```bash
cpak install github.com/OWNER/REPOSITORY
```

La página de la aplicación Store publica ambos formularios en su menú de descarga. Las bases de instalación y los metadatos de los paquetes se generan mediante el workflow de la release cpak.

## Liberar propiedad

Las releases versionadas cpak publican estos activos para `amd64` y `arm64`:

```text
cpak-linux-ARCH
cpak-storaged-linux-ARCH
cpak-installer-linux-ARCH
cpak-installer-catalog.json
SHA256SUMS
```

La base del instalador genérico contiene la interfaz del instalador y ambos archivos binarios de runtime de la misma release. El catálogo contiene metadatos de paquetes firmados y el resumen base esperado. cpak.it combina estos artefactos verificados después de verificar el resumen base.

Consulte [Canales de inicio](/docs/release-channels) para seleccionar la release, [Publicar en la Store](/docs/publishing) para conocer los requisitos del catálogo y [Informes de seguridad](/docs/security) para obtener informes de vulnerabilidad privados.