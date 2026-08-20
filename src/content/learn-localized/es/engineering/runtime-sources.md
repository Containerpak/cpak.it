Algunos programas se pueden empaquetar, pero no redistribuir dentro de una imagen OCI pública. Una runtime source mantiene pública la receta cpak mientras que la máquina de cada usuario descarga el artefacto original desde el proveedor.

## Declarar un artefacto exacto

```
"runtime_sources": [
  {
    "name": "editor-amd64.deb",
    "url": "https://vendor.example/download/editor-amd64.deb",
    "sha256": "9f4d...64 hexadecimal characters...",
    "size": 48310272,
    "installer": "deb-extract",
    "architecture": "amd64"
  }
]
```

La URL debe usar HTTPS, incluidas las redirecciones. Se compara el tamaño declarado con los bytes descargados. SHA-256 identifica el contenido y un filtro de arquitectura evita instalar el payload equivocado.

## Elegir el contrato de instalación más pequeño

`deb-extract` y `rpm` extraen payloads de packages sin convertir cpak en la distribución del host. `tar` gestiona un archivo tar. `file` instala un solo archivo en un path explícito bajo `/opt`. `dpkg` sigue disponible para packages cuyos scripts de mantenimiento sean necesarios para la instalación.

No seleccione `dpkg` solo porque la entrada termine en `.deb`. Úselo únicamente cuando los scripts sean necesarios y hayan sido revisados. Para la mayoría de payloads de escritorio, extraer es un límite de confianza menor.

## Preparar antes de cambiar el package

cpak descarga en un archivo temporal, limita el stream al tamaño declarado, verifica el hash e instala el resultado en un layer de runtime administrado. Una actualización prepara el manifest nuevo, los layers OCI, las runtime sources, las exportaciones y el registro de base de datos; la versión activa cambia solo después de que cada fase termine bien.

Una runtime source no es un canal de actualizaciones mutable. Un artefacto del proveedor modificado requiere un tamaño o digest diferente en una revisión de package revisada. La source instalada queda vinculada a esa versión de package y participa en el rollback.

## Conservar los metadatos para la persona usuaria en la receta

La imagen OCI ligera sigue conteniendo el wrapper, el icono original, la entrada de escritorio y los archivos de integración que necesite la aplicación. El payload del proveedor aporta el programa. La receta aporta el contrato cpak y una ruta de inicio estable.

[Referencia del manifest](/docs/manifest) enumera los campos de installer admitidos y las reglas de validación.
