La imagen incluye un archivo `.desktop`. Si se exportara sin cambios, su línea `Exec` iniciaría el programa en el host, fuera del container, con acceso a todo lo que pueda alcanzar quien lo ejecute. Por eso cpak no lo exporta tal cual: lee el archivo y reescribe cada comando para que pase por `cpak run`.

El playground junto a este texto reproduce esa reescritura línea a línea. Comienza con _Una entrada publicada_, el caso habitual.

## Todas las variantes, no solo la evidente

Pulse _La misma clave, tres formas_. En ese archivo hay tres líneas que asignan `Exec`: una empieza con espacio, otra con tabulador y otra deja espacio antes del signo igual. Un launcher no compara bytes: elimina ese espacio, interpreta las tres como la misma clave y ejecuta la última que encuentra.

Reescribir la primera y dejar las demás sería peor que no hacer nada, porque el archivo parecería tratado y el programa seguiría iniciando fuera del container. Se reescriben las tres. La idea importante es esta: lo que se ejecuta lo deciden las reglas del launcher, no el aspecto del archivo.

## Y nada que solo se parezca

Pulse _Líneas que solo parecen Exec_. Cuatro líneas contienen esa palabra y una asigna la clave. Un comentario no es una clave. `Exec[de]` es otra clave. `ExecPath` es otra clave. Un valor que contiene esa palabra sigue siendo un valor. cpak no reescribe nada que un launcher no hubiera ejecutado, porque reescribir una línea que nunca fue un comando corrompería el archivo sin avisar.

## Lo que cpak no hará por ti

Pulse _Un archivo sin el grupo [Desktop Entry]_. Los comandos se siguen reescribiendo porque un comando al que pueda llegar un launcher debe ejecutarse dentro del sandbox, esté donde esté escrito. Lo que cpak no hace es inventar el grupo que falta.

Esa es la lógica completa: corrige lo que puede leer y no adivina lo que no se escribió. Un archivo sin grupo debe corregirse dentro de la imagen; la exportación lo indicará en vez de inventar contenido.

## Dos archivos, no uno

La entrada que escribe cpak no es la misma que incluía la imagen, y ambas siguen disponibles: la original dentro de la imagen y la exportada bajo el directorio de aplicaciones del usuario. Pegue su propio archivo en el playground antes de publicar. Si una línea que esperaba reescrita queda marcada como intacta, ese es el bug y es mucho más barato encontrarlo aquí que después de que alguien instale el package.

[Integración con el sistema](/docs/system-integration) es la referencia de esta lección.
