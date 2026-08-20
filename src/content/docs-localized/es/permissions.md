---
title: Permisos
description: Declare el acceso mínimo al host que necesita una aplicación y comprenda los overrides del usuario.
tags: [manifest, security, permissions]
section: packages
order: 30
---

# Permisos

El objeto `override` de `cpak.json` define los permisos predeterminados del paquete. Tiene la misma estructura que los overrides locales del usuario. Cada campo corresponde a una acción concreta del runtime.

Un permiso que el manifest no declara no se concede. No existen campos activos por defecto: display, bus de sesión, audio, GPU y red deben solicitarse por nombre. `cpak init` escribe cada campo de forma explícita para mostrar tanto lo que necesita el paquete como lo que no recibirá.

## Sockets del escritorio

| Campo | Acceso |
| --- | --- |
| `socketWayland` | Socket del display Wayland activo. |
| `socketX11` | Directorio de sockets X11 del host. |
| `socketPulseAudio` | Socket de audio compatible con PulseAudio. |
| `socketSessionBus` | Socket D-Bus de la sesión de escritorio. |
| `socketSystemBus` | Socket D-Bus del sistema. Úselo solo si se necesita acceso directo al bus. |
| `socketCups` | Socket de impresión CUPS. |
| `socketAtSpiBus` | Socket del bus de accesibilidad. |
| `socketSshAgent` | Socket del agente SSH del usuario. |
| `socketGpgAgent` | Socket del agente GPG del usuario. |
| `socketBluetooth` | Socket Bluetooth. |

Use el system broker para notificaciones y URI externos. Cada permiso expone una sola operación al paquete.

## Dispositivos

`deviceDri` concede acceso a los dispositivos gráficos bajo `/dev/dri`. Otros booleanos cubren KVM, memoria compartida, ALSA, captura de vídeo, FUSE, TUN/TAP y USB. `deviceAll` expone todos los dispositivos del host y debe reservarse para paquetes que no funcionan con permisos más limitados.

`deviceSerial` cubre `/dev/ttyUSB*` y `/dev/ttyACM*`, usados por placas, impresoras, radios y medidores. Úselo en lugar de `deviceAll` cuando baste un puerto serie. Los globs de dispositivos se resuelven al crear el container, por lo que un puerto conectado más tarde no será visible para un proceso que ya está en ejecución.

Cuando el passthrough de GPU está activo, las librerías NVIDIA de userspace se resuelven desde el host al iniciar. La imagen del paquete usa el stack de drivers resultante.

## Sistema de archivos

El manifest v2 usa entradas estructuradas:

```json
"filesystem": [
  { "path": "home", "access": "read-write" },
  { "path": "/mnt/projects", "access": "read-only" }
]
```

El scope portátil `home` apunta al directorio personal del usuario. `host` apunta a la raíz del host. Una ruta absoluta selecciona una ubicación específica. El acceso debe ser `read-only` o `read-write`.

En paquetes nuevos evite los campos heredados `fsHost`, `fsHostHome`, `fsHostEtc` y `fsExtra`. Solo existen para la migración desde v1 y el esquema estricto de v2 los rechaza.

## Archivos seleccionados por el usuario

`filePicker` permite solicitudes nativas para abrir archivos, seleccionar carpetas y guardar sin montar todo el directorio personal del host. El acceso a un archivo específico es de solo lectura. El paquete puede ofrecer la carpeta contenedora como una elección explícita y puede hacer que el permiso persista entre inicios. Consulte [Acceso mediante el selector de archivos](/docs/file-access) para conocer los campos de policy, las rutas del runtime y los comandos de revocación.

## Red y procesos

`network` controla la red dentro del namespace del paquete. `process` comparte el namespace de procesos del host y debe permanecer en falso salvo que la aplicación necesite inspeccionar procesos del host.

`userNamespaces` permite crear otro namespace de usuario. Los navegadores y las herramientas con una sandbox propia suelen necesitarlo. Si permanece en falso, los user namespaces nested quedan bloqueados dentro del paquete.

## Límites de recursos

| Campo | Unidad | Cero significa |
| --- | --- | --- |
| `memoryMaxMB` | MiB | ningún límite solicitado |
| `cpuQuota` | porcentaje de una CPU | ningún límite solicitado |
| `pidsMax` | número de procesos | ningún límite solicitado |

Los límites usan controladores cgroup v2 delegados. Si el host no puede aplicar un límite solicitado, el inicio falla.

## Operaciones del sistema

Active `notification` para exponer el shim de notificaciones y `openURI` para permitir la apertura de URI externos en el host. `openURI` cubre `xdg-open`, `gio open` y las solicitudes directas al handler GIO predeterminado. Ambas operaciones pasan por el system broker como solicitudes tipadas.

Active `hostApplications` cuando un entorno de escritorio necesite el catálogo de aplicaciones del host. Las solicitudes de inicio usan identificadores opacos y el broker selecciona la entrada de escritorio de confianza.

`hostActions` concede capacidades de un provider integrado. El provider `containers` ofrece `read`, `manage-owned` y `exec-owned`. Durante una actualización, un nuevo provider o una nueva capacidad se considera una ampliación de permisos. Consulte [Acciones del host](/docs/host-actions) para conocer el límite exacto.

## Entorno

El array `env` acepta entradas `NAME=value`. Úselo para valores predeterminados estables del paquete, no para secretos del usuario. Los secretos deben entrar mediante el mecanismo soportado por la aplicación o un mount controlado por el usuario.

## Overrides locales

El usuario puede sustituir una clave de permiso para una aplicación instalada:

```bash
cpak override github.com/example/app --key network --value false
cpak override github.com/example/app --key filesystem --value '[{"path":"home","access":"read-only"}]'
cpak override github.com/example/app --key filePicker --value '{"openFile":true}'
```

Los overrides se guardan por versión de la aplicación. Revíselos después de un cambio importante del paquete. `cpak update` muestra las ampliaciones de permisos antes de registrar la nueva versión.

Un override local sustituye los valores predeterminados del manifest y puede quitar o añadir accesos. En una máquina gestionada, el ceiling del sistema se aplica después y ningún override del usuario puede superar el máximo elegido por el administrador. Consulte [Implementación gestionada](/docs/managed-deployment).

> [!WARNING] Acceso amplio
> `deviceAll`, `socketSystemBus`, `process`, `asRoot` y el acceso `host` al sistema de archivos cruzan partes amplias de la sandbox. Documente por qué el paquete los necesita.
