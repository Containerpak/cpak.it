---
title: Arquitectura de runtime
description: Cómo encajan Git metadatos, OCI layers, el almacén local, los espacios de nombres y el supervisor de aplicaciones.
tags: [architecture, runtime]
section: runtime
order: 10
---
# Arquitectura de runtime

cpak utiliza dos binarios Go estáticos. El cliente `cpak` resuelve paquetes e inicia entornos de aplicaciones rootless a través de interfaces del kernel Linux. `cpak-storaged` prepara, verifica y recopila comprobaciones de layers persistentes durante las operaciones de mantenimiento y luego sale. Las aplicaciones preparadas se inician directamente desde el índice de runtime y no tienen raíz OverlayFS.

## Resolución del paquete

Una instalación comienza desde un origen Git. cpak resuelve la branch, release o commit seleccionada y descarga `cpak.json`. El manifest se valida antes de que se activen el contenido de la imagen o las fuentes de runtime.

El cliente de distribución nativo OCI resuelve la referencia de la imagen en un resumen inmutable, selecciona la arquitectura Linux actual de un índice de imágenes, valida cada descriptor y compara el contenido descargado con su resumen SHA-256. Los manifests de dependencia se resuelven por el mismo camino. Un archivo de bloqueo puede registrar los hashes de manifest exactos y los resúmenes de imágenes para desarrollo y CI.

El acceso al registro comienza de forma anónima. Los paquetes privados utilizan un enlace de credenciales explícito cuyo ámbito es el origen del paquete, el host del registro y la path del repositorio. cpak mantiene estos enlaces en su propio almacén de credenciales.

## Tienda de contenidos

La deduplicación del almacenamiento tiene dos niveles automáticos. OCI los layers se abordan mediante resumen, por lo que el mismo layer a la que hacen referencia varias aplicaciones se descarga una vez. FVS almacena el contenido del archivo como bloques definidos por contenido compartido, por lo que rangos iguales ocupan una copia física incluso cuando builds separadas los colocan en diferentes layers.

El nivel OCI reutiliza un layer coincidente completa. FVS funciona debajo del diseño de la imagen y comparte bloques definidos por contenido entre imágenes no relacionadas, incluidas bibliotecas, fuentes y recursos. Este nivel funciona en sistemas de archivos locales con o sin enlace físico y soporte reflink.

Los registros de paquetes, los layers inmutables, el estado de la aplicación grabable, los registros, los archivos de escritorio exportados y el estado de las transacciones se mantienen por separado. La recuperación descarta los datos provisionales incompletos y conserva la release activa.

FVS sigue siendo la fuente autorizada para contenido de layers inmutables. Un driver de almacenamiento deriva directorios nativos persistentes de esa fuente. El driver FVS predeterminado reutiliza archivos completos a través de enlaces de referencia o enlaces físicos cuando el filesystem lo permite. El driver DaBaDee implementa el mismo contrato para compatibilidad e implementaciones alternativas.

## Vista de runtime

Cada layer preparada tiene un checkout nativo inmutable y una entrada en un índice de runtime atómico. En el inicio, cpak lee ese índice y pasa la aplicación ordenada, la dependencia y los directorios de complementos habilitados directamente a OverlayFS rootless. Una layer superior grabable recibe los cambios de la aplicación mientras que el contenido FVS permanece inmutable y compartido.

Un inicio preparado lee el índice de runtime y monta los directorios enumerados inmediatamente. Los procesos de almacenamiento y la materialización por aplicación permanecen en la path de mantenimiento. Si se interrumpió una actualización antes de que se publicara un checkout requerido, la entrada del escritorio muestra el progreso de la preparación, reanuda los layers completas e inicia la aplicación una vez que el índice de runtime esté listo.

El entorno recibe cpak variables de runtime. `CPAK_CONTAINER_ID` contiene un identificador opaco para la instancia activa y se puede utilizar para detectar un inicio cpak.

## Aislamiento

cpak crea usuarios, montaje, PID, IPC, UTS, cgroup y espacios de nombres de red opcionales directamente. Un pequeño proceso PID 1 posee el ciclo de vida del container y cosecha procesos secundarios. Un socket Unix privado acepta solicitudes de ejecución limitadas para la instancia en ejecución.

Los montajes se preparan a partir del conjunto de permisos del paquete y las overrides del usuario. El proceso final recibe `no_new_privs`, una política seccomp y reglas Landlock cuando el kernel del host las admite.

## Integración de host

La pantalla, el audio, los dispositivos y los enchufes solicitados explícitamente se montan en el entorno. Las notificaciones, las solicitudes de URI externas, los inicios de aplicaciones de host y los servicios de host escritos utilizan el intermediario del sistema cpak.

Los comandos de compatibilidad cubren notificaciones, apertura de URI, inicios de aplicaciones de host y servicios de host compatibles. Cada corrección analiza una solicitud finita antes de cruzar el límite de la zona de pruebas. El corredor verifica la política del paquete y devuelve resultados, errores, estado de salida y cancelación.

Las solicitudes de selección de archivos utilizan un canal de concesión independiente. El host selecciona y abre el objeto solicitado, luego envía su descriptor a un trabajador de montaje adjunto al espacio de nombres del paquete en ejecución. La aplicación recibe una path por debajo de `/run/cpak/grants` sin recibir el host home o una path de host sin restricciones. Las concesiones persistentes se almacenan por origen del paquete y se restauran solo después de que se verifique nuevamente su origen.

Las commits de propiedad del runtime y las ventanas de progreso pueden usar Adwaita, GTK, KDE, Qt o la interfaz integrada. El binario oficial incorpora los ayudantes nativos y extrae solo el adaptador seleccionado. Esta layer de interfaz de usuario es independiente de la política de paquetes y del transporte de concesión de archivos.

## Ciclo vital

Una aplicación puede tener instancias con nombre. `cpak run` inicia o se conecta al entorno del paquete e inicia el binario seleccionado. `cpak logs` lee la salida de la instancia, mientras que `cpak stop` finaliza el container supervisado.

Un `idle_time` mayor que cero permite que un entorno no utilizado se detenga después del número de minutos declarado. El estado de la aplicación permanece disponible para el próximo inicio.

## Actas

Instala y actualiza manifests de etapa, layers, fuentes de runtime y cambios en la base de datos antes de cambiar el registro del paquete activo. La release anterior permanece disponible para revertirse después de una actualización exitosa. Auditoría y reparación inspeccionar la relación entre registros y archivos después de una operación interrumpida.

La preparación del almacenamiento sigue el mismo modelo. Un driver escribe un checkout parcial privado, lo verifica, lo sincroniza y lo publica con un cambio de nombre atómico. cpak actualiza el índice de runtime solo después de validar cada directorio devuelto. Los layers completadas sobreviven a un lote interrumpido y se reutilizan en el siguiente intento.