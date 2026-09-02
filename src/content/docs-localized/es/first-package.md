---
title: Tu primer paquete
description: Cree un paquete con manifest v3, construya su imagen y pruébelo en un almacén aislado.
tags: [packaging, tutorial]
section: packages
order: 10
---

# Tu primer paquete

Un repositorio de paquetes necesita una imagen OCI y `cpak.json`. Comience con una aplicación de línea de comandos para que se pueda verificar cada parte del paquete antes de agregar la integración de escritorio.

## Crear el repositorio

```bash
mkdir hello-cpak
cd hello-cpak
git init
```

Cree un `Containerfile` que copie la aplicación en una pequeña imagen de runtime. Cada path binaria declarada en el manifest debe existir en la imagen final.

```dockerfile
FROM debian:13-slim

RUN printf '#!/bin/sh\nprintf "Hello from cpak\\n"\n' > /usr/bin/hello-cpak \
    && chmod 0755 /usr/bin/hello-cpak

ENTRYPOINT ["/usr/bin/hello-cpak"]
```

Cree y publique la imagen con cualquier workflow de registro OCI.

## Generar el manifest

```bash
cpak init \
  --name "Hello cpak" \
  --description "Small package used to verify a cpak setup." \
  -v 1.0.0 \
  --image ghcr.io/your-name/hello-cpak@sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef \
  --binary /usr/bin/hello-cpak
```

Sustituya el digest de ejemplo por el que devuelve el registro después de publicar la imagen. El manifest generado usa la versión `3.0`, incluye la URL del esquema actual y deja `override` vacío porque el comando no necesita recursos del host.

## Validar antes de ejecutar

```bash
cpak validate cpak.json
cpak lock cpak.json
cpak test cpak.json --binary /usr/bin/hello-cpak
```

`cpak validate` verifica el contrato manifest. `cpak lock` resuelve el paquete raíz y las dependencias de resúmenes de imágenes inmutables. `cpak test` utiliza un almacén temporal cpak, verifica los binarios declarados y las entradas del escritorio, luego ejecuta el binario seleccionado cuando se solicita.

El flujo temporal utiliza un almacén aislado y omite las exportaciones de escritorio.

## Agregar una aplicación de escritorio

Copie el archivo `.desktop` y el ícono de la aplicación en paths estándar en la imagen final, luego declare el archivo de escritorio:

```json
"desktop_entries": [
  "/usr/share/applications/com.example.Hello.desktop"
]
```

El comando `Exec` en la entrada del escritorio debe apuntar a un binario disponible en el paquete. cpak exporta una entrada de host que inicia la aplicación a través de su origen instalado y permisos efectivos.

## Pruebe el flujo del desarrollador

`cpak dev` realiza la instalación del paquete aislado y lanza el binario seleccionado:

```bash
cpak dev cpak.json --binary /usr/bin/hello-cpak
```

Utilice `--origin` cuando las dependencias relativas necesiten el origen futuro del paquete. Utilice `--lock` para seleccionar un archivo de bloqueo explícitamente.

## Publicar el repositorio

Primero envíe la imagen y luego envíe el repositorio de paquetes. Cualquiera puede instalar el paquete por su origen después de que se pueda acceder a `cpak.json`:

```bash
cpak install github.com/your-name/hello-cpak
```

El envío del catálogo es opcional. Siga [Publicar en la Store](/docs/publishing) cuando el paquete esté listo para ser descubierto en cpak.it.
