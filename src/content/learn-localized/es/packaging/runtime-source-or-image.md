Incluya la aplicación en la imagen OCI cuando su licencia permita redistribuirla. Así la imagen se convierte en un runtime completo, identificado por contenido, que los registros pueden guardar en caché y cpak puede deduplicar por layer.

Use una runtime source cuando el software pueda empaquetarse, pero la persona proveedora exija que cada usuario descargue el payload original. La imagen se mantiene ligera y contiene el wrapper, el icono, la entrada de escritorio y los archivos de integración.

## Una runtime source también queda fijada

```
"runtime_sources": [
  {
    "url": "https://vendor.example/editor.deb",
    "sha256": "9f4d...",
    "size": 48310272,
    "installer": "deb-extract",
    "architecture": "amd64"
  }
]
```

cpak acepta HTTPS, verifica el tamaño exacto en bytes y SHA-256, y después instala el contenido en un layer administrado. Si la persona proveedora cambia el archivo, también debe cambiar la revisión del package. Una URL móvil no puede modificar una instalación de forma silenciosa.

## No ejecutar scripts de paquetes por costumbre

Use `deb-extract` o `rpm` cuando solo necesite el payload. Use `dpkg` únicamente cuando sean necesarios scripts de mantenimiento revisados. Los archivos tar usan `tar`; un artefacto único usa `file` con un destino explícito bajo `/opt`.

Pruebe el package con una caché de runtime sources vacía. Que inicie bien en una máquina que ya tiene instalado el programa del proveedor no demuestra nada sobre la receta.
