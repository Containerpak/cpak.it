---
title: Almacenamiento, deduplicación y limpieza
description: Inspeccione datos cpak, repare transacciones interrumpidas, comparta contenido igual y recupere espacio no utilizado.
tags: [storage, gc, audit]
section: operations
order: 30
---
# Almacenamiento, deduplicación y limpieza

cpak mantiene el contenido OCI inmutable aparte del estado de escritura de la aplicación. Los comandos de limpieza operan en referencias en la base de datos del paquete, por lo que el contenido compartido no se elimina mientras otro paquete todavía lo usa.

> [!WARNING] FVS Regresión de inicio de almacenamiento
> cpak v2.1.x puede tardar más de lo esperado en iniciar aplicaciones bajo ciertas condiciones. Lea el [aviso de incidente](/announcements/fvs-storage) antes de degradar porque cpak v2.0.1 no puede leer layers que ya han migrado a FVS.

## auditar la Store

```bash
cpak audit
```

La auditoría compara los registros de paquetes instalados, las referencias de layers, el estado de las transacciones, las fuentes de runtime y los archivos almacenados. Ejecútelo después de una actualización interrumpida, un movimiento manual del almacén o un error del filesystem.

La auditoría lee los layers heredadas y FVS implementadas. La migración, el inicio de aplicaciones y las descargas siguen siendo operaciones independientes.

Aplicar reparaciones admitidas explícitamente:

```bash
cpak audit --repair
```

Lea el informe antes de la reparación cuando la Store contenga datos importantes de la aplicación. La reparación cubre la coherencia de los metadatos cpak. Restaure archivos de aplicaciones eliminados externamente desde una copia de seguridad.

## Recolección de basura

Vista previa de layers sin referencia y entradas de caché:

```bash
cpak gc
cpak gc --json
```

Eliminar los datos reportados:

```bash
cpak gc --apply
```

La recolección de basura conserva los layers a los que hacen referencia los paquetes instalados, su gráfico de dependencia activa y el estado de reversión. Elimina bloques FVS después de que desaparece su referencia de layer final y recopila objetos DaBaDee sin referencia. La migración del almacenamiento tiene su propio ciclo de vida explícito. Un informe limpio no tiene layers candidatas, entradas de caché, objetos de contenido ni bytes recuperables.

## Deduplicación automática de dos niveles

La extracción de imágenes aplica ambos niveles de almacenamiento automáticamente. Los resúmenes de layers OCI existentes se reutilizan. Una nueva layer fluye a través de la verificación de resumen y la descompresión hacia el almacén de bloques global FVS. La importación exitosa conserva la representación FVS utilizada por los paquetes instalados.

FVS utiliza bloques definidos por contenido. Los rangos iguales de diferentes archivos y layers se refieren al mismo bloque, incluidos archivos que difieren en una región pequeña. Los checkouts nativos agregan la reutilización de archivos completos a través de enlaces de referencia o enlaces físicos cuando sea posible.

`cpak dedup` proporciona mantenimiento respaldado por DaBaDee para una path externa explícita:

```bash
cpak dedup --path /path/to/cpak/store
```

El comando codifica archivos normales y reutiliza archivos completos a través de enlaces físicos cuando el filesystem de origen los admite. Los sistemas de archivos compatibles también pueden reutilizar rangos coincidentes a través de enlaces de referencia.

## Preparar una Store de cpak existente

El instalador gráfico y `cpak self-update` preparan los layers de aplicaciones existentes después de reemplazar los archivos binarios en runtime. `cpak-storaged` crea un checkout nativo verificado por layer inmutable y publica un índice de runtime atómico. Los layers completadas se conservan cuando se interrumpe un lote y se reutiliza en el siguiente intento.

Un inicio de escritorio detecta un checkout requerido faltante, muestra un cuadro de diálogo de progreso después de 400 milisegundos, completa los layers afectadas y luego inicia la aplicación. Los inicios de terminales informan la misma operación en la terminal. Los inicios preparados leen el índice directamente.

Inspeccione o inicie la operación explícitamente con:

```bash
cpak storage status
cpak storage migrate
cpak storage verify
cpak storage verify --repair
```

FVS sigue siendo el almacén de referencia de los layers. Los checkouts nativos son datos derivados que se pueden verificar o reconstruir. DaBaDee implementa el mismo contrato versionado de driver de almacenamiento para instalaciones compatibles. Las aplicaciones que utilizan DaBaDee como biblioteca Go pueden seguir la [guía de migración de DaBaDee v2](https://github.com/mirkobrombin/DaBaDee/blob/main/docs/migration-v2.md).

## Eliminar una aplicación

```bash
cpak stop github.com/example/app
cpak remove github.com/example/app
cpak gc --apply
```

La eliminación elimina el registro del paquete y su integración de escritorio exportada. Los layers compartidas permanecen hasta que ningún paquete instalado o release retenida haga referencia a ellas.

El comando de eliminación detiene y limpia los containers que pertenecen al paquete seleccionado y luego libera los metadatos de su layer. Ejecute `cpak gc --apply` para recuperar bloques de contenido compartido después de que desaparezca su referencia final.

## Copia de seguridad del estado de escritura

Haga una copia de seguridad del estado de la aplicación y de la base de datos cpak juntos cuando necesite una instantánea recuperable. Los layers inmutables se pueden descargar nuevamente, pero es posible que el estado de la aplicación local y las overrides del usuario no existan en ningún otro lugar.

Deje de ejecutar instancias antes de tomar una instantánea a nivel del filesystem. Esto evita capturar una base de datos o un archivo de aplicación mientras se modifica.
