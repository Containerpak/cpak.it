Una imagen cpak es una imagen OCI normal, aunque su función es más acotada que la de un container de servidor. Necesita la aplicación y las librerías que utiliza. No necesita cpak, un gestor de servicios, manuales ni herramientas de build.

## Elegir la platform más pequeña que encaje

Empiece por la platform mantenida que ya proporciona la ABI requerida: Mesa para gráficos, GTK o Qt para un toolkit de escritorio, Wine para un package que aporta su propio runtime Wine o Proton. Cuando varios packages usan el mismo digest, una platform compartida se descarga y almacena una sola vez.

Fije una release de distribución. Una base flotante puede sustituir librerías sin que nadie revise el package. Los tags de las platform de Containerpak exponen la release de Ubuntu y también pueden identificar un estado publicado concreto.

## Separar la build de la ejecución

```
FROM golang:1.26-bookworm AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -o /out/example ./cmd/example

FROM ghcr.io/containerpak/base:ubuntu-26.04
COPY --from=build /out/example /usr/bin/example
ENTRYPOINT ["/usr/bin/example"]
```

Las cachés del compilador y los headers permanecen en el builder. Instale las librerías de runtime y ejecute `cpak-clean-junk` en el mismo layer, para que los índices de paquetes y los archivos eliminados no terminen en un layer OCI anterior.

## Conservar las traducciones de la aplicación

El layer de locale compartido aporta los datos de locale del sistema compilados para la persona usuaria. Los catálogos de traducción de la aplicación siguen perteneciendo a su propia imagen. No instale `locales-all` ni elimine los catálogos que lee la interfaz.

## Comprobar cada arquitectura publicada

Un manifest multiarquitectura afirma que cada imagen funciona. La CI debe construir e inspeccionar cada arquitectura declarada y ejecutar al menos un binario exportado. Un package de escritorio también necesita un lanzamiento gráfico real en cada path de pantalla que diga admitir.

[Crear imágenes OCI](/docs/images) enumera las platform y las imágenes SDK actuales.
