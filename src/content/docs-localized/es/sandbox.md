---
title: Sandbox y modelo de amenazas
description: Qué aísla cpak, qué puede reabrir el manifest y qué protecciones dependen del host.
tags: [security, sandbox, runtime]
section: runtime
order: 20
---
# Sandbox y modelo de amenazas

cpak inicia aplicaciones como el usuario actual. El sandbox expone los recursos declarados por el paquete y aceptados por el usuario.

## Límite del espacio de nombres

El runtime utiliza namespaces Linux para usuarios, montajes, procesos, IPC, hostname, cgroups y red. El proceso ve la raíz del paquete ensamblado. El PID 1 del paquete controla la limpieza de procesos secundarios y la vida de la instancia.

Sin `network`, el namespace de red privado no tiene una ruta fuera del paquete. Con `network`, `slirp4netns` agrega acceso a internet y LAN mientras el loopback del host sigue bloqueado. cpak actualiza solo ese helper cuando cambia el resolver del host, por lo que el contenedor sobrevive a un cambio de Wi-Fi o VPN. El permiso separado `hostNetwork` comparte el namespace de red del host y localhost.

Los espacios de nombres de usuarios anidados están bloqueados de forma predeterminada. Un paquete puede solicitar `userNamespaces` para aplicaciones como navegadores que crean otra zona de pruebas dentro de cpak.

## Límite del filesystem

Solo están presentes la raíz del paquete, los montajes en runtime y las paths declaradas del filesystem del host. Cada path de host tiene un modo de solo lectura o lectura-escritura. Landlock reduce el acceso a la path después de la configuración del montaje cuando lo admite el kernel actual.

Landlock agrega restricciones de rutas después del aislamiento del montaje. El kernel no permite que un proceso confinado por Landlock cambie la topología del filesystem, por lo que cpak no aplica Landlock cuando el paquete concede `userNamespaces` de forma explícita. Ese permiso conserva el aislamiento del namespace de montaje y seccomp, pero elimina la segunda barrera de rutas para que el sandbox anidado pueda crear sus propios montajes. `cpak doctor` informa si el host puede aplicar Landlock a los inicios normales.

## Límite de llamada al sistema

cpak se aplica `no_new_privs` antes de que se inicie la aplicación y usa seccomp para bloquear llamadas al sistema no permitidas. Un paquete no puede obtener privilegios a través de un ejecutable setuid después de este punto.

La política incluye las llamadas requeridas por las aplicaciones de escritorio compatibles y el runtime cpak. Pruebe una nueva clase de aplicación con la política antes de cambiar el filtro global.

## Controles de recursos

Los límites de memoria, CPU y de proceso utilizan drivers delegados cgroup v2. Un inicio con un límite solicitado no disponible falla con un diagnóstico específico.

El runtime utiliza el administrador de servicios disponible en la sesión del usuario. Las características del kernel y los recursos de la sesión determinan la compatibilidad del host.

## Comunicación con el host

Los enchufes y dispositivos directos son campos de manifest opcionales. Las operaciones de sistemas restringidos utilizan intermediarios:

- el intermediario del sistema acepta sólo tipos de acciones integradas
- la validación de pares locales vincula las solicitudes a la instancia del paquete en ejecución
- Los comandos de compatibilidad se analizan antes de que se cree la solicitud del intermediario.
- Las acciones transmitidas conservan los canales de salida, el estado de salida y la cancelación.

Cada corrección de compatibilidad se asigna a una solicitud escrita y su permiso de paquete efectivo.

Las solicitudes del selector de archivos nativo utilizan una path de concesión de archivos independiente. cpak recibe el objeto seleccionado en el host y pasa un descriptor abierto al espacio de nombres de montaje de la aplicación. Un paquete sin el permiso de bus de sesión recibe un adaptador restringido que maneja el selector sin exponer otros servicios de escritorio. Consulte [Acceso al selector de archivos](/docs/file-access).

## overrides de usuario

El manifest define los valores predeterminados del paquete. Los usuarios pueden eliminar el acceso o agregar una concesión local. Las actualizaciones comparan los permisos nuevos y antiguos efectivos y preguntan antes de aceptar adiciones.

`cpak update --non-interactive` rechaza las actualizaciones que requieren nuevos permisos. Este es el modo recomendado para sistemas desatendidos.

## Límites de la frontera

Un paquete con acceso de lectura y escritura al directorio personal puede modificar archivos del usuario. Las reglas amplias del bus de sesión pueden llamar a los servicios permitidos por ellas. Los dispositivos completos, la red host, la compartición de procesos, los montajes de la raíz del host y root dentro del entorno amplían la superficie de confianza.

Revise el manifest antes de ejecutar un paquete que no sea de confianza. La Tienda destaca los permisos de alto riesgo. El manifest y la override local definen la política autorizada.

El límite anterior indica lo que puede alcanzar una aplicación en ejecución. No dice nada acerca de si la aplicación en el disco sigue siendo la que se instaló, lo cual es una pregunta separada con una respuesta separada: consulte [Inicio verificado](/docs/verified-launch).
