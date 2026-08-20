Un inicio de cpak es más sencillo de depurar cuando no se trata el container como una sola operación. Es una secuencia de decisiones, y cada decisión deja un punto útil para inspeccionar.

## Resolver el package

El origen Git selecciona un manifest y el manifest selecciona una imagen OCI. Un branch puede cambiar, mientras que una release, un commit y el digest de imagen resuelto identifican una entrada fija. `cpak lock` resuelve el grafo completo de dependencias antes de iniciar nada.

```
cpak validate cpak.json
cpak lock cpak.json
cpak run -v github.com/example/editor editor
```

La validación responde si se acepta el documento. El lock responde qué se instalará. La salida detallada del inicio indica qué registros y layers instalados se usan en ese momento. Son preguntas distintas.

## Calcular la política efectiva

El manifest solicita acceso. Un override local puede restringir o ampliar esa solicitud, y un límite de sistema solo puede restringir el resultado. Los packages anidados reciben la intersección de su propia política y el límite del principal. Ninguna fase posterior puede restaurar acceso retirado aquí.

Mantenga este cálculo separado del contenido de la imagen. Que una librería exista en un layer no concede acceso a un dispositivo, socket o directorio del host. Solo hace visible esa librería dentro del root ensamblado.

## Componer el root

cpak ordena las dependencias de layer necesarias, la aplicación y los addons habilitados. El driver de almacenamiento seleccionado prepara directorios inferiores nativos para esos layers inmutables. Rootless OverlayFS compone la vista read-only del package y un layer de aplicación escribible queda encima.

Una dependencia anidada no se añade a ese root. Conserva su propio entorno y se alcanza a través de la interfaz de package anidado. Por eso Bottles puede requerir UMU sin fusionar todo el runtime de UMU dentro de Bottles.

## Entrar en el límite

Los namespaces establecen las vistas de proceso, montaje, IPC, hostname, cgroup y, de forma opcional, red. Se montan los paths y sockets del host declarados; después Landlock y seccomp restringen lo que el proceso puede hacer una vez terminada la preparación. El proceso del package se ejecuta como el usuario actual y no puede ganar privilegios tras `no_new_privs`.

Un broker tipado gestiona el pequeño conjunto de operaciones del host que no pueden vivir dentro de ese límite. Los logs y el estado de salida regresan a través del supervisor. Cuando un inicio falla, identifique qué fase lo rechazó antes de cambiar el manifest.

[Arquitectura](/docs/architecture) relaciona la misma secuencia con el árbol de código. [Resolución de problemas](/docs/troubleshooting) ofrece comandos para cada tipo de fallo.
