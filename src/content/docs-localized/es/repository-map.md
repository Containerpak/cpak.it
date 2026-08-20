---
title: Mapa del repositorio
description: Busque el proyecto propietario del runtime, el paquete, la imagen, el SDK, el agente, la Store o el cambio en el sitio web.
tags: [contributing, repositories, ownership]
section: project
order: 20
---
# Mapa del repositorio

Utilice este mapa antes de abrir un cambio. Los límites del repositorio siguen el ciclo de vida de propiedad y release.

## runtime e integración

| Repositorio | posee |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [Containerpak/cpak](https://github.com/Containerpak/cpak) | CLI, resolución OCI, transacciones, runtime, entorno de pruebas, intermediarios, manifests y esquema. |
| [Containerpak/almacenamiento](https://github.com/Containerpak/storage) | Protocolo de driver de almacenamiento versionado, cliente, servidor, índice de runtime y conjunto de conformidad. |
| [fvs-laboratorio/núcleo](https://github.com/fvs-lab/core) | Bloques definidos por contenido y Store compartida dirigida a contenido. |
| [fvs-laboratorio/fvs2](https://github.com/fvs-lab/fvs2) | Repositorios inmutables, instantáneas, referencias, verificación, restauración y recolección de basura compartida. |
| [fvs-laboratorio/fvs2d](https://github.com/fvs-lab/fvs2d) | Servicio FUSE independiente FVS para consumidores que necesitan vistas de repositorio montadas. |
| [mirkobrombin/DaBaDee](https://github.com/mirkobrombin/DaBaDee) | Deduplicación de archivos genéricos y compatibilidad con Stores cpak anteriores. |

La branch predeterminada del runtime cpak es `v2`. Los providers de integración de host y los drivers de almacenamiento integrados FVS y DaBaDee se encuentran en la release cpak. El protocolo es un módulo independiente, por lo que se puede implementar un driver en cualquier idioma. FVS proyectos y DaBaDee siguen siendo componentes de uso general con su propio ciclo de vida de inicio.

## Imágenes compartidas

| Repositorio | posee |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [Containerpak/imágenes](https://github.com/Containerpak/images) | Imágenes generales de runtime base compartidas por paquetes cpak. |
| [Containerpak/vino](https://github.com/Containerpak/wine) | Entorno multiarca utilizado por paquetes que proporcionan su propio runtime derivado de Wine. |

Una imagen compartida contiene contenido en runtime utilizado por varios paquetes. La aplicación consumidora permanece a su propia imagen.

## Paquetes y SDK

Los paquetes oficiales se encuentran en un repositorio por aplicación en [Containerpak](https://github.com/Containerpak). Bottles, UMU, Firefox, Chrome, VS Code, GIMP, Inkscape, LibreOffice, OBS Studio y VLC poseen cada uno su workflow de imágenes y manifests.

Las toolchains lingüísticas utilizan el mismo modelo:

| Repositorio | Proporciona |
| ------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [Containerpak/sdk-go](https://github.com/Containerpak/sdk-go) | Vaya al compilador y formateador para entornos de desarrollo cpak. |
| [Containerpak/sdk-nodo-lts](https://github.com/Containerpak/sdk-node-lts) | Node.js LTS, npm, npx y Corepack. |

Un editor enumera los orígenes de SDK compatibles como complementos. El repositorio del SDK posee paths de compatibilidad de la toolchain y pruebas de arquitectura.

## Descubrimiento y documentación

| Repositorio | posee |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [Containerpak/Store](https://github.com/Containerpak/store) | Se revisaron metadatos del catálogo, categorías, íconos originales, capturas de pantalla e índices generados. |
| [Containerpak/cpak.es](https://github.com/Containerpak/cpak.it) | Sitio web, interfaz de Store, renderizador de documentación y páginas de proyecto. |

La entrada de la Tienda apunta a un repositorio de paquetes. Ese repositorio posee `cpak.json` y su ciclo de vida de imagen OCI.

## A dónde pertenece una solución

Coloque el espacio de nombres, la transacción, el permiso, OCI, el corredor o el comportamiento de CLI en `cpak`. Coloque el contrato del cable del driver de almacenamiento y las verificaciones de conformidad en `Containerpak/storage`. Coloque el almacenamiento en bloque y el comportamiento de las instantáneas en el repositorio FVS correspondiente. Coloque la deduplicación genérica del árbol de archivos en DaBaDee. Coloque una dependencia de la aplicación o inicie una solución alternativa en el repositorio de paquetes de esa aplicación. Coloque contenido ABI compartido en una imagen base solo cuando varios paquetes lo necesiten.

Cuando un cambio cruza repositorios, mantenga cada commit válida de forma independiente y actualice el consumidor solo después de que la release o imagen de la dependencia esté disponible.