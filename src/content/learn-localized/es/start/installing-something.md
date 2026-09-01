La instalación se hace así:

```
cpak install github.com/containerpak/vlc
```

Esa dirección identifica el package. Es un repositorio, no un nombre dentro de un índice central; quien publica la aplicación controla esa dirección. No hay una cola ni un intermediario entre quien la publica y quien la instala.

## Qué muestra cpak

Antes de descargar nada, cpak obtiene el manifest e imprime lo que solicita. Para el comando anterior, el resultado completo es este:

```
The following cpak(s) will be installed:
  - VLC: Play video, audio and network streams.

The following will be exported:
  - (binary) /usr/bin/vlc
  - (desktop entry) /usr/share/applications/vlc.desktop

The following permissions will be granted:
  - Display: isolated X11 compatibility display, Wayland display and compositor-mediated clipboard
  - Audio: PulseAudio
  - Devices: graphics, shared memory
  - Files: xdg-videos, read only
  - Network: internet and local network

Do you want to continue? [y/N]
```

El prompt enumera únicamente los accesos solicitados por el paquete. Una capacidad ausente de la lista no se concede. Los permisos tipados también muestran su alcance, como la ruta exacta, el modo de acceso o la llamada permitida a un servicio de sesión.

La decisión se toma aquí. Después, la aplicación recibe exactamente lo que indicaba la lista y no vuelve a pedir confirmación.

Compare la lista con lo que afirma ser la aplicación. Un reproductor de vídeo que solicita pantalla, audio y la carpeta Vídeos se comporta como un reproductor de vídeo. Si ese mismo programa pide ejecutarse como root o acceder a todo el directorio personal, está revelando algo que su descripción no decía.

## Confirmar no es la única opción

Después de instalar un package, puedes cambiar sus permisos. Quita un permiso que no aceptas, restaura lo que necesita la aplicación o añade un acceso que el manifest no solicitó:

```
cpak override github.com/containerpak/vlc --key network --value false
```

La decisión local sustituye la solicitud del autor para esta instalación. En un equipo gestionado no puede superar el ceiling del sistema establecido por el administrador. Si la aplicación deja de funcionar después de quitar un permiso, puedes restaurarlo.

## Dónde se instala

Todo queda dentro del directorio personal. No hay instalación para todo el sistema, no se necesita root y no se escribe nada en `/usr`. Al eliminar un paquete se borran sus archivos de runtime y la integración con el escritorio, pero su directorio personal privado se conserva para una instalación posterior. Use `cpak remove --purge` para eliminar también los datos persistentes.

Ese es todo el flujo: leer una lista, aceptarla o restringirla, y eliminar el package de forma limpia cuando ya no se necesita. El resto del curso explica cómo leer bien esa lista, porque el nombre de un permiso no basta para entender lo que abre.
