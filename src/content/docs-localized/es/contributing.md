---
title: Contribuyendo a cpak
description: Cree la branch v2, ejecute su conjunto de verificación y envíe cambios específicos al repositorio correcto.
tags: [contributing, development, go]
section: project
order: 10
---
# Contribuyendo a cpak

El proyecto cpak se divide en runtime, bibliotecas reutilizables, imágenes de paquetes, la Tienda y este sitio web. Comience en el repositorio propietario del comportamiento que desea cambiar.

## Construya el runtime

El repositorio principal utiliza la branch `v2` y Go 1.25 o posterior según lo declarado por `go.mod`.

```bash
git clone https://github.com/Containerpak/cpak.git
cd cpak
git switch v2
make all
./cpak --help
```

`make all` construye un binario `cpak` estático con `CGO_ENABLED=0`. Mantenga los binarios generados fuera de las commits.

## Ejecute las comprobaciones principales

```bash
go test -race ./...
go vet ./...
go run . gen-schema --output /tmp/manifest-v2.json
diff -u schema/manifest-v2.json /tmp/manifest-v2.json
```

El esquema generado debe coincidir con el esquema confirmado. Agregue pruebas junto al comportamiento modificado. Los cambios en runtime deben cubrir los comandos exitosos, las paths de falla y la recuperación del almacén.

## Comportamiento del host de prueba

```bash
./cpak doctor --json
```

Inspeccionar cada capacidad reportada. El comportamiento del espacio de nombres, montaje, Landlock, seccomp, cgroup, display, audio, init y host bridge depende del host. Siga las pruebas unitarias con una verificación del runtime en un host compatible.

Para un cambio de inicio, instale o pruebe un paquete real a través del binario cpak creado localmente. Para un cambio de paquete, cree la imagen en su workflow GitHub y pruebe el resultado publicado mediante cpak.

## trabajar en paquetes

Cada paquete oficial tiene su propio repositorio bajo la organización Containerpak. El repositorio de paquetes posee `cpak.json`, su receta de imágenes, pruebas e integración específica de la aplicación.

Las soluciones alternativas específicas de la aplicación pertenecen al repositorio de paquetes. El contenido compartido ABI pertenece a una imagen base o dependencia cuando varios paquetes lo usan.

## Trabajar en el sitio web

El sitio web es una aplicación SvelteKit en [Containerpak/cpak.it](https://github.com/Containerpak/cpak.it). La documentación se encuentra como Markdown en `src/content/docs` y el sitio la procesa localmente.

```bash
pnpm install
pnpm check
pnpm build
pnpm dev
```

Verifique los diseños de escritorio y móviles para detectar cualquier cambio visual. Los ejemplos de código de documentación deben coincidir con el esquema y la CLI v2 actuales.

## Mantenga los cambios enfocados

Siga las convenciones que ya están presentes en el repositorio de destino. Evite formatos no relacionados o actualizaciones de dependencias. Un cambio debe explicar su comportamiento a través de código, pruebas y un asunto de commit conciso.

Utilice las plantillas de informes existentes en el repositorio al abrir una incidencia. Incluya un comando reproducible y evidencia sin procesar de fallas en runtime.

## Licencias

El runtime cpak y todas las contribuciones aceptadas permanecen disponibles solo bajo LGPL-2.1. Los contribuyentes deben aceptar el [cpak Acuerdo de licencia de colaborador](https://github.com/Containerpak/cpak/blob/v2/CLA.md), que otorga a los propietarios del proyecto los derechos necesarios para mantener cpak manteniendo las contribuciones bajo la misma licencia pública.

Las imágenes de los paquetes llevan las licencias y los términos de redistribución del software incluido. Revise los términos anteriores antes de publicar archivos binarios, íconos, fuentes o capturas de pantalla.