La integridad es una cadena de comprobaciones pequeñas. El registro prueba qué bytes identifica un descriptor OCI; la transacción del package prueba qué estado completo quedó activo; y el inicio verificado prueba que el Store local sigue describiendo el estado registrado durante la instalación.

## Resolver entradas inmutables

El cliente OCI selecciona la arquitectura actual desde un índice de imágenes, comprueba cada descriptor y almacena los layers por digest SHA-256. Un lock de package guarda los digest resueltos de manifest e imagen para todo el grafo de dependencias. Las runtime sources añaden su tamaño y digest exactos.

## Cambiar solo después de preparar todo

Una instalación o actualización prepara el manifest, los layers OCI, las runtime sources, las dependencias, las exportaciones de escritorio y el registro de base de datos. El registro activo del package solo cambia cuando cada parte necesaria está lista. Una transacción interrumpida se recupera sin sustituir la versión anterior que funcionaba por una versión parcial.

El rollback restaura la vista de runtime derivada del manifest anterior. Los datos escribibles de la aplicación permanecen separados, por lo que una aplicación que haya migrado sus propios archivos puede requerir una recuperación específica.

## Registrar identidad y política por separado

El inicio verificado deriva un root de package para la identidad y un root de política para el acceso efectivo. Después los combina en el root de inicio guardado en el ledger administrado por root. De este modo, los permisos pueden restringirse sin fingir que cambiaron los bytes del package y una actualización puede cambiar el package sin modificar su acceso de forma silenciosa.

## Desconocido y contradictorio no son lo mismo

El enforcement controla un estado sin enrolar o desconocido. Con `off` puede iniciar, con `warn` se informa y con `refuse` se detiene. Un Store manipulado contradice un estado que cpak ya conoce y se rechaza en todos los niveles.

`cpak audit` comprueba registros instalados y enlaces de layers. `cpak system explain` muestra juntos el estado de inicio registrado y el derivado. Un binding backfill registra el estado actual del disco; es una herramienta de migración, no una prueba de autenticidad de los bytes anteriores.

[Inicio verificado](/docs/verified-launch) define cada resultado. [Actualizaciones y rollback](/docs/updates) explica la ruta de transacción.
