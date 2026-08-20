---
title: Integración del sistema
description: Conecte aplicaciones para visualización, audio, notificaciones, URI, aplicaciones de host y servicios de host escritos.
tags: [desktop, broker, actions]
section: runtime
order: 30
---
# Integración del sistema

Los controles de manifest muestran audio, dispositivos, servicios de escritorio y operaciones de intermediario disponibles para una aplicación.

## Visualización y entrada

Los paquetes Wayland reciben el socket Wayland activo cuando `socketWayland` está habilitado. Los paquetes X11 reciben `/tmp/.X11-unix` cuando `socketX11` está habilitado. GPU normalmente también necesita `deviceDri`.

El runtime transporta el entorno de visualización necesario para abordar el zócalo montado. Pruebe ambas paths de visualización cuando un paquete anuncie ambas.

## Audio y accesibilidad

`socketPulseAudio` expone el socket compatible con PulseAudio utilizado por las sesiones de escritorio PulseAudio y PipeWire. Los dispositivos ALSA directos requieren `deviceAlsa`.

Los clientes de accesibilidad utilizan `socketAtSpiBus`. Usos de impresión `socketCups`. Los sockets de agente para SSH y GPG son concesiones separadas porque pueden autorizar acciones como usuario.

## Notificaciones

Establezca el permiso del corredor en `cpak.json`:

```json
"notification": true
```

cpak monta su comando de compatibilidad de notificaciones en el paquete. Una solicitud llega al intermediario del sistema local, que verifica la instancia y la política del paquete antes de enviar la notificación de escritorio.

El intermediario es propietario de la interacción del bus de sesión para esta operación.

## URI externos

Habilite el intermediario de URI cuando los enlaces deban abrirse en una aplicación host:

```json
"openURI": true
```

cpak proporciona comandos `xdg-open` y `gio open` compatibles. Las aplicaciones que llaman a GIO resuelven directamente un driver de URI privado dentro del paquete. El driver llega al intermediario a través de la interfaz GIO existente y el intermediario solicita al escritorio del host que abra el URI con su aplicación predeterminada actual.

Los enlaces HTTP, HTTPS y de correo utilizan esta path automáticamente. El agente rechaza paths de archivos, `file:` URI, esquemas de script y esquemas de salida personalizados. Mantenga la validación del lado de la aplicación para los URI controlados por el usuario.

## Aplicaciones predeterminadas y devoluciones de llamadas de URI

Una entrada de escritorio exportada mantiene sus tipos MIME y esquemas de URI declarados. cpak también exporta una ID de compatibilidad oculta cuando la ID del escritorio original está libre en el host. Esto permite que un navegador empaquetado, un cliente de correo u otro driver se convierta en el escritorio predeterminado mientras el iniciador visible mantiene su ID cpak a prueba de colisiones.

La propiedad de la entrada de compatibilidad se limita a la identidad del paquete que la creó. Las entradas del escritorio del sistema y creadas por el usuario siguen siendo independientes. Al eliminar el paquete, se eliminan las entradas de su propiedad.

Las devoluciones de llamada de URI siguen el camino opuesto. El escritorio del host inicia la entrada exportada con `%u` o `%U` y cpak reenvía el URI al comando de aplicación declarado. Las devoluciones de llamada de bucle invertido, como una respuesta de OAuth en `127.0.0.1`, utilizan el espacio de nombres de red del paquete seleccionado por su manifest.

## Selectores de archivos nativos

`filePicker` permite que una aplicación solicite archivos, carpetas y guarde destinos sin un soporte de inicio permanente. Las llamadas GTK y GIO utilizan un adaptador de bus de escritorio restringido que maneja el protocolo de selección de archivos incluso cuando `socketSessionBus` está deshabilitado. El proxy rechaza destinos de bus no relacionados a menos que el manifest conceda el bus de sesión completo.

El host presenta el selector y cpak adjunta el objeto aceptado al espacio de nombres del paquete. Las commits de alcance y duración utilizan el cuadro de diálogo de escritorio configurado. Consulte [Acceso al selector de archivos](/docs/file-access) para conocer la política de paquetes y [Adaptadores de diálogo de escritorio](/docs/desktop-dialogs) para la configuración de distribución.

## Aplicaciones de host

Los cpaks de escritorio pueden enumerar las aplicaciones instaladas por el host e iniciar una entrada seleccionada a través del intermediario:

```json
"hostApplications": true
```

cpak crea un catálogo privado a partir de entradas de escritorio confiables y proporciona al paquete identificadores de aplicaciones opacos. Las solicitudes de inicio resuelven esos identificadores en el catálogo y pueden apuntar a la visualización anidada de un escritorio cpak.

## Servicios de host escritos

Utilice `hostActions` para los servicios de host admitidos representados por las capacidades del intermediario. Cada provider publica un conjunto de capacidades fijo. Consulte [Acciones del host](/docs/host-actions) para conocer el provider del container y sus correcciones de compatibilidad.

Durante la migración v1, `allowedHostCommands` asigna la notificación anterior, el URI y las correcciones de la aplicación host a permisos escritos. El manifest v2 rechaza los nombres ejecutables en este campo.

## Entradas e íconos del escritorio

Declare cada entrada del escritorio que debería aparecer en el host. La entrada y los íconos referenciados deben existir en la imagen OCI final. cpak exporta un iniciador orientado al host que vuelve a ingresar al paquete a través de su origen instalado.

Una actualización actualiza los metadatos exportados incluso cuando el paquete está actualizado o el resumen de la imagen OCI no cambió. Esto repara los lanzadores que faltan y mantiene los cambios del manifest y del escritorio sincronizados con el registro del paquete instalado.

## Detección de runtime

cpak establece `CPAK_CONTAINER_ID` en un identificador opaco para la instancia de runtime activa. Las aplicaciones pueden probar su presencia para seleccionar cpak el comportamiento de almacenamiento e integración. El valor puede cambiar entre instancias y no debe analizarse ni almacenarse como un identificador de paquete.