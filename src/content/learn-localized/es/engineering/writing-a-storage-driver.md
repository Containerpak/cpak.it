Un driver de almacenamiento no monta una aplicación ni posee sus datos. Deriva directorios nativos reconstruibles a partir de layers fuente inmutables. Al iniciar, cpak entrega estos directorios a Rootless OverlayFS.

## El índice de runtime es la ruta de inicio

Las tareas de mantenimiento llaman al driver para preparar y verificar los checkouts de los layers. Un inicio ya preparado lee directamente un índice de runtime actualizado de forma atómica, por lo que no espera una llamada al daemon. El proceso del driver termina después del mantenimiento.

## Protocolo v1

El protocolo intercambia una solicitud y una respuesta JSON terminadas con newline en cada conexión privada a un socket Unix. Cada frame está limitado a 1 MiB. El socket usa el modo `0600` dentro de un directorio `0700`, y el servidor solo acepta conexiones del mismo user ID.

| Método | Responsabilidad |
| --- | --- |
| `probe` | Declara identidad, protocolo y capacidades. |
| `prepare` | Publica los checkouts de los layers ordenados. |
| `verify` | Comprueba los datos derivados y, si se solicita, los repara. |
| `remove` | Elimina los checkouts derivados seleccionados. |
| `gc` | Informa o elimina datos derivados sin un layer activo. |
| `shutdown` | Detiene el proceso iniciado bajo demanda. |

## Preparar sin romper la vista anterior

Cree el checkout en una ubicación temporal, valídelo y publíquelo mediante un cambio de nombre atómico. Una preparación fallida debe dejar disponible el último checkout válido. Los layers completados durante un lote interrumpido pueden reutilizarse después de la siguiente verificación.

Devuelva los directorios inferiores de OverlayFS desde la prioridad más alta hasta la más baja. Después de resolver los enlaces simbólicos, cpak comprueba que cada ruta pertenezca al root asignado al driver. Los layers fuente permanecen sin cambios durante la preparación, reparación, eliminación y garbage collection.

## Los datos derivados deben poder eliminarse

FVS reconstruye checkouts nativos a partir de bloques fuente definidos por contenido y reutiliza archivos completos mediante reflinks o hard links. DaBaDee implementa el mismo contrato cpak con deduplicación de archivos completos. La implementación interna puede variar; el protocolo observable y las reglas de recuperación forman el contrato.

## Distribuir con la suite de conformidad

`github.com/containerpak/storage` proporciona cliente Go, servidor, índice atómico, validación y pruebas de conformidad compartidas. Un binario externo se inicia sin red y queda confinado a los roots de fuente, driver y socket. cpak lo rechaza si el host no puede aplicar ese aislamiento.

```
cpak storage status --json
cpak storage migrate
cpak storage verify --repair
```

[Drivers de almacenamiento](/docs/storage-drivers) contiene la referencia del protocolo y el deployment.
