---
title: Lanzamiento verificado
description: cpak registra qué es una aplicación cuando se instala y se niega a iniciarla cuando la Store ya no la contiene.
tags: [integrity, security, sandbox]
section: runtime
order: 45
---
# Lanzamiento verificado

Una aplicación instalada es un conjunto de layers, una configuración y un conjunto de permisos. Todo reside en una Store que pertenece al usuario, lo que significa que cualquier cosa en la máquina que se esté ejecutando puede ser modificada por ese usuario, y hasta ahora nada se habría dado cuenta. El inicio verificado cierra eso: cpak registra qué es una aplicación cuando se instala y se niega a iniciarla cuando lo que contiene la Store ya no coincide.

## Contra qué se compara un inicio

Se derivan tres valores y se mantienen separados porque cambian por diferentes razones.

La **raíz del paquete** cubre lo que es la aplicación: su origen, release, resumen de imágenes, configuración, la lista ordenada de sus layers con el estado de almacenamiento que produjo cada una, sus dependencias, complementos, binarios, entradas de escritorio y sesiones. Cambia cuando la aplicación se instala o actualiza.

La **raíz de política** cubre lo que la aplicación puede hacer: el permiso efectivo establecido después del manifest y cualquier override que haya aplicado el usuario. Cambia cuando cambian los permisos, que es un evento separado con una respuesta separada.

La **raíz de inicio** combina los dos. Es el valor registrado en el libro mayor y con el que se compara un inicio.

Mantener separadas la identidad y la política es lo que le permite limitar los permisos de una aplicación sin reinstalarla, y lo que permite que una actualización cambie la aplicación sin cambiar silenciosamente lo que puede hacer.

## Donde se mantiene la expectativa

El libro mayor se encuentra bajo `/var/lib/cpak/integrity/v1`, es propiedad de root, un registro por usuario y origen. La cuenta que inicia una aplicación no puede escribirla. Ese es el punto: todos los demás archivos de los que depende un inicio pertenecen al usuario, por lo que una comparación entre dos archivos que posee el usuario no prueba nada.

La escritura de un registro pasa por la autoridad del sistema, el mismo servicio privilegiado que registra las sesiones de inicio de sesión, por el bus del sistema cuando lo hay, por su socket cuando no lo hay y directamente cuando la persona que llama ya es root.

## ¿Qué sucede cuando la Store no está de acuerdo?

Un inicio llega a una de estas conclusiones.

**Reconocido**: lo que deriva del inicio es lo que contiene el libro mayor. Comienza.

**Manipulado**: la Store se contradice. Un enlace de layer nombra un estado que el repositorio ya no sirve, o un checkout preparado no tiene la forma que describe su estado enlazado. Esto se rechaza en todos los niveles de cumplimiento, incluido el exterior, porque no es algo desconocido, es un desacuerdo dentro de la Store.

**No reconocido**: el libro mayor tiene una raíz y el inicio deriva una diferente. Rechazado cuando la solicitud está inscrita.

**Sin consolidar**: un layer no tiene vinculación, por lo que el inicio no se puede describir en absoluto. El mensaje nombra el comando que lo soluciona.

**No inscrito**: el libro mayor no contiene nada para esta aplicación. Lo que sucede a continuación es lo único que decide el nivel de aplicación de la ley.

## Niveles de aplicación

La aplicación de la ley gobierna lo desconocido. Nunca controla el mal conocido: una Store manipulada es rechazada en todos los niveles.

`off` es el valor predeterminado y se comporta exactamente como lo hacía cpak antes. Se inicia una solicitud de cancelación de inscripción.

`warn` no rechaza nada e informa cada desacuerdo según un error estándar, por lo que se puede observar una máquina antes de encender algo.

`refuse` convierte los no inscritos y no verificables en rechazos.

El nivel se mantiene al lado del libro mayor, propiedad de la raíz, y nunca se lee desde el entorno ni desde nada bajo un directorio de inicio, porque decide si se produce un rechazo.

```bash
cpak system enforcement
cpak system set-enforcement warn
cpak system set-enforcement refuse
```

Cambiarlo solicita una contraseña de administrador.

## leyendo el estado

```bash
cpak audit
cpak system explain github.com/example/app
```

`cpak audit` informa, por aplicación, cuántas de sus layers están vinculadas, si se miden sus checkouts y si está inscrita. `cpak system explain` coloca lo que contiene el libro mayor junto a lo que se deriva de un inicio, de modo que se pueda leer un desacuerdo en lugar de adivinarlo.

Una instalación realizada antes de que existiera el inicio verificado no tiene vinculaciones. No se rechaza en el nivel predeterminado y se puede actualizar sin reinstalar:

```bash
cpak audit --backfill-bindings
```

Un reabastecimiento registra lo que hay en el disco en este momento. No es verificación y el comando así lo dice.

## Lo que prueba la inscripción y lo que no

La inscripción registra lo que se instaló, en el momento en que se instaló. Eso es confianza en la primera instalación. Es una afirmación cierta acerca de una máquina cuyo propietario es confiable, y es la garantía adecuada para una computadora de escritorio: una aplicación, o cualquier otra cosa que se ejecute bajo su control, no puede alterar otra aplicación, sus permisos o el iniciador que habría verificado, sin que el próximo inicio se niegue.

La inscripción por sí sola no es autenticidad. No prueba que el paquete provenga de su autor: para eso, un editor debe firmar lo que publica y cpak debe verificar la firma antes de registrar algo. Eso es [firma del editor](/docs/publishing-signatures), y un host puede requerirlo.

Dos límites más, establecidos porque una garantía cuyos bordes nadie puede ver es peor que una más pequeña:

La comparación en el inicio son los metadatos. Se tratan paths, tipos, tamaños, bits de permiso y destinos de enlaces simbólicos. El contenido del archivo no lo es, porque leer cada byte de una aplicación grande cuesta unos segundos y el inicio no puede pagarlo. El contenido se verifica bajo demanda en lugar de en la path de inicio.

Alguien que sea propietario de la Store y tenga una sesión local activa puede instalar una aplicación modificada y registrarla tal como está. Esa es la misma afirmación que confiamos en la primera instalación, vista desde el otro lado.

## Para un autor de paquete

No hay nada que agregar a un manifest ni nada que firmar. El inicio verificado se deriva en la máquina que instala la aplicación, a partir de la imagen, el manifest y el conjunto de permisos que ya publica. Un paquete creado antes de que existiera se registra de la misma manera que uno creado después.

La firma es una declaración diferente y es opcional. Esto demuestra que el paquete vino del CI de su repositorio, lo cual la inscripción por sí sola no reclama. No hay clave que administrar, porque no tiene clave a través de la identidad de su CI. Consulte [firma del editor](/docs/publishing-signatures) para conocer el workflow y tenga en cuenta que un paquete sin firma se instala y ejecuta exactamente como lo hace hoy.

Una cosa sí afecta a un editor. Una layer entregada a través de una extracción parcial se reconstruye a partir de rangos y el blob con sus nombres de resumen nunca se lee, por lo que nada puede vincular esa layer al estado que produjo. Una aplicación cuyas layers llegan de esa manera se instala y se deja sin registrar, y en `refuse` no se inicia hasta que el usuario registra lo que hay en el disco con `cpak audit --backfill-bindings`. Si sus imágenes llevan anotaciones fragmentadas y desea que sus usuarios se inscriban en la primera instalación, publíquelas sin ellas.

## Requerir una firma

Un host puede decidir que una aplicación se registre solo cuando un editor firmó lo que instala, y que la identidad que la firmó puede hablar del origen del paquete:

```bash
cpak system signatures
cpak system set-signatures required
```

El valor predeterminado es opcional y se comporta como se describió anteriormente: un paquete firmado registra quién lo firmó, uno sin firmar se registra de todos modos y el registro dice que no estaba firmado. En `required` una solicitud cuyo estado no esté firmado por una identidad que pueda hablar de su origen no se inscribe en absoluto y, por lo tanto, en `refuse` no se inicia.

Al configurarlo, se solicita una contraseña de administrador y el nivel se mantiene al lado del libro mayor donde la cuenta de inicio no puede reescribirlo.

Un límite que vale la pena conocer antes de activarlo: una instalación resuelta a través de un archivo de bloqueo no puede presentar una firma verificable hoy, porque el bloqueo reescribe la referencia de la imagen en el manifest antes de que el manifest sea codificado, por lo que ninguna firma cubre el estado resultante. Esas aplicaciones permanecen no registradas en `required`.

## Para una máquina administrada

Cuando la persona que usa el teclado no es la persona que controla la raíz, la garantía es más fuerte, porque el registro y la ejecución los decide una cuenta que el usuario no tiene. Establezca el nivel en `refuse` y una aplicación que el libro mayor no reconoce no se inicia, haga lo que haga el usuario en su propia Store.