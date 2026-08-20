Un editor de fotos necesita un lugar desde el que abrir imágenes. Hay cuatro maneras de escribir ese acceso y no son equivalentes. Pulse cada preset del playground y observe la columna de la derecha.

## Cuatro ámbitos, de mayor a menor

**Toda la máquina.** `host`, en modo read-only, abarca todos los archivos del sistema que pueda leer quien ejecuta la aplicación. Pulse _Toda la máquina_ y vea cuánto acceso concede. Hay motivos legítimos para pedirlo, pero un editor de fotos no es uno de ellos.

**Todo el directorio personal.** `home` incluye cada documento, cada descarga y cada directorio oculto, también aquel donde el navegador guarda su sesión. Es el grant excesivo más habitual en cualquier sistema de packaging porque siempre funciona.

**Un directorio de usuario.** `xdg-pictures`, `xdg-documents`, `xdg-download` y los demás se resuelven según la configuración del escritorio de cada persona. Por eso `xdg-pictures` sigue siendo correcto en una máquina donde se llama _Immagini_. Pulse _Todos los directorios de usuario_ y examine la columna resuelta: el nombre de la izquierda y el path de la derecha no son la misma cadena, y esa es precisamente la intención.

**Un path.** `home/.config/fotoritocco` designa un único directorio y nada más. La mayoría de aplicaciones necesitan uno de estos para sus ajustes y un directorio de usuario para los archivos que abre una persona, pero no más.

## Read-only también es una respuesta válida

Cada entrada tiene un modo de acceso, y `read-only` no es una concesión menor. Un visor que nunca guarda debe pedirlo. Un conversor que lee de un sitio y escribe en otro debe solicitar read-only para el primero y read-write para el segundo mediante dos entradas, no read-write para un directorio que contiene ambos.

Cambie un modo de acceso en el playground sin tocar nada más. Los paths no cambian; cambia lo que la aplicación puede hacer al llegar a ellos.

## Lo que cpak rechaza

Pruebe _Una lista que cpak rechaza_. Algunas entradas parecen razonables, pero no lo son: un path relativo no tiene contra qué resolverse, `/` es toda la máquina escrita de una forma que lo oculta y el mismo path dos veces ofrece dos respuestas distintas a una única pregunta. cpak rechaza el manifest en vez de elegir por su cuenta.

## La pregunta para cada línea

Para cada entrada, nombre el primer archivo que abrirá el programa. Si no puede nombrarlo, la entrada es una conjetura y debe quedar fuera del manifest hasta que alguien comunique el bug que la justifique. Un package que empieza pidiendo menos y añade una entrada después inspira confianza; el orden contrario no.

[Permisos](/docs/permissions) enumera cada ámbito y cómo se resuelve.
