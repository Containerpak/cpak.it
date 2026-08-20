---
title: Construir OCI imágenes
description: Produzca imágenes pequeñas de múltiples arquitecturas con builds de CI, sumas de verificación, SBOM y certificaciones en caché.
tags: [images, ci, oci]
section: packages
order: 40
---
# Construir OCI imágenes

cpak consume imágenes estándar OCI. Incluya la aplicación, sus bibliotecas de ejecución, archivos de escritorio declarados y activos necesarios. El runtime cpak permanece en el host.

## Utilice múltiples etapas

Compile o descomprima el software en una etapa de creación, luego copie el resultado del runtime en una etapa final limpia:

```dockerfile
FROM golang:1.26-bookworm AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -o /out/example ./cmd/example

FROM debian:13-slim
COPY --from=build /out/example /usr/bin/example
ENTRYPOINT ["/usr/bin/example"]
```

Las herramientas de build y los cachés del administrador de paquetes permanecen fuera de la imagen final. Esto es importante incluso cuando se comparten layers porque cada byte único debe descargarse y almacenarse una vez.

## Publicar con GitHub Acciones

Los paquetes oficiales Containerpak crean imágenes en GitHub Acciones. Un workflow típico publica `amd64` y `arm64`, utiliza el caché de acciones GitHub y adjunta procedencia y un SBOM:

```yaml
name: Publish

on:
  push:
    branches: [main]
    paths:
      - Containerfile
      - cpak.json
      - .github/workflows/publish.yml

permissions:
  contents: read
  packages: write
  attestations: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-qemu-action@v3
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.repository_owner }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          context: .
          file: Containerfile
          platforms: linux/amd64,linux/arm64
          push: true
          pull: true
          tags: ghcr.io/example/example:main
          cache-from: type=gha
          cache-to: type=gha,mode=max
          provenance: mode=max
          sbom: true
```

Agregue comprobaciones específicas de la aplicación después de la build. Verifique cada arquitectura que el workflow afirma publicar.

Mantenga `pull: true` cuando la imagen final siga una tag de plataforma. Esto hace que la build resuelva el resumen de la plataforma actual incluso cuando la caché de acciones GitHub contiene una base más antigua.

## Imágenes base

Elija una base mantenida que proporcione los paquetes ABI y de runtime que espera su aplicación. Los repositorios Containerpak `images` y `wine` proporcionan entornos reutilizables para paquetes oficiales con necesidades compartidas. Las cargas útiles de las aplicaciones permanecen en las imágenes de sus paquetes.

Mantenga explícita la release de distribución. Una tag de distribución flotante puede reemplazar bibliotecas sin la correspondiente revisión del paquete.

| Imagen | Distribución básica | Uso previsto | Receta |
| ----------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `ghcr.io/containerpak/foundation:main` | ubuntu 26.04 | Base Ubuntu fijada de una soel layer con certificados y la política cpak APT | [`platform/foundation`](https://github.com/Containerpak/images/blob/main/platform/foundation/Containerfile) |
| `ghcr.io/containerpak/base:main` | ubuntu 26.04 | Nombre de compatibilidad de la fundación. | [`platform/base`](https://github.com/Containerpak/images/blob/main/platform/base/Containerfile) |
| `ghcr.io/containerpak/locales:main` | ubuntu 26.04 | Datos locales compilados seleccionados por cpak en el momento de la instalación; no es una base de aplicación | [`platform/locales`](https://github.com/Containerpak/images/blob/main/platform/locales/Containerfile) |
| `ghcr.io/containerpak/mesa64:main` | ubuntu 26.04 | OpenGL de 64 bits, Vulkan, Wayland y runtime de fuentes común | [`platform/mesa64`](https://github.com/Containerpak/images/blob/main/platform/mesa64/Containerfile) |
| `ghcr.io/containerpak/mesa-multilib:main` | ubuntu 26.04 | `mesa64` con bibliotecas de gráficos de 32 bits | [`platform/mesa-multilib`](https://github.com/Containerpak/images/blob/main/platform/mesa-multilib/Containerfile) |
| `ghcr.io/containerpak/mesa:main` | ubuntu 26.04 | runtime de gráficos multilib con herramientas de línea de comandos Mesa y Vulkan | [`platform/mesa`](https://github.com/Containerpak/images/blob/main/platform/mesa/Containerfile) |
| `ghcr.io/containerpak/gtk3:main` | ubuntu 26.04 | Aplicaciones de escritorio GTK 3 con audio y gráficos de 64 bits | [`platform/gtk3`](https://github.com/Containerpak/images/blob/main/platform/gtk3/Containerfile) |
| `ghcr.io/containerpak/webkitgtk:main` | ubuntu 26.04 | Aplicaciones GTK 3 que usan WebKitGTK 4.1 | [`platform/webkitgtk`](https://github.com/Containerpak/images/blob/main/platform/webkitgtk/Containerfile) |
| `ghcr.io/containerpak/gtk4:main` | ubuntu 26.04 | Aplicaciones de escritorio GTK 4 | [`platform/gtk4`](https://github.com/Containerpak/images/blob/main/platform/gtk4/Containerfile) |
| `ghcr.io/containerpak/adwaita:main` | ubuntu 26.04 | Aplicaciones GTK 4 que utilizan libadwaita | [`platform/adwaita`](https://github.com/Containerpak/images/blob/main/platform/adwaita/Containerfile) |
| `ghcr.io/containerpak/webkitgtk6:main` | ubuntu 26.04 | Aplicaciones GTK 4 y libadwaita que usan WebKitGTK 6 | [`platform/webkitgtk6`](https://github.com/Containerpak/images/blob/main/platform/webkitgtk6/Containerfile) |
| `ghcr.io/containerpak/desktop:main` | ubuntu 26.04 | runtime de escritorio completo para aplicaciones que requieren GTK 3, GTK 4, libadwaita y WebKitGTK 4.1 | [`platform/desktop`](https://github.com/Containerpak/images/blob/main/platform/desktop/Containerfile) |
| `ghcr.io/containerpak/gtk:main` | ubuntu 26.04 | Nombre de compatibilidad para `desktop`; Los nuevos paquetes deben seleccionar un branch GTK versionada. | [`platform/gtk`](https://github.com/Containerpak/images/blob/main/platform/gtk/Containerfile) |
| `ghcr.io/containerpak/wine:main` | ubuntu 26.04 | Bibliotecas de alojamiento para imágenes de aplicaciones que suministran Wine o Proton, incluidos gráficos, audio, entrada y multimedia de 32 bits. | [`Containerpak/wine`](https://github.com/Containerpak/wine/blob/main/Containerfile) |

Las imágenes del SDK siguen la misma división:

| Imagen | Uso previsto | Receta |
| ----------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `ghcr.io/containerpak/base-sdk:main` | Entorno de build general de C y C++ | [`sdk/base`](https://github.com/Containerpak/images/blob/main/sdk/base/Containerfile) |
| `ghcr.io/containerpak/mesa64-sdk:main` | Encabezados gráficos de 64 bits y herramientas de build. | [`sdk/mesa64`](https://github.com/Containerpak/images/blob/main/sdk/mesa64/Containerfile) |
| `ghcr.io/containerpak/mesa-sdk:main` | Herramientas y encabezados de gráficos multilib | [`sdk/mesa`](https://github.com/Containerpak/images/blob/main/sdk/mesa/Containerfile) |
| `ghcr.io/containerpak/gtk3-sdk:main` | Encabezados de desarrollo GTK 3 | [`sdk/gtk3`](https://github.com/Containerpak/images/blob/main/sdk/gtk3/Containerfile) |
| `ghcr.io/containerpak/webkitgtk-sdk:main` | Encabezados de desarrollo GTK 3 y WebKitGTK 4.1 | [`sdk/webkitgtk`](https://github.com/Containerpak/images/blob/main/sdk/webkitgtk/Containerfile) |
| `ghcr.io/containerpak/gtk4-sdk:main` | Encabezados de desarrollo GTK 4 y libadwaita | [`sdk/gtk4`](https://github.com/Containerpak/images/blob/main/sdk/gtk4/Containerfile) |
| `ghcr.io/containerpak/desktop-sdk:main` | SDK completo para GTK 3, GTK 4, libadwaita y WebKitGTK 4.1 | [`sdk/desktop`](https://github.com/Containerpak/images/blob/main/sdk/desktop/Containerfile) |
| `ghcr.io/containerpak/gtk-sdk:main` | Nombre de compatibilidad para `desktop-sdk` | [`sdk/gtk`](https://github.com/Containerpak/images/blob/main/sdk/gtk/Containerfile) |

La tag `main` sigue la build de la plataforma actual. `ubuntu-26.04` sigue la build actual para esa release de Ubuntu. tags como `ubuntu-26.04.20260814.3` y `sha-<revision>` identifican un estado de plataforma publicado y son adecuadas para builds reproducibles.

Las imágenes oficiales de la plataforma identifican la imagen local correspondiente en su configuración OCI. cpak lee la configuración regional del usuario, importa solo los directorios compilados necesarios y agrega el layer compartida resultante a la aplicación. Los paquetes conservan sus propios catálogos de traducción y no es necesario incluir `locales-all`.

La elección de distribución define las releases ABI y de biblioteca disponibles para la aplicación. Elija la base más pequeña que ya coincida con el software, fije la imagen final de la aplicación mediante el resumen hasta cpak y revise las actualizaciones de la base en CI antes de publicarlas.

Instale bibliotecas de runtime adicionales y limpie APT en el mismo layer:

```dockerfile
FROM ghcr.io/containerpak/gtk3:ubuntu-26.04

RUN apt-get update && \
    apt-get install -y libexample1 && \
    cpak-clean-junk
```

La política APT de la plataforma ya deshabilita los paquetes recomendados y sugeridos, la retención de paquetes descargados, los manuales, los informes de paquetes y la documentación de build. No reemplace esa política ni instale `locales-all` en cada imagen de la aplicación. Mantenga los catálogos de traducción de aplicaciones en el paquete; cpak proporciona la configuración regional del host compilada a través del layer de configuración regional compartida.

## Diseño de layers

Agrupe el contenido en runtime estable antes de cambiar con frecuencia el contenido de la aplicación. OCI registros y cpak layers de direcciones por resumen, por lo que muchos paquetes pueden compartir layers base sin cambios y conservarlas en todas las actualizaciones.

Evite un solo paso gigante `RUN` cuando haga que una actualización de la aplicación invalide el contenido del runtime no relacionado. Evite muchas layers pequeñas que existen sólo para reflejar comandos de shell individuales. Dividir en límites que probablemente cambien de forma independiente.

## Diseño para deduplicación de dos niveles

Las imágenes base compartidas son útiles más allá de la coherencia de build. cpak almacena OCI layers por resumen, por lo que las aplicaciones creadas sobre la misma base sin cambios reutilizan un layer descargada y almacenada. Una nueva layer se descomprime sólo cuando falta su resumen.

cpak transmite una nueva layer directamente al almacén de contenido global FVS. FVS divide el contenido del archivo en bloques definidos por contenido y reutiliza bloques a los que ya hace referencia otra layer. Esto captura rangos iguales incluso cuando dos imágenes las colocaron en archivos diferentes o produjeron resúmenes OCI diferentes.

```text
OCI digest match     -> reuse the complete layer
New OCI layer        -> verify and decode as one stream
FVS block match      -> reference the existing content block
Unique block         -> store one new content block
```

El primer nivel reutiliza bases estables y límites de layers coincidentes. El segundo nivel encuentra contenido repetido en diferentes diseños de layers. Ambos se ejecutan automáticamente durante la extracción de imágenes. Una importación exitosa conserva la representación FVS utilizada por los paquetes instalados.

Para registros y CDN que conservan respuestas de rango de bytes, `zstd:chunked` permite que cpak lea primero la tabla de contenido del layer y omita los rangos de archivos comprimidos cuyo contenido completo ya existe en FVS. cpak utiliza un flujo completo para una descarga inicial y cambia a rangos solo cuando el contenido conocido lo hace más económico. Una descarga normal de gzip o zstd sigue siendo el respaldo automático. Lea [Elija y opere un registro OCI](/docs/registries) antes de habilitarlo en CI.

## Artefactos externos

Prefiere descargar entradas de build en CI y verificar la suma de verificación proporcionada por el provider antes de usarlas. Si se debe instalar un artefacto en la máquina del usuario, declararlo a través de `runtime_sources` con su URL HTTPS, tamaño exacto, SHA-256 y un instalador `tar`, `dpkg`, `deb-extract`, `rpm` o `file`. Este también es el límite correcto cuando el provider permite a los usuarios descargar una aplicación pero no permite que la Tienda vuelva a publicar su payload. Consulte [Fuentes de runtime](/docs/runtime-sources) para conocer los contratos de archivo y archivado y las comprobaciones de CI.

## Verificar el resultado

Después de que se publique la imagen:

```bash
cpak validate cpak.json
cpak lock cpak.json
cpak test cpak.json
```

Ejecute al menos un binario declarado. Los paquetes de escritorio también necesitan un inicio visual real a través de cpak en cada path de visualización admitida.