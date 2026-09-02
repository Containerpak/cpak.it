Un servicio de aplicación persistente combina un inicio normal de cpak con un estado deseado. El gestor de servicios lo inicia mediante la misma resolución del package, política, almacenamiento y sandbox que usa `cpak run`. Registra si el servicio debe estar en ejecución y aplica reglas de reinicio y salud fuera del container de la aplicación.

## Dar un nombre al comando

Defina un servicio cuando el package tenga un modo de aplicación que el operador no deba reconstruir manualmente:

```json
{
  "binaries": ["/usr/bin/example"],
  "services": {
    "server": {
      "binary": "/usr/bin/example",
      "arguments": ["serve", "--port", "3000"]
    }
  }
}
```

El binario sigue siendo un binario exportado por el package. El servicio solo vincula un nombre con ese binario y su vector de argumentos. No hay un comando shell que interpretar.

Ejecute el comando una vez con `cpak run --service server github.com/example/app`. Hágalo persistente con una definición local:

```bash
cpak service enable app-prod github.com/example/app \
  --service server \
  --restart on-failure
```

El manifest posee el comando de aplicación. La definición local posee las decisiones operativas: política de reinicio, dependencias, comprobaciones de salud y configuración específica del despliegue.

## Añadir configuración sin cambiar la imagen

Las entradas environment y los secretos son explícitos tanto en `cpak run` como en `cpak service enable`:

```bash
cpak service enable app-prod github.com/example/app \
  --service server \
  --env APP_ENV=production \
  --env-file /etc/example/app.env \
  --secret API_TOKEN=/etc/example/api-token
```

Las entradas directas `--env` reemplazan los nombres coincidentes leídos de los archivos environment. cpak comprueba cada archivo antes de iniciar el package. El archivo de origen de un secreto debe pertenecer al usuario actual y negar acceso al grupo y otros usuarios. Sus bytes se montan en modo de solo lectura en `/run/secrets/API_TOKEN` y no se guardan en la definición del servicio.

## Restaurar el estado deseado

Al habilitar un servicio se instala el mejor adaptador disponible. cpak prefiere un servicio systemd de usuario capaz de iniciar antes del login, después cron `@reboot`, systemd tras el login y por último XDG autostart. El gestor de servicios no depende de systemd ni D-Bus.

Cada adaptador inicia el mismo punto de entrada `cpak service restore`. La definición y el comportamiento de reinicio no cambian al cambiar de adaptador. `cpak service setup` muestra qué adaptador está activo y si puede iniciarse antes del login.

## Observar un solo modelo de estado

Use `cpak service status app-prod` para el estado del gestor y el número de reinicios. Use los comandos de runtime cuando el despliegue necesite ver juntos package, container, proceso, salud, hora de inicio y puertos:

```bash
cpak ps
cpak status github.com/example/app --instance app-prod --json
cpak inspect github.com/example/app --instance app-prod
cpak health github.com/example/app --instance app-prod
```

`cpak health` termina con error cuando el proceso no se está ejecutando o su salud es `starting`, `unknown` o `unhealthy`. Así puede usarse como gate de despliegue sin analizar la tabla para personas.

La [referencia de servicios persistentes](/docs/services) enumera todas las opciones de ciclo de vida y salud.
