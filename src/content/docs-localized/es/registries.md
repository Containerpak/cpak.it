---
title: Elija y opere un registro OCI
description: Seleccione un registro, publique cpak imágenes, habilite extracciones parciales y ejecute un registro privado de forma segura.
tags: [registry, oci, hosting, zstd]
section: packages
order: 45
---
# Elija y opere un registro OCI

Un paquete cpak mantiene su manifest en Git mientras que un registro OCI sirve su contenido de imagen inmutable. cpak implementa el cliente de distribución OCI y extrae manifests y layers directamente a su Store local.

## Compatibilidad del cliente

cpak acepta OCI manifests de imágenes, OCI índices, Docker manifests de esquema 2 y Docker listas de manifests. La imagen seleccionada debe contener un manifest Linux para la arquitectura del host.

El registro debe proporcionar:

- la OCI Distribución `/v2/` API
- Descargas de manifests y blobs por tag o resumen SHA-256
- tamaños de descriptores correctos y contenidos de blobs
- HTTPS, excepto para un registro vinculado a la interfaz de loopback local
- extracciones anónimas o autenticación básica/portadora

cpak verifica los resúmenes de manifests y layers antes de publicar contenido en su Store local. Una redirección del registro puede apuntar a un almacenamiento de objetos HTTPS o a una CDN. Las credenciales de registro nunca se reenvían a ese host. Se debe aprobar explícitamente un host de autenticación independiente a través de `cpak auth login`.

## Elige un servicio

| Registro | Buen ajuste | Trabajo operativo |
| -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [GitHub Registro de containers](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry) | Paquetes cuya fuente y CI ya se encuentran en GitHub | Gestionado por GitHub; la visibilidad del paquete y el acceso al repositorio siguen siendo configuraciones separadas |
| [Puerto](https://goharbor.io/docs/) | Equipos que necesitan una interfaz de usuario web, políticas de proyecto, replicación, escaneo y retención | Operar Harbor, su base de datos, almacenamiento de objetos, copias de seguridad y actualizaciones |
| [Distribución CNCF](https://distribution.github.io/distribution/about/deploying/) | Un pequeño registro privado o público con una superficie de servicio estrecha | Suministre TLS, autenticación, almacenamiento, monitoreo, copias de seguridad y recolección de basura. |
| Otro registro OCI | Infraestructura existente que ya sirve imágenes conformes OCI | Verifique los manifests, las redirecciones, la autenticación y el comportamiento del rango de bytes antes del inicio |

Los paquetes públicos funcionan mejor con acceso anónimo a blobs. Los repositorios privados necesitan un enlace de credenciales para cada origen de paquete y repositorio de registro exacto. Lea [Repositorios privados de GitHub y registros OCI](/docs/registry-authentication) para conocer el modelo de vinculación.

## Publicar layers OCI regulares

Los layers gzip y zstd funcionan en registros conformes. cpak verifica y descomprime cada nueva layer directamente en su representación FVS retenida.

Cualquier editor OCI puede producir la imagen. Mantenga el manifest final en formato OCI cuando el sistema de build lo admita, publique índices de arquitectura solo para las arquitecturas que se probaron y registre el resumen resultante hasta `cpak lock`.

## Habilitar extracciones parciales

`zstd:chunked` agrega una tabla de contenido a un layer zstd. El descriptor de layer lleva la ubicación y la suma de verificación de esa tabla. cpak puede inspeccionarlo con una solicitud de rango de bytes, reutilizar el contenido completo del archivo que ya está presente en FVS y descargar solo los rangos comprimidos necesarios para los archivos faltantes.

cpak selecciona rangos parciales cuando el contenido conocido FVS los hace más baratos que una transmisión completa. Una Store vacía utiliza un flujo verificado completo. Un almacén activo puede omitir cargas útiles de archivos ya indexadas por FVS. La imagen publicada permanece idéntica para ambas paths.

Podman puede publicar este formato directamente:

```bash
podman push \
  --format oci \
  --compression-format zstd:chunked \
  --force-compression \
  ghcr.io/example/application:main
```

El registro y cada CDN o redireccionamiento de almacenamiento de objetos frente a él deben conservar `Range` solicitudes y devolver `206 Partial Content` con un `Content-Range` exacto. cpak verifica la suma de comprobación de la tabla comprimida, los resúmenes de archivos, las compensaciones y la longitud de las respuestas. Las anotaciones faltantes, un proxy no compatible o una respuesta no válida deshabilitan la path parcial para esa layer y cpak descarga el layer zstd completa en su lugar.

Las imágenes normales gzip y zstd siguen siendo totalmente compatibles. `zstd:chunked` agrega la path de transferencia parcial opcional.

## GitHub Ejemplo de acciones

El siguiente paso de inserción publica una imagen OCI con metadatos fragmentados después de la autenticación:

```yaml
- name: Login to GHCR
  run: echo "${{ secrets.GITHUB_TOKEN }}" | podman login ghcr.io --username "${{ github.actor }}" --password-stdin

- name: Publish image
  run: |
    podman build --format oci --tag ghcr.io/example/application:main .
    podman push --format oci --compression-format zstd:chunked --force-compression ghcr.io/example/application:main
```

Conceda el workflow `packages: write` y `contents: read`. No coloque un token de registro en el manifest, el repositorio, la imagen o el texto del workflow.

## Lista de verificación de autohospedaje

Comience con una implementación de distribución OCI mantenida y aplique su guía de implementación de producción.

Antes de publicar paquetes, configure:

- un nombre HTTPS estable y un certificado
- autenticación y autorización del repositorio cuando las extracciones no son públicas
- filesystem persistente o almacenamiento de objetos
- copias de seguridad para la configuración y el contenido del registro
- reglas de retención y monitoreo de almacenamiento
- recolección de basura para manifests y blobs sin referencia
- Límites de solicitud que permiten manifests de imágenes y transferencias de blobs grandes.
- Reglas de proxy y CDN que retienen `Range`, `Content-Range`, `Content-Length` y `Docker-Content-Digest`

Un registro con almacenamiento en el filesystem local debe ejecutarse como un único escritor a menos que el almacenamiento se comparta correctamente. Las interfaces replicadas necesitan un backend de almacenamiento común y un estado de autenticación consistente. Siga el modelo de almacenamiento documentado por el registro seleccionado en lugar de copiar el directorio de datos de un nodo entre instancias activas.

La recolección de elementos no utilizados del registro elimina los blobs remotos después de que desaparece su referencia de manifest final. `cpak gc` realiza la operación correspondiente en los locales FVS y DaBaDee. La migración de almacenamiento utiliza `cpak storage migrate`.

## Verificar antes del inicio

Verifique el punto final del registro y luego ejecute el paquete a través de cpak:

```bash
curl --fail --silent --show-error https://registry.example/v2/
cpak validate cpak.json
cpak lock cpak.json
cpak test cpak.json
```

Repita la prueba en cada arquitectura publicada. Pruebe una vez con una Store de cpak vacía, luego actualice desde la imagen anterior para que los layers compartidas, las extracciones parciales, la reutilización FVS y la reversión se ejecuten con respuestas de registro reales.

Para un paquete privado, repita la prueba mediante el mismo flujo `cpak auth` que seguirán los usuarios. Esto verifica directamente el alcance de la credencial cpak y la política del host del token.

## Comportamiento fallido

cpak trata los fallos de optimización por separado de los fallos de integridad:

- los rangos de bytes no disponibles recurren a una descarga de layer completa
- las anotaciones `zstd:chunked` que faltan usan la path normal gzip o zstd
- un resumen o una discrepancia de tamaño rechaza el layer
- se rechaza un manifest sin una arquitectura Linux coincidente
- se rechaza una solicitud de token entre hosts no aprobada

Esto mantiene la compatibilidad del paquete vinculada a la imagen OCI, mientras que las funciones de rendimiento específicas del registro siguen siendo opcionales.
