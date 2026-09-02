---
title: Probar un paquete
description: Valide contratos, ejecute comprobaciones de paquetes aisladas y cubra el comportamiento del escritorio antes de su publicación.
tags: [testing, ci, packaging]
section: packages
order: 70
---
# Probar un paquete

Las pruebas de paquetes cubren el manifest, la imagen, los archivos exportados, el comportamiento del runtime y la integración del escritorio. Los comandos del desarrollador ejecutan esas comprobaciones en una Store aislada.

## Validación estática

```bash
cpak validate cpak.json
```

Esto rechaza campos desconocidos, releases de manifest no válidas, entradas de permisos con formato incorrecto, campos obligatorios faltantes y valores fuera del esquema v3.

Genere el esquema actual directamente desde el runtime al comparar el editor o la validación de CI:

```bash
cpak gen-schema --output manifest-v3.json
```

## Resolución reproducible

```bash
cpak lock cpak.json
```

El archivo de bloqueo registra los manifests raíz y de dependencia, sus hashes SHA-256 y referencias de imágenes OCI inmutables. Confirme un archivo de bloqueo cuando el workflow de su proyecto requiera entradas de CI reproducibles. Regenerarlo cuando un branch o release seleccionada se actualice intencionalmente.

## Prueba de instalación aislada

```bash
cpak test cpak.json
cpak test cpak.json --binary /usr/bin/example -- --version
```

El comando crea un almacén cpak temporal, instala el paquete, verifica cada entrada binaria y de escritorio declarada y, opcionalmente, inicia un binario. Las exportaciones de escritorio permanecen dentro del almacén temporal.

Utilice `--origin` para la resolución de dependencia relativa y `--lock` para seleccionar una path de bloqueo no predeterminada.

## Lanzamiento del desarrollador

```bash
cpak dev cpak.json --binary /usr/bin/example
```

`cpak dev` utiliza la misma configuración de paquete aislado e inicia la aplicación solicitada. Este es el camino más corto para realizar comprobaciones visuales al editar un repositorio de paquetes.

## Comprobaciones de runtime

Cubre el comportamiento que la aplicación realmente necesita:

- crear y reabrir estado de escritura
- abra cada entrada de escritorio declarada y binario exportado
- ejercitar los permisos de visualización, audio, GPU, entrada, impresión o cámara que estén habilitados
- verificar que los recursos denegados sigan no disponibles
- actualice el paquete y confirme que el estado permanece intacto
- retroceder y verificar que la release anterior aún se inicia

Los SDK necesitan una prueba real de build y ejecución. Los paquetes con dependencias necesitan un inicio que utilice la dependencia. Los paquetes con complementos necesitan ejecuciones habilitadas y deshabilitadas.

## Cobertura de CI y arquitectura

Cree imágenes OCI en CI y ejecute pruebas de humo específicas de la aplicación para cada arquitectura publicada. Mantenga los comandos de prueba finales en el repositorio de paquetes para que los mantenedores puedan repetirlos.

Ejecute `cpak test` contra la imagen publicada como parte de la validación del paquete. Esto verifica el manifest y el runtime a través de cpak.

## Aplicaciones visuales

Un paquete de escritorio necesita un inicio visual cpak además de una verificación `--version`. Confirme que Windows se renderice, verifique los íconos y las entradas del escritorio y ejerza los flujos de trabajo principales. Pruebe las paths Wayland y X11 cuando el manifest habilite ambas.
