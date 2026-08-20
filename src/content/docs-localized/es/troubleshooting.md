---
title: Solución de problemas
description: Diagnostique la compatibilidad del host, el inicio del paquete, los permisos, los servicios anidados, las entradas del escritorio y el estado del almacén.
tags: [debugging, logs, recovery]
section: operations
order: 40
---
# Solución de problemas

Comience con el layer más estrecha que pueda explicar el fallo. Conserve el comando completo, el origen del paquete, la referencia seleccionada, la build cpak y el informe de capacidad del host junto con cualquier informe de error.

## Ejecute la verificación del host

```bash
cpak doctor
cpak doctor --json
```

Un espacio de nombres requerido o una falla OverlayFS bloquea el inicio de la aplicación. Las advertencias Landlock y cgroup describen protección o límites que el host actual no puede aplicar.

## Leer registros de aplicaciones

```bash
cpak logs github.com/example/app
cpak logs --lines 300 github.com/example/app
cpak logs --follow github.com/example/app
```

Utilice `--instance` cuando el paquete tenga más de una instancia en ejecución. Los fallos de dependencias anidadas pueden tener su propio origen y flujo de registros.

## Abrir un shell de paquete

```bash
cpak shell github.com/example/app
```

Compruebe que existan archivos binarios, archivos de escritorio, bibliotecas y paths montadas declarados. Compare el entorno del paquete con el conjunto de permisos `cpak.json` antes de agregar más acceso.

## Reproducir un paquete local

Dentro de un repositorio de paquetes:

```bash
cpak validate cpak.json
cpak lock cpak.json
cpak test cpak.json --binary /usr/bin/example -- --version
cpak dev cpak.json --binary /usr/bin/example
```

Estos comandos utilizan un almacén temporal y aíslan la depuración de paquetes de las aplicaciones instaladas.

## comprobar permisos

Los síntomas como una ventana faltante, audio silencioso, archivos inaccesibles, entorno de pruebas fallido del navegador o un enlace externo bloqueado generalmente se relacionan con un permiso concreto. Revise los sockets de pantalla, audio, DRI, paths del filesystem, `userNamespaces` y campos de intermediario.

No habilite el bus de sesión, el bus del sistema, todos los dispositivos ni la raíz del host como solución genérica. Confirme el recurso al que la aplicación intentó acceder.

## Estado del taller de reparación

```bash
cpak audit
cpak audit --repair
cpak gc --json
```

Auditar registros de paquetes activos de reparaciones. La recolección de basura elimina el contenido sin referencia después de que el gráfico de registros sea consistente.

## La entrada del escritorio no aparece

Confirme que la path del manifest sea absoluta, termine en `.desktop` y exista en la imagen final. Su objetivo `Exec` debe ser un binario declarado o disponible. Reinstale o actualice el paquete después de cambiar solo los metadatos del manifest para que cpak actualice la entrada exportada.

## Una aplicación se niega a iniciarse después de que el inicio verificado esté activado

Ejecutar `cpak system explain <origin>`: coloca lo que contiene el libro mayor junto a lo que se deriva del inicio, que es la diferencia entre una aplicación que nadie inscribió y una cuya Store ya no contiene lo que registró.

Una solicitud que nunca se registró se rechaza solo en `refuse`. Actualícelo o ejecute `cpak audit --backfill-bindings` para una instalación realizada antes de que existiera el inicio verificado.

Una Store que se contradice es rechazada en todos los niveles, incluido el `off`, y eso es deliberado: no es una incógnita, es un desacuerdo dentro de la Store. `cpak update <origin>` vuelve a registrar la solicitud de lo que sirve el registro.

Cambiar los permisos con `cpak override`, o habilitar un complemento, cambia lo que se deriva del inicio, por lo que cpak registra la aplicación nuevamente como parte del mismo comando. Se registra un conjunto de permisos más limitado sin preguntar. Uno más amplio solicita una contraseña de administrador, una vez, y al rechazarla, la aplicación queda actualizada pero sin estar registrada.

## Una sesión de inicio de sesión no aparece en el administrador de pantalla

Ejecute `cpak system status` primero: en un host con `/usr/local` de solo lectura, la integración se instala bajo otro prefijo y el directorio de sesión se mueve con él. `cpak system setup` imprime lo que no pudo configurar, así que lea su resultado. SDDM y LightDM se configuran a través de sus propios archivos y funcionan bajo cualquier inicio. GDM y greetd leen el directorio desde su entorno de servicio, que cpak se configura automáticamente en systemd y OpenRC únicamente; en runit, s6, dinit y sysvinit la configuración informa el directorio que se debe agregar y a qué servicio. Un saludo que establece `XDG_DATA_DIRS` también tiene que enumerar el directorio, porque su propio valor gana.

## Una aplicación cpak no se utiliza como predeterminada

Verifique ambos solucionadores de escritorio:

```bash
xdg-mime query default x-scheme-handler/https
gio mime x-scheme-handler/https
```

El resultado puede ser la ID de escritorio original oculta o la ID visible con el prefijo cpak. Ejecute `cpak update` para el paquete cuando la ID original configurada ya no exista. La actualización actualiza ambas entradas sin cambiar los datos de la aplicación.

## Se abre un enlace dentro del paquete incorrecto

El paquete necesita `openURI`. cpak proporciona `xdg-open`, `gio open` y un driver GIO privado para enlaces externos comunes. Consulte el registro de la aplicación para detectar un intento de inicio anidado. Ese mensaje significa que un runtime antiguo resolvió una entrada del escritorio del host dentro del paquete en lugar de utilizar el intermediario URI. Actualice cpak, detenga la instancia del paquete e iníciela nuevamente para que se reconstruya su política de runtime.

## Se rechaza una actualización

Inspeccione el resultado de la actualización estructurada:

```bash
cpak update --json github.com/example/app
```

`permission-denied` significa que el nuevo paquete solicitó acceso adicional en un flujo no interactivo o el usuario lo rechazó. `pinned` significa que la commit instalada es intencionalmente inmutable.

## Informar un problema reproducible

Incluir:

- la salida de `cpak doctor --json`
- el comando exacto y el estado de salida
- el origen del paquete y la branch, release o commit seleccionada
- el extracto `cpak logs` relevante
- La secuencia más pequeña que reproduce el fallo.

Oculte credenciales, nombres de directorios de inicio y valores de entorno no relacionados. Utilice vallas codificadas para troncos largos.