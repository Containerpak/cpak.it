---
title: Informes de seguridad
description: Informar de una vulnerabilidad de forma privada e incluir la evidencia necesaria para reproducirla.
tags: [security, reporting]
section: runtime
order: 50
---
# Informes de seguridad

No abra un problema público por una vulnerabilidad sin parches que podría exponer datos del usuario, cruzar el límite de un paquete, ejecutar una operación de host no declarada o dañar el almacén local.

## Informar en privado

Utilice [GitHub informe de vulnerabilidad privado](https://github.com/Containerpak/cpak/security/advisories/new) para el runtime cpak. Seleccione el repositorio de paquetes cuando el problema exista solo en un paquete oficial o receta de imagen.

El repositorio cpak tiene habilitados los informes de vulnerabilidad privados. El borrador del aviso permanece privado mientras los mantenedores reproducen y solucionan el problema.

## Incluir evidencia útil

Proporcione la release o commit cpak afectada, el origen del paquete, el kernel del host, el filesystem y la parte relevante de `cpak doctor --json`. Agregue una reproducción mínima con comandos exactos y acceso observado.

Para un problema de zona de pruebas, indique qué permisos de manifest se habilitaron. Para un problema de la Store, incluya la secuencia de operación y el resultado de la auditoría. Para un tema de corredor, identifique la operación solicitada y la póliza que debió rechazarla.

No incluya credenciales activas ni archivos personales no relacionados. Reemplace los secretos preservando al mismo tiempo la estructura necesaria para reproducir el comportamiento del analizador o del transporte.

## Alcance

Las áreas cpak sensibles a la seguridad incluyen configuración de espacio de nombres, montajes, seccomp, Landlock, overrides de usuarios, acciones de host escritas, solicitudes de intermediarios del sistema, autorización de paquetes anidados, verificación OCI, sumas de verificación de fuentes de runtime, transacciones de actualización y exportaciones de escritorio.

Una aplicación que se comporta de manera maliciosa dentro de los permisos otorgados explícitamente por su manifest no es automáticamente una omisión de límites cpak. Un permiso oculto, mal informado o no aplicado sigue siendo un problema de seguridad válido.

## Seguimiento público

Una vez que esté disponible una solución, el aviso puede documentar las releases afectadas, las releases parcheadas, el impacto y los pasos de actualización. Mantenga los detalles del exploit privados hasta que los usuarios tengan una path razonable para actualizar.