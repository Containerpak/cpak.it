---
title: Acciones del host
description: Configure servicios de host tipificados y controlados por políticas para una aplicación.
tags: [broker, permissions, containers]
section: runtime
order: 35
---
# Acciones del host

`hostActions` otorga capacidades de paquete de un provider implementado por cpak. Cada provider acepta una solicitud estructurada finita y la asigna a una operación de host fija. Los ejecutables arbitrarios del host se encuentran fuera de esta interfaz.

## provider de containers

El primer provider ofrece acceso controlado a motores de containers host compatibles:

```json
"hostActions": [
  {
    "provider": "containers",
    "capabilities": ["read", "manage-owned", "exec-owned"]
  }
]
```

| Capacidad | Acceso |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| `read` | Enumere e inspeccione containers de host, imágenes, registros y estadísticas. |
| `manage-owned` | Cree containers que lleven la tag de propiedad del paquete y luego inicie, detenga, reinicie o elimine solo esos containers. |
| `exec-owned` | Ejecute un comando solo dentro de un container propiedad del paquete solicitante. |

`manage-owned` se limita a los containers que llevan la tag de propiedad del paquete solicitante. `exec-owned` ejecuta comandos dentro de esos containers de propiedad.

## Calzas de compatibilidad

Cuando el provider está habilitado, cpak coloca cuñas independientes `podman` y `docker` en el paquete. Llamar a `podman` selecciona el motor host Podman y llamar a `docker` selecciona el motor host Docker. Visual Studio Code puede usar cualquiera de los motores a través de la misma política de provider limitada.

Ambas correcciones exponen el mismo subconjunto de CLI finito y convierten cada invocación en una solicitud de provider. La salida estándar, el error estándar, el estado de salida y la cancelación pasan a través de la cuña. Si el motor seleccionado no está instalado en el host, ese comando falla con un error directo de backend no disponible mientras que el otro shim sigue siendo utilizable.

Los comandos e indicadores no admitidos fallan localmente. El modo privilegiado, las concesiones de dispositivos, los espacios de nombres de host y las opciones de backend arbitrarias no se reenvían.

## Política del filesystem

Un container anidado puede montar paths de origen presentes en el permiso cpak `filesystem`. El corredor resuelve enlaces simbólicos antes de compararlos y conserva el acceso de solo lectura.

## Paquetes anidados

Un cpak anidado recibe la intersección de las capacidades de acción del host principal y secundario, incluidas las overrides de usuarios locales.

## manifests heredados

El antiguo campo `allowedHostCommands` sigue siendo legible para la migración. cpak convierte `notify-send`, `xdg-open` y `cpak-launch-app` a sus permisos escritos. Las entradas fuera de esta asignación no superan la validación del manifest.