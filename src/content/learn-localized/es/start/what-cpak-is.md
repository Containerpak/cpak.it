cpak instala aplicaciones en Linux. La diferencia con el gestor de paquetes de la distribución está en lo que una aplicación instalada puede hacer después.

Cuando un programa se instala de la forma habitual, se ejecuta con los permisos de la persona que lo abre. Puede leer todos los archivos que esa persona puede leer: documentos, fotos, el perfil del navegador y las claves de `~/.ssh`. No pidió acceso a nada de ello ni hay nada que limite ese acceso. Un editor de texto y un gestor de contraseñas tienen el mismo alcance.

Con cpak, el mismo programa empieza sin ninguno de esos accesos: sin directorios, micrófono, red ni ventana. Solo puede tocar aquello que solicitó por nombre en un archivo incluido con el paquete, disponible para leer antes de instalarlo.

## Qué se instala realmente

Una aplicación instalada con cpak no es un conjunto de archivos repartidos por el sistema. Es una imagen: el programa y todo lo que necesita para ejecutarse se descargan juntos y se conservan juntos.

Junto a la imagen hay un archivo breve, el manifest. Enumera lo que solicita la aplicación: carpetas, dispositivos y acceso a la red. No se concede nada más y no existe un valor predeterminado que añada permisos de forma silenciosa.

Al ejecutarla, cpak construye un entorno pequeño alrededor del programa. Dentro de él, el programa ve su propia imagen y aquello que pidió el manifest. El resto de la máquina no está disponible. No está oculto ni es de solo lectura: no existe dentro del entorno.

## Por qué merece la pena

La cuestión relevante sobre un programa que no se ha escrito no es si hoy es malicioso. Es qué podría hacer si lo fuera, si quedara comprometido más adelante o si cambiara quien lo mantiene.

Un manifest transforma una cuestión de confianza en una cuestión de lectura. Antes de instalar una aplicación, se puede comprobar lo que solicita y decidir si tiene sentido para lo que dice ser. Una calculadora que pide acceso al directorio personal ya aporta información importante sobre sí misma.

## Tres palabras que aparecerán a menudo

**Package**. La aplicación tal como cpak la instala: la imagen, el manifest y el nombre con el que se publica.

**Manifest**. El archivo que enumera lo que solicita el package. En estas lecciones aparecerá con frecuencia.

**Permiso**. Una línea de esa lista: una carpeta, un dispositivo, un socket o la red. La siguiente lección explica qué abre realmente cada uno, que suele ser más de lo que su nombre sugiere.
