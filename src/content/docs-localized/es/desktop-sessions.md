---
title: Sesiones de escritorio y quiosco
description: Empaquete un escritorio Wayland completo o una sesión de inicio de sesión enfocada con cpak.
tags: [desktop, kiosk, sessions]
section: packages
order: 45
---
# Sesiones de escritorio y quiosco

Un paquete puede declarar una sesión de inicio de sesión junto a los puntos de entrada de su aplicación. Los inicios de sesión y en ventana utilizan la misma release instalada, estado de escritura, perfil de usuario y canal de actualización.

## manifest

Declare un punto de entrada exportado y un conjunto de permisos independiente:

```json
"sessions": [
  {
    "id": "com.example.desktop",
    "name": "Example Desktop",
    "description": "Example desktop session",
    "kind": "desktop",
    "entrypoint": "/usr/bin/example-session",
    "override": {
      "deviceDri": true,
      "deviceInput": true,
      "hostApplications": true,
      "filesystem": [
        { "path": "xdg-documents", "access": "read-write" },
        { "path": "xdg-download", "access": "read-write" }
      ]
    }
  }
]
```

`kind` acepta `desktop` y `kiosk`. El identificador es global y no puede reemplazar una sesión del sistema o una sesión propiedad de otro paquete. El punto de entrada también debe aparecer en `binaries`.

## Autoridad del sistema

Instale la autoridad del sistema una vez:

```bash
cpak system setup
cpak system status
```

La configuración instala un iniciador fijo propiedad de root, una política de activación D-Bus y acciones Polkit. Las sesiones del paquete se registran por separado.

En un host cuyo `/usr/local` es de solo lectura, que es la forma normal de una distribución basada en imágenes, cpak se instala bajo el primer prefijo que acepta una escritura privilegiada: `/usr/local`, luego `/opt/cpak`, luego `/var/lib/cpak`. El resto de la integración sigue el prefijo elegido. La política de bus declara el directorio de servicios reubicado, por lo que la activación aún se resuelve y la acción Polkit se escribe en `/etc/polkit-1/actions`, uno de los directorios que explora polkitd. `cpak system status` informa la instalación dondequiera que aterrice.

## Transportes

La autoridad responde en el bus del sistema y en un socket Unix en `/run/cpak/authority.sock`. El autobús se utiliza siempre que existe, porque es el que lleva una autorización Polkit interactiva. El socket existe para hosts que no ejecutan ningún bus del sistema. Identifica a la persona que llama a partir de las credenciales que el kernel adjunta a la conexión en lugar de un nombre de bus, y acepta cambios de sesión solo desde la raíz, ya que una solicitud sin privilegios no tiene forma de ser autorizada sin Polkit.

Nunca ejecuta el comando completo como administrador y cpak lo rechaza si lo intenta: el almacén de paquetes pertenece a su usuario y root buscaría el paquete dentro del suyo. Ejecútalo como tú mismo:

```bash
cpak session enable github.com/example/desktop com.example.desktop
```

Cuando ningún transporte puede transportar la solicitud, que es la situación normal en un servidor sin bus, cpak escala el paso que necesita privilegios y deja el resto ejecutándose como usted. Utiliza lo que realmente proporciona el host: `pkexec` o `run0` en una sesión gráfica, `sudo` o `doas` en una terminal. Si el host no tiene ninguno de ellos, cpak lo dice en lugar de adivinar, y el paso se puede ejecutar directamente como root.

## Registrar una sesión

```bash
cpak session list github.com/example/desktop
cpak session enable github.com/example/desktop com.example.desktop
```

cpak muestra los permisos de la sesión antes del registro. Polkit luego solicita autorización. El servicio privilegiado acepta metadatos validados y un origen de paquete. La entrada del administrador de pantalla generada llama al iniciador fijo cpak con el identificador de sesión registrado.

Eliminar una sesión con:

```bash
cpak session disable com.example.desktop
```

Al eliminar la última release del paquete instalado que proporciona ese identificador, también se cancela su registro. `cpak system remove` elimina las sesiones cpak registradas antes de eliminar la autoridad del sistema.

## Soporte del administrador de pantalla

cpak almacena las entradas de inicio de sesión con el prefijo en el que se instaló, que es `/usr/local/share/wayland-sessions` en un host normal y se mueve con el prefijo en uno de solo lectura. `cpak system setup` luego señala los administradores de pantalla instalados en ese directorio.

| Administrador de pantalla | Estado |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SDDM | Configurado automáticamente. La path de búsqueda generada mantiene los directorios de sesiones estándar, por lo que las sesiones que envía la distribución permanecen enumeradas junto a las cpak. |
| LightDM | Configurado automáticamente. Los directorios de sesión existentes del sistema, X11 y Wayland permanecen disponibles. |
| GDM | Una instalación estándar no necesita nada: GDM lee los directorios de datos del sistema XDG. Un directorio reubicado se publica a través del entorno de servicio, ya que GDM no tiene ninguna configuración de directorio de sesión. |
| greetd | greetd no tiene un concepto de sesión propio, por lo que quien da la bienvenida enumera las sesiones. cpak publica el directorio a través del entorno de servicio como lo hace para GDM. |

La path basada en el entorno se aplica automáticamente en systemd, a través de un menú desplegable que ordena en último lugar y conserva el valor de otro menú desplegable ya establecido, y en OpenRC, a través de un bloque marcado en el archivo de configuración del servicio. En runit, s6, dinit y sysvinit, los scripts de servicio empaquetados no leen ningún archivo de entorno propio, por lo que escribir uno produciría un archivo que no se carga. Allí `cpak system setup` informa el directorio que se debe agregar y a qué servicio, y deja al host en paz.

Un saludo que establece `XDG_DATA_DIRS` anula lo que proporciona el entorno de servicio, por lo que el directorio también debe aparecer en el saludo. Los saludadores con una opción de sesión explícita la aceptan directamente:

```bash
tuigreet --sessions /usr/local/share/wayland-sessions:/usr/share/wayland-sessions
```
