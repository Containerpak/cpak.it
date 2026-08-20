---
title: Preguntas frecuentes
description: Respuestas breves sobre demonios, OCI imágenes, portabilidad, Flatpak, Docker, almacenes de paquetes y estado de la aplicación.
tags: [faq, concepts]
section: project
order: 30
---
# Preguntas frecuentes

## ¿cpak necesita Docker o Podman?

No. Los autores de paquetes pueden utilizar cualquier constructor OCI estándar en CI. El runtime cpak instalado extrae y monta el contenido OCI directamente.

## ¿Es un paquete cpak una imagen OCI?

La imagen contiene archivos de aplicación. El paquete es el origen Git más su manifest validado, referencia de origen seleccionada, resumen de imagen resuelto, dependencias, permisos, exportaciones de escritorio y estado local.

## ¿Se requiere la Tienda?

No. Instale cualquier paquete válido por su origen Git. La Tienda proporciona metadatos y medios de descubrimiento revisados.

## ¿En qué se diferencia cpak de Flatpak?

cpak utiliza un manifest Git, contenido OCI, un binario de runtime, layers direccionadas por contenido, dependencias directas de paquetes, complementos y operaciones de host controladas por políticas.

Los formatos tienen diferentes contratos de distribución y sandbox. Las aplicaciones pueden detectar un inicio de cpak hasta `CPAK_CONTAINER_ID`.

## ¿cpak comparte tiempos de ejecución básicos?

Sí. Los layers OCI iguales se almacenan una vez y FVS almacena bloques de contenido iguales una vez en diferentes diseños de layers. Las imágenes base compartidas permanecen OCI entradas de build.

## ¿A dónde van los datos de la aplicación?

Cada paquete tiene un estado de escritura independiente de los layers de imagen inmutables. Los permisos explícitos del filesystem también pueden exponer paths de host seleccionadas. Eliminar un paquete y eliminar su estado es diferente a recolectar basura de layers inmutables no utilizadas.

## ¿Puede un paquete usar otro?

Las dependencias requeridas se instalan con el padre. Los complementos opcionales están habilitados por aplicación. Nested cpak agrega una path de ejecución controlada para una dependencia que necesita su propio entorno de paquetes.

## ¿Puedo agregar un SDK de idioma a un editor?

Sí. Instale un paquete SDK compatible y habilítelo como complemento para ese editor. La toolchain pasa a formar parte de la vista del runtime del editor.

## ¿Funciona cpak sin systemd?

Sí, siempre que el host proporcione las funciones del kernel y los recursos de sesión del usuario necesarios. Los límites del grupo c delegado dependen del administrador del grupo c host y es posible que no estén disponibles.

## ¿Las actualizaciones son automáticas?

`cpak update` actualiza una o todas las aplicaciones instaladas. Las nuevas concesiones de permisos requieren aprobación. `--non-interactive` rechaza actualizaciones que solicitan acceso adicional.

El binario cpak busca una nueva release oficial una vez al día. Las instalaciones de escritorio pueden mostrar un cuadro de diálogo de actualización e instalarlo después de la commit. Las builds administradas por distribución informan la actualización pero dejan la instalación al administrador de paquetes del sistema.

## ¿Puede cpak extraer una imagen privada?

Sí. `cpak auth login` almacena una credencial explícita para el origen de un paquete y el repositorio OCI exacto declarado por su manifest. Las credenciales de escritorio utilizan el Servicio Secreto. Los sistemas sin cabeza pueden inyectar un archivo de credenciales en modo propiedad del usuario `0600`. cpak Las vinculaciones de credenciales siguen siendo independientes de los motores de containers.

## ¿Puedo retroceder?

Sí. cpak conserva la release anterior del paquete instalado para `cpak rollback`. Es posible que las migraciones de datos administradas por aplicaciones aún necesiten una recuperación específica de la aplicación.

## ¿Es cpak estable?

cpak v2 se lanza como una opción experimental. Se prueban los flujos principales de transacciones, sandbox, almacenamiento, paquetes, SDK y escritorio, mientras que la cobertura más amplia de hardware y distribución continúa creciendo.