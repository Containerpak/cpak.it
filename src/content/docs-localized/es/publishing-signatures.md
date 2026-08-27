---
title: Firma del editor
description: Firme lo que publica para que una máquina pueda distinguir su build a partir de una copia, sin llave a través de su CI.
tags: [publishing, security, signing]
section: packages
order: 50
---

# Firma del editor

Esta página es para personas que publican un paquete cpak. Explica qué es la firma de un paquete, qué agrega a su workflow para producir uno, cuánto le cuesta y qué les sucede a las personas que instalan su paquete si nunca lo hace.

## No hacer nada sigue funcionando

La firma es opcional y sigue siendo opcional. Un paquete sin firma se instala y ejecuta exactamente como lo hace hoy, y nada en esta página cambia eso.

Lo que renuncia al no firmar es lo único que agrega una firma: nadie puede distinguir una build que salió de su repositorio aparte de una copia que salió de otro lugar, y una máquina que quiere verificar antes de instalar no tiene nada que verificar.

## Qué se firma y qué prueba

Una firma no cubre la imagen. Cubre la parte de la identidad de su paquete que puede determinar antes de que llegue a la máquina de alguien:

- el origen, que es el repositorio desde el que se publica su manifest
- el SHA-256 de tu manifest
- El resumen de la imagen que se manifiesta resolvió
- el SHA-256 de tu candado, cuando el paquete tenga uno
- una generación, que ordena dos estados firmados del mismo paquete

El manifest está dentro de la firma porque ahí es donde residen los permisos. Firmar solo la imagen permitiría a alguien cambiar `cpak.json` por una que amplíe el entorno limitado y mantenga una firma válida.

Demuestra que el paquete vino del CI de ese repositorio y no fue modificado en el camino. No prueba que el software sea seguro y no protege contra un repositorio comprometido: el repositorio es la identidad que se está probando.

## lo que te cuesta

- Sin llave. La firma se realiza sin clave a través de la identidad OIDC de su CI, por lo que no hay nada que generar, almacenar, rotar o perder. - Ningún secreto. El workflow siguiente utiliza `secrets.GITHUB_TOKEN`, que GitHub crea para cada ejecución. No agrega nada a la configuración del repositorio. - Alrededor de veinte segundos de tiempo de workflow por publicación. - Un número que solo aumenta y un paso de firma por publicación. Un nuevo manifest o una nueva imagen es un nuevo estado, y un viejo estado no puede sustituirlo.

## El workflow

Agregue este trabajo al workflow que ya impulsa su imagen, o péguelo completo y apunte el paso de build a su `Dockerfile`.

```yaml
name: Publish

on:
  push:
    branches: [main]

permissions:
  contents: read
  packages: write
  id-token: write

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}:main

      - uses: sigstore/cosign-installer@v3

      - name: Install cpak-sign
        run: |
          curl -fsSLO https://github.com/Containerpak/cpak/releases/latest/download/cpak-sign-linux-amd64
          install -Dm755 cpak-sign-linux-amd64 /usr/local/bin/cpak-sign

      - name: Sign the package state
        env:
          CPAK_REGISTRY_USERNAME: ${{ github.actor }}
          CPAK_REGISTRY_PASSWORD: ${{ secrets.GITHUB_TOKEN }}
        run: |
          cpak-sign state \
            --origin "github.com/${{ github.repository }}" \
            --image "ghcr.io/${{ github.repository }}:main" \
            --generation "${{ github.run_number }}"
          cosign sign-blob --yes --new-bundle-format=true \
            --bundle cpak-state.sigstore.json cpak-state
          cpak-sign attach --image "ghcr.io/${{ github.repository }}"
```

Las tres líneas que hacen el trabajo son las tres del último paso. El primero escribe la payload, el segundo la firma con la identidad de esta ejecución de workflow, el tercero adjunta el resultado a la imagen en su registro.

`permissions: id-token: write` es lo que permite que la carrera demuestre quién es. Sin él, `cosign` no tiene identidad con la que firmar y el paso falla.

## ¿Qué hay en la payload?

La payload es un archivo de texto corto, un campo por línea, y es la cadena de bytes exacta la que se firma. Puedes leerlo:

```
cpak.signature.state.v1
abi=1
origin=github.com/example/app
manifest_sha256=6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b
image_digest=sha256:2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae
lock_sha256=
generation=12
```

Nada de lo que contiene es un secreto y nada de lo que contiene trata sobre la máquina que instalará el paquete. `cpak verify-signature` toma los mismos campos y los compara manualmente, así es como confirmas lo que publicaste sin instalar nada.

## la generacion

`--generation` ordena dos estados firmados del mismo paquete y cpak lo usa para distinguir un estado más nuevo de uno más antiguo. `github.run_number` es una fuente razonable: aumenta en uno en cada ejecución del workflow.

Tiene que seguir subiendo. Cambiar el nombre o reemplazar el archivo de workflow se reinicia `run_number` en 1, por lo que si le cambia el nombre, cambie a un número que continúe desde donde terminó la última publicación.

## tags y por qué el resumen es lo que se firma

Una firma sobre una tag no valdría nada: una tag puede redireccionarse a otra imagen al día siguiente de su firma. Entonces `cpak-sign state` resuelve la referencia que le proporcionas y coloca el resumen que resolvió dentro de la payload. La firma es el pin.

Manifest v3 hace visible la misma regla antes de verificar la firma: el campo `image` debe contener un digest OCI. Siga publicando etiquetas para el uso normal del registro y escriba en `cpak.json` el digest producido por la compilación antes de crear el estado firmado. El hash del manifest y el digest de la imagen indican así la misma publicación.

`cpak-sign state` rechaza una referencia que no sea un resumen en `--image-digest`, en voz alta, en lugar de firmar algo que pueda moverse debajo.

## Más de una arquitectura

cpak mide el manifest de imagen para la arquitectura en la que se está instalando, por lo que una imagen de múltiples arquitecturas necesita un estado firmado por arquitectura. Ejecute el paso de firma en un corredor de cada arquitectura:

```yaml
strategy:
  matrix:
    runner: [ubuntu-latest, ubuntu-24.04-arm]
runs-on: ${{ matrix.runner }}
```

Cada ejecución resuelve la misma tag en el manifest para su propia arquitectura, firma el resumen y adjunta el paquete a ese manifest. Una única imagen arquitectónica no necesita nada de esto.

## Lo que obtienen tus usuarios

El paquete viaja con la imagen, y lleva en su interior el certificado y el comprobante de transparencia. La verificación está fuera de línea: cpak la compara con una raíz de confianza que se envía con cpak, por lo que no agrega ninguna llamada de red a la descarga, sigue funcionando durante una interrupción de Sigstore y aún funciona más tarde en una máquina sin Internet, que es lo que permite que un paquete se vuelva a verificar mucho después de su instalación.

## Reformatear y qué no rompe una firma

El hash del manifest se toma sobre el JSON cpak mismo codifica su manifest, no sobre los bytes de su archivo. Volver a sangrar `cpak.json` o reordenar sus claves no invalida una firma. Cambiar un permiso, una imagen, un binario o una dependencia sí lo hace, y ese es el punto.

Si un `cpak.lock.json` se encuentra al lado del manifest, `cpak-sign state` incluye su hash y se niega a firmar cuando el bloqueo se creó a partir de un manifest diferente. Ejecute `cpak lock cpak.json` nuevamente y confirme el resultado.

## Referencia de comando

`cpak-sign state` construye la payload:

| Bandera          | Significado                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| `--manifest`     | Camino al manifest. El valor predeterminado es `cpak.json`.                                          |
| `--lock`         | Camino a la cerradura. El valor predeterminado es `cpak.lock.json` junto al manifest, cuando existe. |
| `--origin`       | El repositorio desde el que se publica el manifest.                                                  |
| `--image`        | La referencia a resolver. El valor predeterminado es la imagen que declara el manifest.              |
| `--image-digest` | Un resumen para firmar tal como está, para un registro al que la ejecución no puede llegar.          |
| `--generation`   | La generación de este estado. Comienza a las 1.                                                      |
| `--output`       | Donde está escrita la payload. El valor predeterminado es `cpak-state`, `-` para salida estándar.    |

`cpak-sign attach` publica el paquete:

| Bandera    | Significado                                                                          |
| ---------- | ------------------------------------------------------------------------------------ |
| `--image`  | El repositorio en el que reside la imagen firmada.                                   |
| `--state`  | La payload que se firmó. El valor predeterminado es `cpak-state`.                    |
| `--bundle` | El paquete `cosign` escribió. El valor predeterminado es `cpak-state.sigstore.json`. |

`attach` lee el resumen de la imagen fuera del estado firmado, por lo que solo puede publicarse con la imagen que cubre la firma. Verifica el paquete antes de enviar algo y rechaza un paquete firmado por una identidad que no puede hablar por su origen, porque es una firma que todo usuario rechazaría.

`CPAK_REGISTRY_USERNAME` y `CPAK_REGISTRY_PASSWORD` son la forma en que ambos comandos se autentican en el registro. Una contraseña nunca es una bandera.

## Registros

La firma se adjunta como referencia OCI de la imagen, que es lo que hace `cosign` de forma nativa y lo que admite GHCR. `attach` falla si el registro almacena el manifest sin indexarlo como referencia, porque cpak encuentra una firma a través de la API de referencias y una firma que nadie puede encontrar no es una firma publicada.

## Construyendo cpak-firma tú mismo

Si prefieres no descargar un binario:

```sh
git clone --depth 1 --branch v2 https://github.com/Containerpak/cpak /tmp/cpak
go -C /tmp/cpak build -o /usr/local/bin/cpak-sign ./cmd/cpak-sign
```
