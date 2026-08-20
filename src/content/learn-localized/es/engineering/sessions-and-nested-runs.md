cpak cruza dos límites que parecen similares desde una aplicación pero que tienen propietarios diferentes. Una solicitud anidada inicia otro paquete como el mismo usuario. Una solicitud de sesión cambia una opción de inicio de sesión propiedad del host. Ambos comienzan con el origen del paquete, pero ninguno puede confiar en una identidad escrita por la persona que llama.

## Los paquetes anidados permanecen separados

Una dependencia anidada se instala con su padre, pero mantiene sus propias layers inmutables, estado de escritura y entorno de proceso. El padre recibe un punto final con alcance para esa dependencia declarada en lugar de la base de datos cpak o el socket de control del host.

El host resuelve la dependencia del gráfico instalado, autentica la instancia principal desde la conexión e intersecta la política secundaria con el límite principal. Un padre no puede nombrar un origen no declarado ni reclamar otra identidad de paquete en la solicitud.

Las transmisiones, el estado de salida y la cancelación regresan a través del protocolo anidado. Los archivos compartidos necesitan paths explícitas aceptadas por ambas políticas. Mantenga el estado con el paquete que naturalmente lo posee para que reemplazar un runtime no elimine datos principales no relacionados.

## Una sesión de inicio de sesión cambia el host

```
"sessions": [
  {
    "id": "com.example.desktop",
    "name": "Example Desktop",
    "kind": "desktop",
    "entrypoint": "/usr/bin/example-session",
    "override": { "deviceDri": true, "deviceInput": true }
  }
]
```

Una sesión tiene su propio conjunto de permisos porque posee una pantalla y una entrada durante el inicio de sesión. Su identificador es global y no puede sustituir una entrada del sistema ni una registrada por otro paquete. El punto de entrada también debe ser un binario exportado.

## El privilegio pertenece a una operación limitada

El lado del usuario cpak resuelve el paquete instalado y valida la sesión antes de pedirle a la autoridad del sistema que lo registre. La autoridad recibe metadatos fijos y un origen del paquete, no un comando arbitrario. Polkit lleva autorización interactiva en hosts con un bus de sistema; un socket Unix con credenciales verificadas cubre los hosts sin una.

El iniciador fijo de propiedad raíz recibe posteriormente solo el ID de sesión registrado. Resuelve el paquete instalado actualmente al iniciar sesión, lo que mantiene una sesión en la misma release y path de actualización que la aplicación en ventana.

[Anidado cpak](/docs/nested-cpak) cubre el protocolo secundario. [Sesiones de escritorio y quiosco](/docs/desktop-sessions) cubre la integración del administrador de visualización y autoridad.