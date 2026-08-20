Una release de package conecta una revisión Git, un manifest y el digest de imagen generado para ellos. El repositorio es el origen del package; el Store es un catálogo que dirige a las personas hacia ese origen.

## Hacer que el código fuente y la imagen coincidan

Construya la imagen desde el código etiquetado y publique todas las arquitecturas admitidas. `image_ref: source` puede seguir el branch, la release o el commit Git seleccionado, mientras que `cpak lock` registra los digest de imagen inmutables del grafo resuelto.

```
cpak validate cpak.json
cpak lock cpak.json
cpak test cpak.json
```

Adjunte un SBOM y la procedencia de build en la CI. Compruebe los checksums de proveedores antes de copiar artefactos a una imagen y mantenga el stage final libre de cachés de build.

## Escribir para el Store por separado

`README.md` explica el repositorio a quienes contribuyen. `STORE-README.md` explica la instalación, el primer inicio o la autenticación con proveedores a quien utiliza el package. El Store lo lee del mismo tag o commit resuelto que el manifest, nunca de un branch móvil sin relación.

## Revisar los cambios de permisos como cambios de API

Añadir un permiso cambia el contrato del package. Las actualizaciones interactivas muestran la nueva solicitud antes de activarla. Las actualizaciones no interactivas rechazan una ampliación de permisos. Explique el motivo en la release del package, en vez de ocultarlo en un diff del manifest.

Pruebe la primera instalación, actualización, rollback y eliminación. Si el package tiene addons o dependencias anidadas, incluya también sus rutas de instalación y limpieza.

[Publicar packages](/docs/publishing) explica los metadatos del Store, las firmas y los canales de release.
