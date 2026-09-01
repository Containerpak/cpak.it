A veces, una aplicación de escritorio necesita un servicio de host. La respuesta insegura es exponer un comando del host. En su lugar, una acción de host cpak describe la operación, por lo que la política puede decidir antes de llamar a cualquier backend.

## Comience con capacidades, no con comandos

El provider de containers es un ejemplo útil:

```
"hostActions": [
  {
    "provider": "containers",
    "capabilities": ["read", "manage-owned", "exec-owned"]
  }
]
```

`read` enumera e inspecciona. `manage-owned` crea y cambia solo los containers que llevan la tag de propiedad del paquete solicitante. `exec-owned` se ejecuta dentro de esos containers propios. Ninguno significa "reenviar algo a Podman".

El otro provider integrado es `cpak`. Sus capacidades `read`, `manage` y `exec` cubren discovery limitada y operaciones de entornos persistentes mediante el shim `cpak-host`. No exponen la CLI completa de cpak ni una shell del host. La referencia de [Acciones del host](/docs/host-actions) enumera cada operacion aceptada.

## Definir una solicitud finita

Un provider necesita una enumeración de operaciones y un esquema para cada operación. Valide nombres, identificadores, paths y valores de opciones antes de seleccionar un backend. Rechazar campos desconocidos. Resuelva los enlaces simbólicos antes de comparar un montaje solicitado con la política del filesystem del paquete.

La propiedad debe provenir de la identidad del paquete autenticada, nunca de una tag proporcionada por la persona que llama. La cancelación pertenece al contexto de la solicitud, por lo que un paquete detenido no deja una operación de host en ejecución.

## Los shims de compatibilidad son analizadores

cpak puede exponer los comandos `podman` y `docker` sin reenviar sus líneas de comando completas. Cada shim acepta un subconjunto CLI documentado, lo analiza localmente y crea una solicitud tipada para el provider. Los comandos y flags no admitidos fallan antes de llegar al broker.

Un shim útil conserva la entrada, la salida, los errores, el estado de salida y la cancelación. Así un editor puede usar herramientas conocidas sin convertir el shim en un canal genérico para ejecutar comandos en el host.

## Los paquetes anidados cruzan capacidades

Una dependencia anidada recibe las capacidades permitidas tanto por su propio manifest como por su padre. La dependencia no puede expandir el límite principal. Un override local puede reducir el resultado nuevamente.

Pruebe la validación de solicitudes y las comprobaciones de propiedad del backend, y después ejecute una llamada completa al shim con flujos y cancelación. Un caso exitoso no basta para comprobar el límite.

[Acciones del host](/docs/host-actions) documenta los providers y conjuntos de capacidades actuales.
