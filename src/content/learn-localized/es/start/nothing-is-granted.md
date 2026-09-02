El manifest inicial describe una aplicación de escritorio. Sus cinco permisos permiten abrir una ventana Wayland, reproducir sonido, enviar notificaciones, pasar enlaces al host y acceder a la red. Están ahí para poder quitarlos y ver qué parte del resultado desaparece.

Abra `cpak.json` en el playground y sustituya el objeto `override` completo por uno vacío. Desaparecerá cada path. Así empieza un package: sin directorios, sockets, dispositivos ni ruta fuera de la máquina.

Añada `"socketWayland": true`. Aparecerán dos paths: el socket del compositor y su lock. El socket permite crear la ventana; sin él, la aplicación no tiene dónde dibujar. Ejecute `cpak validate` en la terminal bajo el archivo para comprobar el manifest.

## Leer un permiso a través del límite que abre

Añada también `"displayX11": true`. No aparece ningún socket X11 del host. cpak inicia un display X11 de compatibilidad privado y dirige el package a ese endpoint en lugar del display del host.

La diferencia es intencionada. El manifest v3 eliminó el acceso X11 raw porque los clientes de un mismo display host pueden observar el portapapeles, el input y los píxeles de los demás. El permiso sustituto sigue ejecutando aplicaciones X11 sin entregarles el display host.

Ambos permisos ocupan una sola línea, pero solo uno enlaza una ruta del host. Lea en conjunto la capacidad solicitada, las rutas y los servicios mediados por el broker.

## Algunos permisos son más amplios de lo que sugieren sus nombres

La mayoría de los permisos exponen un solo recurso. Algunos cambian un namespace completo o conceden un servicio host tipado. La referencia bajo el espacio de trabajo enumera todas las claves de manifest v3 que acepta esta build, mientras que el resultado junto al manifest muestra lo que abre cada cambio.

`sessionBus` nombra destinos, rutas de objeto, interfaces y métodos exactos. `bluetooth` expone BlueZ mediante un bus privado filtrado. Ninguno entrega al package un socket raw del host. `notification`, `openURI`, `filePicker`, `hostApplications` y `hostActions` también cruzan el límite mediante solicitudes tipadas en lugar de mounts amplios.

`deviceAll` enlaza todo `/dev/`; mientras esté activo, los once permisos de dispositivo que aparecen debajo dejan de tener efecto.

Otros cuatro permisos no enlazan ninguna ruta y por eso es fácil pasarlos por alto. `hostNetwork` comparte el namespace de red del host, incluido localhost, y requiere `network`. `process` comparte el namespace de procesos del host. `userNamespaces` permite crear sandboxes anidados, necesarios para los navegadores. `asRoot` ejecuta el proceso como uid 0 dentro del container.

Para cada package que se quiera publicar, conviene preguntarse sin qué capacidades no puede funcionar y conceder la forma más limitada disponible. Esa es la pregunta central de una revisión de manifest.

[Permisos](/docs/permissions) es la referencia de esta lección.
