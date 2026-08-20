---
title: Automatización y servicios
description: Utilice salida JSON, actualizaciones no interactivas, orquestación y ciclo de vida de servicio explícito en scripts.
tags: [automation, services, ci]
section: operations
order: 50
---
# Automatización y servicios

Los comandos cpak devuelven un estado de salida fallido cuando falla la operación solicitada. Los scripts deben inspeccionar primero el estado de salida y usar la salida JSON cuando un comando la proporcione.

## Estado legible por máquina

```bash
cpak doctor --json
cpak list --json
cpak update --json
cpak gc --json
cpak alias list --json
```

Utilice la salida JSON para verificaciones de estado y automatización. Las tablas humanas son resultados de presentaciones.

## Actualizaciones desatendidas

```bash
cpak update --non-interactive --json
```

El comando rechaza cualquier actualización que solicite permisos adicionales. Sale con un error cuando una o más actualizaciones de paquetes fallan o son denegadas, mientras que los resultados exitosos independientes permanecen visibles en la salida.

## Ejecutar varias aplicaciones

`cpak orchestrate` inicia múltiples aplicaciones instaladas y puede expresar dependencias de inicio:

```bash
cpak orchestrate \
  --depends-on frontend=backend \
  --delay 2 \
  --retries 2 \
  backend frontend
```

Agregue `--health` cuando cada aplicación iniciada pueda responder a un comando de salud. Utilice `--ignore-errors` solo cuando sea seguro iniciar aplicaciones posteriores después de un error anterior.

## Ciclo de vida del servicio

`cpak service` inicia el servicio cpak local. Ejecútelo en el administrador de servicios disponible en la sesión del usuario.

Mantenga el servicio en el mismo entorno de usuario que las aplicaciones de escritorio para que la visualización, el audio, las paths XDG y el agente del sistema resuelvan la sesión deseada.

## Registros e instancias

Las instancias con nombre permiten que la automatización separe los inicios repetidos del mismo paquete:

```bash
cpak run --instance worker-a github.com/example/worker worker
cpak logs --instance worker-a --follow github.com/example/worker
cpak stop --instance worker-a github.com/example/worker
```

Capture el estado de salida del comando y registre una ejecución fallida. cpak propaga el resultado del proceso secundario para los comandos que esperan la aplicación.

## Comprobaciones de paquetes de CI

Utilice `cpak validate`, `cpak lock` y `cpak test` en el paquete CI después de que se haya publicado la imagen OCI. Incluye una prueba de la imagen publicada hasta cpak.

Mantenga las builds de imágenes de producción en CI. Los comandos de desarrollo local cubren la validación de paquetes y las pruebas visuales. El workflow de publicación firma y produce cada arquitectura compatible.