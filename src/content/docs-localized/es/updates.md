---
title: Actualizaciones, pines y reversión
description: Elija una referencia de origen, revise los cambios de permisos y recupere la release anterior.
tags: [updates, rollback, versions]
section: operations
order: 20
---
# Actualizaciones, pines y reversión

cpak registra el origen del paquete, selecciona la referencia Git y resuelve OCI el resumen por separado. Un paquete puede seguir un branch mantenida o permanecer fijo en una revisión exacta.

Esta página cubre paquetes de aplicaciones. Utilice [cpak actualizaciones de runtime](/docs/runtime-updates) para actualizar el binario cpak.

## Selección de fuente

Instalar un branch móvil:

```bash
cpak install --branch main github.com/example/app
```

Instale un release con nombre:

```bash
cpak install --release v2.0.1 github.com/example/app
```

Anclar un commit inmutable:

```bash
cpak install --commit 0123456789abcdef github.com/example/app
```

Confirme el informe de instalaciones `pinned` durante la actualización y no lo mueva. El comportamiento de bifurcación y liberación depende del host del repositorio y de la referencia seleccionada.

## Actualizar uno o todos los paquetes

```bash
cpak update github.com/example/app
cpak update
cpak update --json
```

Cada resultado registra el origen, la release anterior, la release nueva, el tipo de fuente, el estado, los cambios de permisos, las adiciones de permisos y el motivo del error, cuando esté presente.

## Revisión de permisos

Una actualización interactiva muestra paquetes que solicitan nuevos permisos y los pregunta una vez antes de continuar. El modo no interactivo rechaza dichas actualizaciones:

```bash
cpak update --non-interactive
```

Utilice este modo para trabajos desatendidos. Una denegación de permiso es un resultado de actualización fallido y el paquete anterior permanece activo.

## interruptor atómico

cpak organiza el nuevo manifest, OCI layers, fuentes de runtime, dependencias, exportaciones de escritorio y registro de base de datos. Cambia la release activa solo después de que la preparación se realiza correctamente. El código de recuperación maneja transacciones que se interrumpieron antes de la commit.

Si el resumen de la imagen no cambia pero el manifest cambió, cpak actualiza los metadatos del paquete y los permisos efectivos. La ejecución de una actualización para un release actual también repara sus comandos exportados, entradas de escritorio, íconos y alias de aplicaciones predeterminadas.

## retroceder

```bash
cpak rollback github.com/example/app
```

La reversión restaura la release instalada anteriormente y su vista de runtime derivada del manifest. El estado de la aplicación grabable permanece separado de los layers del paquete inmutables. Es posible que las aplicaciones que migran sus propios datos aún requieran una recuperación específica de la aplicación.

## bloquear archivos

`cpak lock` resuelve un paquete local y dependencias de contenido inmutable. Está destinado al desarrollo de paquetes y CI, donde seguir una tag movida durante una prueba haría que el resultado fuera ambiguo.

```bash
cpak lock cpak.json
cpak test cpak.json --lock cpak.lock.json
```

Regenere el archivo de bloqueo solo cuando las entradas del paquete seleccionado se actualicen intencionalmente.