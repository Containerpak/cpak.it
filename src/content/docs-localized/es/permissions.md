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

| Campo              | Acceso                                     |
| ------------------ | ------------------------------------------ |
| `socketWayland`    | Socket del display Wayland activo.         |
| `socketPulseAudio` | Socket de audio compatible con PulseAudio. |
| `socketCups`       | Socket de impresión CUPS.                  |
| `socketSshAgent`   | Socket del agente SSH del usuario.         |
| `socketGpgAgent`   | Socket del agente GPG del usuario.         |

Use el system broker para notificaciones y URI externos. Cada permiso expone una sola operación al paquete.

## Dispositivos

| Campo          | Acceso                                          |
| -------------- | ----------------------------------------------- |
| `deviceDri`    | Dispositivos gráficos bajo `/dev/dri`.          |
| `deviceKvm`    | Virtualización de hardware mediante `/dev/kvm`. |
| `deviceShm`    | Memoria compartida mediante `/dev/shm`.         |
| `deviceAlsa`   | Dispositivos de audio ALSA.                     |
| `deviceVideo`  | Dispositivos de captura de vídeo.               |
| `deviceFuse`   | FUSE mediante `/dev/fuse`.                      |
| `deviceTun`    | TUN/TAP mediante `/dev/net/tun`.                |
| `deviceUsb`    | Dispositivos USB.                               |
| `deviceSerial` | Puertos serie USB y CDC.                        |
| `deviceInput`  | Dispositivos de entrada.                        |
| `deviceTTY`    | Terminal de control.                            |
| `deviceAll`    | El árbol `/dev` completo del host.              |

`deviceAll` concede un acceso muy amplio y debe reservarse para paquetes que no funcionan con permisos de dispositivo más limitados.

`deviceSerial` cubre `/dev/ttyUSB*` y `/dev/ttyACM*`, usados por placas, impresoras, radios y medidores. Úselo en lugar de `deviceAll` cuando baste un puerto serie. Los globs de dispositivos se resuelven al crear el container, por lo que un puerto conectado más tarde no será visible para un proceso que ya está en ejecución.

Cuando el passthrough de GPU está activo, las librerías NVIDIA de userspace se resuelven desde el host al iniciar. La imagen del paquete usa el stack de drivers resultante.

## Sistema de archivos

El manifest v3 usa entradas estructuradas:

```json
"filesystem": [
  { "path": "home", "access": "read-write" },
  { "path": "/mnt/projects", "access": "read-only" }
]
```

El scope portátil `home` apunta al directorio personal del usuario. `host` apunta a la raíz del host. Una ruta absoluta selecciona una ubicación específica. El acceso debe ser `read-only` o `read-write`.

El esquema estricto de v3 rechaza los campos heredados `fsHost`, `fsHostHome`, `fsHostEtc` y `fsExtra`.

## Displays y Bluetooth

`socketWayland` monta el display Wayland activo. `displayX11` inicia un display X11 aislado para un solo container. En un escritorio Wayland cpak usa Xwayland con un socket privado. En X11 usa Xephyr. El paquete no recibe el display X11 del host ni su archivo de autorización.

`bluetooth` expone la API general de BlueZ mediante un proxy privado y filtrado. El descubrimiento, el emparejamiento, las aplicaciones GATT, los agentes, los perfiles, las señales y el paso de file descriptors usan esta ruta. Las llamadas a otros servicios del bus del sistema se rechazan y no se incluye acceso HCI directo.

## Bus de sesión

`sessionBus` concede llamadas exactas en el bus de sesión del escritorio. Cada entrada `talk` indica el destino, la ruta del objeto, la interfaz y los métodos. La lista opcional `own` indica los nombres conocidos que puede adquirir el paquete.

El manifest v3 no expone sockets sin filtrar para X11, el bus de sesión, el bus del sistema, AT-SPI o Bluetooth. Use `displayX11` para la compatibilidad X11 aislada y `bluetooth` para el servicio BlueZ filtrado. Los permisos tipados del broker cubren notificaciones, URI externos, selección de archivos e inicio de aplicaciones del host. cpak no ofrece un permiso directo para el bus del sistema.

## Archivos seleccionados por el usuario

`filePicker` permite solicitudes nativas para abrir archivos, seleccionar carpetas y guardar sin montar todo el directorio personal del host. El acceso a un archivo específico es de solo lectura. El paquete puede ofrecer la carpeta contenedora como una elección explícita y puede hacer que el permiso persista entre inicios. Consulte [Acceso mediante el selector de archivos](/docs/file-access) para conocer los campos de policy, las rutas del runtime y los comandos de revocación.

## Red y procesos

`network` habilita un namespace de red aislado. El loopback del host no es accesible desde ese namespace. Active `hostNetwork` junto con `network` solo cuando el paquete deba compartir el namespace de red del host, incluidos sus servicios localhost y sus puertos.

`process` comparte el namespace de procesos del host y debe permanecer en falso salvo que la aplicación necesite inspeccionar procesos del host.

`userNamespaces` permite crear otro namespace de usuario. Los navegadores y las herramientas con una sandbox propia suelen necesitarlo. Si permanece en falso, los user namespaces nested quedan bloqueados dentro del paquete.

## Identidad en el runtime

`asRoot` ejecuta la aplicación como UID 0 dentro del namespace de usuario del paquete. No concede root en el host ni capacidades en el namespace de usuario padre.

## Límites de recursos

| Campo         | Unidad                | Cero significa           |
| ------------- | --------------------- | ------------------------ |
| `memoryMaxMB` | MiB                   | ningún límite solicitado |
| `cpuQuota`    | porcentaje de una CPU | ningún límite solicitado |
| `pidsMax`     | número de procesos    | ningún límite solicitado |

Los límites usan controladores cgroup v2 delegados. Si el host no puede aplicar un límite solicitado, el inicio falla.

## Operaciones del sistema

Active `notification` para exponer el shim de notificaciones y `openURI` para permitir la apertura de URI externos en el host. `openURI` cubre `xdg-open`, `gio open` y las solicitudes directas al handler GIO predeterminado. Ambas operaciones pasan por el system broker como solicitudes tipadas.

Active `hostApplications` cuando un entorno de escritorio necesite el catálogo de aplicaciones del host. Las solicitudes de inicio usan identificadores opacos y el broker selecciona la entrada de escritorio de confianza.

`hostActions` concede capacidades de un provider integrado. El provider `containers` ofrece `read`, `manage-owned` y `exec-owned`. Durante una actualización, un nuevo provider o una nueva capacidad se considera una ampliación de permisos. Consulte [Acciones del host](/docs/host-actions) para conocer el límite exacto.

`allowedHostCommands` es una entrada heredada que se conserva por compatibilidad. cpak convierte solamente `notify-send`, `xdg-open` y `cpak-launch-app` en `notification`, `openURI` y `hostApplications`. Los manifests v3 nuevos deben usar directamente estos permisos tipados. Cualquier otro comando se rechaza.

## Entorno

El array `env` del manifest acepta entradas `NAME=value` para valores predeterminados estables del package. El usuario puede añadir valores por ejecución o servicio con los flags repetibles `--env` y `--env-file`. Los valores directos reemplazan los nombres coincidentes procedentes de archivos.

Use `--secret NAME=/absolute/path` para secretos basados en archivos. cpak comprueba el propietario y los permisos del archivo, lo monta en modo de solo lectura en `/run/secrets/NAME` y no almacena su contenido. Consulte [Servicios de aplicación persistentes](/docs/services) para ver las reglas y los ejemplos.

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
> `deviceAll`, `process`, `asRoot`, las reglas amplias para el bus de sesión y el acceso `host` al sistema de archivos cruzan partes amplias de la sandbox. Documente por qué el paquete los necesita.
