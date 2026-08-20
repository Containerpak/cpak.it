---
title: Inicio rápido
description: Instalar, iniciar, actualizar y eliminar la primera aplicación cpak.
tags: [basics, cli]
section: start
order: 20
---
# Inicio rápido

Un paquete cpak se identifica por su repositorio Git. El repositorio contiene el contrato del paquete, mientras que su manifest apunta a la imagen OCI que contiene la aplicación.

## Comprobar el runtime

```bash
cpak doctor
```

Resolver los fallos obligatorios antes de continuar. Las advertencias describen funciones opcionales del host que cpak no puede aplicar en el sistema actual.

## Instalar una aplicación

Instalar un paquete directamente desde su origen:

```bash
cpak install github.com/bottlesdevs/bottles
```

cpak resuelve la referencia del repositorio, valida `cpak.json`, descarga por digest los layers de imagen que faltan, instala las dependencias declaradas y registra el paquete solo cuando los datos preparados están listos.

Los paquetes pueden seguir un branch o un release, o permanecer anclados a un commit:

```bash
cpak install --branch main github.com/bottlesdevs/bottles
cpak install --release v1.0.0 github.com/example/app
cpak install --commit 0123456789abcdef github.com/example/app
```

## Ejecutar la aplicación

El comando acepta el origen del paquete y un binario exportado opcional:

```bash
cpak run github.com/bottlesdevs/bottles bottles
```

Los argumentos posteriores al binario se pasan a la aplicación como un vector de argumentos:

```bash
cpak run github.com/example/editor editor ./notes.txt
```

Crear un alias para un comando local más corto:

```bash
cpak alias set bottles github.com/bottlesdevs/bottles
cpak run bottles bottles
```

## Inspeccionar la instalación

```bash
cpak list
cpak list --json
cpak logs github.com/bottlesdevs/bottles
```

`cpak shell` abre un shell interactivo dentro del paquete instalado. Recibe los mismos layers y montajes configurados, por lo que resulta útil para diagnosticar problemas.

## Actualizar con seguridad

```bash
cpak update github.com/bottlesdevs/bottles
cpak update
```

Si una actualización solicita permisos nuevos, el comando interactivo muestra los cambios antes de aplicarla. La automatización puede rechazarlos con `cpak update --non-interactive`.

Restaurar la versión instalada anteriormente cuando sea necesario revertir una actualización:

```bash
cpak rollback github.com/bottlesdevs/bottles
```

## Eliminar la aplicación

```bash
cpak stop github.com/bottlesdevs/bottles
cpak remove github.com/bottlesdevs/bottles
cpak gc --apply
```

La eliminación conserva los layers a los que hace referencia otro paquete. La recolección de basura informa de los datos sin referencias antes de eliminarlos.

Continuar con [Conceptos de cpak](/docs/concepts) para entender cómo se relacionan los orígenes, las imágenes, el estado y los permisos.
