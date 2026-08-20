El manifest contiene los permisos elegidos por el autor del paquete. Son los valores predeterminados que se muestran antes de la instalación, pero el propietario de esa instalación puede modificarlos después.

Un override de usuario guardado sustituye los permisos del manifest. Puede quitar un acceso, restaurarlo o añadir un acceso que el manifest no solicitó. Así puedes corregir una aplicación que necesita otra carpeta o dispositivo sin modificar los archivos del autor.

En un equipo gestionado, el administrador tiene la última palabra. El ceiling del sistema se guarda fuera del control del usuario y limita tanto el manifest como cualquier override local.

`permisos efectivos = (override de usuario si existe, de lo contrario manifest) limitado por el ceiling administrativo`

## El ceiling limita pero no concede

El ceiling solo controla las claves escritas en su archivo de política. Si contiene `"network": false`, ninguna aplicación ni override de usuario puede restaurar el acceso a la red en ese host. Una clave omitida del ceiling queda bajo el control del propietario de la instalación.

Escribir `"deviceDri": true` no entrega el dispositivo gráfico a todas las aplicaciones. Permite que una aplicación conserve ese permiso cuando su manifest o su override local lo habilita. Una aplicación que mantiene `deviceDri` deshabilitado sigue sin recibir el dispositivo gráfico.

La misma regla se aplica al filesystem. El ceiling puede reducir una carpeta solicitada a acceso de solo lectura, limitarla a una ruta más pequeña o eliminarla. El usuario aún puede elegir permisos más restrictivos.

## El usuario controla las instalaciones personales

En un equipo no gestionado no hay ceiling del sistema. El override local es el conjunto de permisos efectivo, por lo que el usuario puede añadir o quitar cualquier permiso:

```console
cpak override github.com/example/application --key deviceDri --value true
```

El override pertenece a una versión instalada de un único paquete y se guarda en `~/.config/cpak/overrides`. No modifica el manifest del autor ni la instalación de otro usuario.

Los paquetes nested tienen un límite adicional. Un hijo recibe solo la intersección entre sus permisos efectivos y los de su padre, por lo que no puede usar el nesting para escapar de la aplicación que lo inició.

Usa el playground junto a la lección para comparar un manifest, un override local y un ceiling del sistema. [Despliegue gestionado](/docs/managed-deployment) explica los comandos administrativos y los archivos de política.
