---
title: drivers de almacenamiento
description: Implemente e implemente un driver de almacenamiento cpak a través del protocolo de socket Unix versionado.
tags: [storage, drivers, protocol]
section: runtime
order: 25
---
# Drivers de almacenamiento

Un driver de almacenamiento cpak deriva directorios nativos persistentes a partir de layers de origen inmutables. cpak valida esos directorios, los registra en un índice de runtime atómico y se los entrega directamente a OverlayFS rootless cuando se inicia una aplicación.

El ciclo de vida del driver se limita a la preparación, verificación, eliminación y recolección de basura. Sale después de cada operación de mantenimiento. Un inicio preparado lee el índice de runtime directamente.

## Drivers incorporados

El driver `fvs` predeterminado lee estados FVS autorizados y publica checkouts nativos verificados. Los archivos completos reutilizan objetos compartidos a través de enlaces de referencia o enlaces físicos cuando sea posible. Los bloques definidos por contenido de FVS siguen siendo la fuente de referencia y pueden reconstruir un checkout derivado.

El driver `dabadee` implementa el mismo contrato con deduplicación de archivos completos. Admite pruebas de compatibilidad e implementaciones que eligen DaBaDee explícitamente. La selección del driver pertenece a la configuración local cpak y deja los manifests de la aplicación portátiles.

Configure el driver en la configuración de cpak o para un comando:

```bash
CPAK_STORAGE_DRIVER=dabadee cpak storage migrate
```

## Protocolo v1

El protocolo v1 utiliza una solicitud y respuesta JSON terminadas en nueva línea por conexión de socket Unix privada. Los fotogramas están limitados a 1 MiB. El servidor verifica la ID del usuario par y rechaza campos desconocidos, versiones de protocolo no compatibles, identificadores de layer no válidos y layers duplicados.

Los métodos son:

| Método | Objetivo |
| ---------- | ------------------------------------------------------------ |
| `probe` | Informar la identidad, el protocolo y las capacidades del driver. |
| `prepare` | Publique checkouts nativos persistentes para layers ordenados. |
| `verify` | Verifique los datos derivados y, opcionalmente, repárelos desde la fuente. |
| `remove` | Eliminar los checkouts derivados seleccionados. |
| `gc` | Informar o eliminar datos derivados a los que no hacen referencia los layers activos. |
| `shutdown` | Detenga el proceso del driver bajo demanda. |

Las solicitudes identifican layers y opciones de operación. Las raíces del driver provienen de una configuración de proceso fija. cpak valida cada path devuelto con la raíz asignada, incluida la resolución del enlace simbólico.

## Implementar un driver

El protocolo es independiente del lenguaje de implementación. Un driver debe:

- cree su socket con el modo `0600` debajo de un directorio de modo privado `0700`;
- acepte solo el mismo ID de usuario en Linux;
- publicar cada checkout atómicamente;
- mantener disponible un checkout válido cuando falle otra preparación;
- tratar los directorios derivados como datos reconstruibles;
- mantener los layers de origen sin cambios durante la verificación, reparación, eliminación y recolección de basura;
- devolver OverlayFS directorios inferiores en el orden de mayor prioridad.

Las implementaciones de Go pueden usar [`github.com/containerpak/storage`](https://github.com/Containerpak/storage). El módulo proporciona el protocolo cliente y servidor, índice de runtime atómico, validación y un conjunto de conformidad compartido.

## Confinamiento del driver externo

Establezca `CPAK_STORAGE_DRIVER_BINARY` para probar una implementación externa. cpak lo inicia sin acceso a la red y restringe el acceso al filesystem a la fuente, el driver y las raíces del socket asignados. Si el host no puede aplicar el confinamiento requerido, cpak se niega a iniciar el driver.

Un binario complementario oficial instalado junto a `cpak` es parte de la misma release confiable. Un binario encontrado a través de `PATH` es externo y sigue el path restringido.

## Operaciones

Inspeccione y mantenga el driver seleccionado con:

```bash
cpak storage status
cpak storage status --json
cpak storage migrate
cpak storage verify
cpak storage verify --repair
```

La preparación mantiene las checkouts de layers completadas después de un lote interrumpido. El siguiente intento los verifica y reutiliza antes de publicar un nuevo índice de runtime. Los datos de la aplicación permanecen separados de estos directorios derivados.