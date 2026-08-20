El manifest inicial describe una aplicación de escritorio. Sus cinco permisos permiten abrir una ventana Wayland, reproducir sonido, enviar notificaciones, pasar enlaces al host y acceder a la red. Están ahí para poder quitarlos y ver qué parte del resultado desaparece.

Abra `cpak.json` en el playground y sustituya el objeto `override` completo por uno vacío. Desaparecerá cada path. Así empieza un package: sin directorios, sockets, dispositivos ni ruta fuera de la máquina.

Añada `"socketWayland": true`. Aparecerán dos paths: el socket del compositor y su lock. El socket permite crear la ventana; sin él, la aplicación no tiene dónde dibujar. Ejecute `cpak validate` en la terminal bajo el archivo para comprobar el manifest.

## Leer un permiso a través de los paths que abre

Añada también `"socketX11": true`. Dos paths pasan a ser ocho. Cuatro de los nuevos paths son directorios de sockets propios de X11; el quinto es el archivo de autorización que necesita un cliente para conectar; el sexto solo aparece cuando ambos permisos están activos: la cookie que escribe Xwayland.

Lea la nota bajo el directorio de sockets. X11 no separa sus clientes, por lo que cualquier cliente de esa pantalla puede leer el portapapeles, observar lo que se escribe en otras ventanas y copiar sus píxeles. Wayland no concede nada de eso.

Ambos permisos ocupan una línea en un manifest y se llaman permiso. El nombre dice muy poco. Los paths muestran qué puede hacer la aplicación.

## Ocho permisos son más amplios de lo que sugieren sus nombres

La mayoría de permisos abren un socket o un directorio. Ocho abren más de lo que indica su nombre. La referencia bajo el espacio de trabajo enumera todas las claves que acepta esta build, mientras que el resultado junto al manifest muestra lo que abre cada cambio.

Tres permisos abren un bus, no un servicio: `socketSessionBus`, `socketSystemBus` y `socketBluetooth`. Este último enlaza el mismo socket que el bus del sistema con un nombre más claro. Lo que un package alcanza a través de un bus depende de lo que el host tenga escuchando en él, no del manifest.

`deviceAll` enlaza todo `/dev/`; mientras esté activo, los once permisos de dispositivo que aparecen debajo dejan de tener efecto.

Los últimos cuatro no enlazan ningún path, y por eso es fácil pasarlos por alto. `network` da al container una ruta para salir de la máquina, en lugar de un namespace de red propio. `process` comparte el namespace de procesos del host, por lo que el package ve procesos fuera del sandbox. `userNamespaces` permite que la aplicación cree un sandbox anidado, necesario para un navegador y poco más. `asRoot` ejecuta el proceso como uid 0 dentro del container.

Para cada package que se quiera publicar, conviene preguntarse de cuáles de esos ocho permisos no puede prescindir. Esa es la pregunta central de una revisión de manifest.

[Permisos](/docs/permissions) es la referencia de esta lección.
