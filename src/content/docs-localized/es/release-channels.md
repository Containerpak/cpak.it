---
title: Canales de inicio
description: Elija builds cpak nocturnas, continuas o versionadas y comprenda lo que promete cada canal.
tags: [releases, versions, ci]
section: operations
order: 60
---
# Canales de inicio

cpak publica archivos binarios estáticos `cpak` y `cpak-storaged` Linux además de bases de instaladores de Store para `amd64` y `arm64`. Cada build publicada incluye SHA-256 sumas de verificación, un SPDX JSON SBOM y GitHub certificaciones para los binarios y SBOM.

## Continuo

La [liberación continua](https://github.com/Containerpak/cpak/releases/tag/continuous) sigue a impulsos exitosos a la branch `v2`. Es la fuente de instalación actual para desarrolladores y el inicio experimental cpak.

Continuo recibe los cambios v2 completos antes de un inicio versionado. Lea el estado de commit y workflow antes de usarlo en datos de aplicaciones irremplazables.

## Nocturno

El inicio nocturno se produce mediante la build programada o una ejecución manual del workflow nocturno. Verifica el repositorio en ese punto incluso cuando ninguna nueva commit llegó al canal continuo ese día.

Úselo todas las noches para pruebas tempranas de compatibilidad y cobertura automatizada. No asuma que una build nocturna tiene una ventana de soporte más larga que su commit de origen.

## Lanzamientos versionados

Las tags que coinciden con `v*` publican activos de release versionados y notas de release generadas. Una release versionada es la referencia que se utiliza cuando un proyecto necesita un release cpak revisable y con nombre.

El binario informa un identificador de desarrollo como `0.0.0-<commit>` cuando se crea desde un branch. Las builds etiquetadas informan su release de inicio.

Las descargas del instalador de la Store contienen el binario cpak correspondiente. El catálogo firmado registra su SHA-256 y fija cada paquete en un commit Git, por lo que un instalador de la Tienda versionado instala la build cpak producida por ese workflow de inicio y la revisión del paquete seleccionada cuando se creó el inicio.

## Comprobaciones de actualización en runtime

Los binarios oficiales comprueban la última release como máximo una vez al día. Ejecute una verificación o instalación inmediata:

```bash
cpak self-update --check
cpak self-update
```

El instalador verifica ambos archivos binarios de runtime para la arquitectura seleccionada con las sumas de verificación de la release antes de reemplazar los archivos instalados. Las releases candidatas son más antiguas que la release estable correspondiente, por lo que un release estable reemplaza a su candidata incluso cuando la release numérica es igual.

Los empaquetadores construyen con `SELF_UPDATE_MODE=managed`. Esto mantiene el aviso de release y deshabilita el reemplazo directo:

```bash
make VERSION=v2.1.2 SELF_UPDATE_MODE=managed
```

La release de inicio y el modo de actualización se compilan en el binario. No parchee el comando de runtime ni elimine la verificación de actualización en una receta de paquete.

## Verificar un activo

Descargue el binario correspondiente y `SHA256SUMS`, luego verifíquelo antes de la instalación:

```bash
sha256sum -c SHA256SUMS --ignore-missing
```

GitHub las certificaciones proporcionan otra path de verificación para la procedencia de la release. El SBOM enumera las dependencias capturadas por el workflow de inicio.

## Lanzamientos de paquetes

Los paquetes de aplicaciones tienen su propio repositorio y ciclo de vida de imágenes OCI. Actualícelos con `cpak update` y revise cualquier nueva solicitud de permiso.

Los flujos de trabajo de imágenes de paquetes deben publicar una tag SHA inmutable junto a la tag de branch móvil. Los archivos bloqueados y los resúmenes de imágenes instalados conservan el contenido exacto utilizado por una prueba o transacción.