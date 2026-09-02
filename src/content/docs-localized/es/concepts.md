---
title: cpak conceptos
description: El pequeño conjunto de objetos detrás de paquetes, layers, estados, permisos y releases.
tags: [basics, architecture]
section: start
order: 30
---

# cpak conceptos

cpak separa la identidad del paquete del contenido del paquete. Un repositorio Git describe el paquete y un registro OCI almacena sus layers de imagen.

## Origen

El origen es el repositorio de paquetes sin protocolo ni seguimiento `.git`, como `github.com/bottlesdevs/bottles`. Es la identidad estable utilizada por los comandos de instalación, actualización, ejecución, override, complementos y reversión.

Un alias es un acceso directo local para un origen instalado. Las actualizaciones continúan resolviendo desde el repositorio de paquetes original.

## manifest

`cpak.json` es el contrato del paquete. El manifest v3 declara:

- metadatos del paquete y una imagen OCI fijada por digest
- binarios exportados y entradas de escritorio
- requerido cpak dependencias y complementos opcionales
- comportamiento del ciclo de vida inactivo
- permisos de filesystem, dispositivos, servicios de escritorio, broker, red y recursos
- artefactos verificados que deben instalarse en el momento de la instalación del paquete

La validación rechaza los campos desconocidos, las tags de imagen modificables y los sockets directos del host que se eliminaron.

## Imagen y layers

La imagen contiene el filesystem de la aplicación. cpak resuelve la imagen en un resumen OCI inmutable y almacena cada layer por su resumen de contenido. Los paquetes que hacen referencia a los mismos bytes comparten esas layers.

El origen sigue siendo la identidad del paquete cuando una actualización cambia su referencia de imagen. Los datos de la aplicación siguen el origen de esas actualizaciones.

## Estado grabable

Los layers de imagen inmutables se montan debajo de un layer de aplicación grabable. Las escrituras de la aplicación van a esa layer. Los registros de paquetes, el estado de ejecución, los registros y los archivos de escritorio exportados utilizan paths de almacenamiento y recuperación independientes.

## Dependencias y complementos

El paquete requiere una dependencia y se instala con él. Su manifest es parte del gráfico de dependencia resuelto.

Un complemento es opcional. El autor del paquete declara qué orígenes de complementos son compatibles y el usuario habilita una selección para una aplicación instalada. Los SDK utilizan este mecanismo para agregar toolchains a los editores sin reconstruir la imagen del editor.

## Permisos y overrides

El manifest declara el acceso al host predeterminado para una aplicación. Una override de usuario cambia el permiso efectivo establecido localmente. Las actualizaciones comparan los permisos efectivos antiguos y nuevos, y las nuevas concesiones requieren aprobación en el flujo interactivo.

Los permisos controlan recursos concretos y acciones de intermediarios. Esto incluye paths, dispositivos, sockets, espacios de nombres de red, espacios de nombres de usuarios anidados, límites de recursos, notificaciones, apertura de URI externos, aplicaciones de host y servicios de host escritos.

## Referencias fuente

Un paquete puede seguir un branch, seleccionar un release o fijar un commit exacta. Las instalaciones confirmadas permanecen fijadas durante la actualización. Los archivos de bloqueo registran hashes de manifest inmutables y resúmenes OCI para desarrollo local y CI.

## Tienda y catalogo

Cualquier origen de paquete válido se puede instalar directamente. La [Containerpak Tienda](/store) agrega metadatos de descubrimiento, categorías, íconos y capturas de pantalla revisados. Los manifests y las imágenes de los paquetes permanecen en sus repositorios y registros originales.
