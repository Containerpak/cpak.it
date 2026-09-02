---
title: Servicios de aplicación persistentes
description: Ejecute un comando de aplicación declarado en segundo plano, restáurelo al iniciar sesión o arrancar y compruebe su estado.
tags: [services, automation, observability, boot]
section: operations
order: 20
---

# Servicios de aplicación persistentes

Un servicio cpak es un comando de aplicación con nombre que se administra fuera del terminal interactivo. cpak registra el estado deseado, inicia el package dentro de su sandbox, aplica una política de reinicio y restaura los servicios habilitados tras el inicio de sesión o el arranque.

El gestor de servicios no requiere systemd ni D-Bus. cpak instala el mejor adaptador disponible en este orden:

1. una unidad systemd de usuario con lingering, si el host lo admite;
2. una entrada `@reboot` en el crontab del usuario;
3. una unidad systemd de usuario que se inicia después del login;
4. una entrada XDG autostart.

Ejecute `cpak service setup` para instalar o consultar el adaptador seleccionado. El comando avisa cuando el host solo puede restaurar servicios después de un inicio de sesión interactivo.

## Declarar un comando de aplicación

Quien publica un package puede dar un nombre estable a un comando en `cpak.json`:

```json
"binaries": ["/usr/bin/example"],
"services": {
  "server": {
    "binary": "/usr/bin/example",
    "arguments": ["serve", "--port", "3000"]
  }
}
```

El binario del servicio también debe aparecer en `binaries`. Los argumentos se pasan como valores independientes, sin interpretación de shell.

Ejecute directamente el comando declarado cuando no necesite persistencia:

```bash
cpak run --service server github.com/example/app
```

## Habilitar un servicio

`cpak service enable` registra el servicio y lo inicia de inmediato:

```bash
cpak service enable app-prod github.com/example/app \
  --service server \
  --restart on-failure \
  --health "/usr/bin/example health"
```

El primer argumento es el nombre local del servicio. El segundo es el origen del package. Use `--service` para un comando declarado en el manifest o indique el binario exportado y sus argumentos después del origen:

```bash
cpak service enable app-prod github.com/example/app \
  /usr/bin/example serve --port 3000
```

Las políticas de reinicio son `never`, `on-failure` y `always`. El valor predeterminado es `on-failure`. Las comprobaciones de salud aceptan demora, intervalo, reintentos y timeout mediante los flags `--health-*` correspondientes.

Las dependencias hacen referencia a otros nombres de servicio locales y se pueden repetir:

```bash
cpak service enable web github.com/example/web \
  --service server \
  --depends-on database \
  --depends-on cache
```

## Environment y secretos

Pase valores y archivos environment repetibles al habilitar un servicio:

```bash
cpak service enable app-prod github.com/example/app \
  --service server \
  --env APP_ENV=production \
  --env-file /etc/example/app.env \
  --secret API_TOKEN=/etc/example/api-token
```

Los archivos environment contienen líneas `NAME=value`. Se ignoran las líneas vacías y las que empiezan por `#`. Un valor directo `--env` reemplaza el mismo nombre procedente de un archivo. Los archivos deben ser regulares, absolutos, no superar 1 MiB y los nombres `CPAK_` están reservados.

El archivo de origen de un secreto debe ser regular y absoluto, pertenecer al usuario actual, no ser un enlace simbólico y negar permisos al grupo y otros usuarios. cpak lo monta en modo de solo lectura en `/run/secrets/NAME`. El contenido nunca se copia en los registros del servicio ni se imprime con sus comandos.

Los mismos flags `--env`, `--env-file` y `--secret` están disponibles con `cpak run`.

## Controlar el servicio

```bash
cpak service list
cpak service status app-prod
cpak service logs app-prod
cpak service logs --lines 200 app-prod
cpak service restart app-prod
cpak service stop app-prod
cpak service start app-prod
cpak service disable app-prod
cpak service remove app-prod
```

`disable` conserva la definición y borra el estado de ejecución deseado. `remove` elimina la definición. Ninguno de los comandos elimina el package instalado ni sus datos.

## Inspeccionar el estado de ejecución

Los comandos de observabilidad combinan el estado del servicio, container, proceso, salud, hora de inicio y puertos en escucha:

```bash
cpak ps
cpak ps --json
cpak status github.com/example/app --instance app-prod
cpak inspect github.com/example/app --instance app-prod
cpak health github.com/example/app --instance app-prod
```

`cpak status` y `cpak health` aceptan `--json`. `cpak inspect` siempre devuelve JSON. Si la comprobación falla, `cpak health` termina con un estado de error, por lo que puede usarse directamente desde un supervisor o script de despliegue.

`cpak ps` muestra los puertos como `host:PORT`. El comando observa el estado actual y no cambia la red del package. El servicio sigue necesitando el permiso de red declarado por su package.
