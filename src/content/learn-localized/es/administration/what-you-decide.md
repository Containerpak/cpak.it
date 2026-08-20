Empecemos por lo que no se decide desde la administración. cpak instala cada paquete en el directorio personal de quien lo solicita, sin root y sin una lista de paquetes compartida por todo el sistema. No se puede aprobar la instalación de otra cuenta, ver sus paquetes ni eliminarlos de la máquina.

Esta separación es intencionada, pero un equipo administrado necesita una política común. Por eso cpak ofrece tres decisiones que se aplican al host completo y no a una instalación concreta.

## Uno: hasta dónde puede llegar una aplicación

Un **ceiling** es un archivo de política aplicado a todas las instalaciones del host. Los permisos solicitados por el paquete o añadidos mediante un override local no pueden superar lo que permite el ceiling.

```
cpak system set-ceiling /etc/cpak/ceiling.json
cpak system ceiling            # what is in force now
cpak system set-ceiling none   # remove it
```

La configuración requiere autenticación administrativa. cpak lee y valida el archivo antes de solicitarla, así que una ruta incorrecta produce un error de inmediato. El ceiling se aplica a todas las cuentas de la máquina, incluida la del administrador.

La siguiente lección explica cómo escribirlo. El punto esencial es este: **un ceiling nunca concede permisos**. Solo puede mantener o restringir una solicitud.

## Dos: si un inicio debe coincidir con el registro

Cuando instala una aplicación, cpak registra sus layers, su política y la identidad de quien firmó el paquete. El **enforcement** establece qué ocurre cuando un inicio no coincide con ese registro.

```
cpak system set-enforcement warn
cpak system enforcement        # what is in force now
```

Hay tres niveles:

**off** es el valor predeterminado. Una máquina que nunca se ha configurado sigue comportándose como antes.

**warn** muestra en cada inicio lo que `refuse` habría bloqueado, pero permite que la aplicación se ejecute. Es el nivel adecuado antes de imponer una política restrictiva en un parque de equipos.

**refuse** impide iniciar una aplicación que el ledger no reconoce.

Pasar directamente de off a refuse permite descubrir los paquetes no registrados solo cuando dejan de funcionar. Warn permite detectarlos antes.

## Tres: qué software acepta este host

La política de firma decide si se puede registrar un paquete sin firma y qué publishers se consideran de confianza. Una lección posterior cubre esta configuración, que utiliza un archivo de política propio.

## Lo que estas políticas no pueden hacer

Un ceiling no puede habilitar un permiso si no lo solicita el manifest o un override local guardado. Enforcement no puede convertir un paquete sin firma en uno firmado. Ambos restringen decisiones existentes. La política de firma sirve para limitar la instalación al software aprobado.
