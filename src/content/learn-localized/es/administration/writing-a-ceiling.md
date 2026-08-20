Un ceiling usa la misma estructura que los permisos del manifest y del override local, por lo que es fácil atribuirle un efecto que no tiene. El playground junto a la lección muestra el resultado de cada cambio.

## Una clave omitida queda bajo el control del usuario

Un ceiling limita únicamente las claves que contiene. Una clave ausente no se deniega ni se concede: queda determinada por el manifest o el override local.

Por eso un ceiling útil puede ser muy corto. Indique solo lo que el host debe limitar y deje el resto sin cambios:

```
{
  "network": false,
  "deviceAll": false,
  "filesystem": [{ "path": "home/Documents", "access": "read-only" }]
}
```

## Escribir true no concede nada

Seleccione _Un ceiling que no cierra nada_. El ceiling contiene `"deviceAll": false`, pero la aplicación conserva la GPU porque solicitó `deviceDri`, una clave que el ceiling no limita.

Ahora añada `"deviceDri": true` al ceiling. El resultado no cambia. El valor true solo indica que el host no limita ese permiso, igual que cuando la clave no está presente. El permiso debe proceder del manifest o de un override local guardado.

## Un recurso con dos nombres sigue siendo un solo recurso

Seleccione _Una puerta, dos nombres_. El ceiling limita `socketSystemBus` y, con él, `socketBluetooth`, porque ambos exponen el mismo socket. Limitar un nombre y dejar libre el otro no protegería el recurso, así que cpak trata ambas claves como un único acceso.

La misma regla se aplica al filesystem. Cuando el ceiling contiene `filesystem`, también limita los campos legacy que alcanzan los mismos directorios con nombres diferentes. El panel del playground enumera todos los recursos controlados por las claves del archivo.

## Restringir no significa únicamente eliminar

El caso inicial del playground, _Limitado a un directorio_, muestra un paquete que solicita todo el directorio personal en lectura y escritura mientras el ceiling permite únicamente lectura. La aplicación se inicia con un permiso más restringido. Una ruta que el ceiling no cubre desaparece por completo.

El número total de permisos no describe bien el resultado. Revise qué accesos se han reducido y cuáles han desaparecido.

## Antes de aplicarlo a una máquina real

Introduzca en el playground el ceiling que quiere usar y el manifest de una aplicación instalada de verdad. Una política demasiado restrictiva puede permitir que el programa se inicie y romper solo una función utilizada más tarde.

`cpak system explain ORIGIN` muestra la misma comparación para un paquete instalado en la máquina.
