Publicar con cpak consiste en publicar tres cosas, aunque solo una suele resultar interesante.

## La imagen

Una imagen OCI: el programa y todo lo que necesita para ejecutarse. Si ya se ha construido un container, se trata del mismo artefacto y se usan las mismas herramientas. A cpak no le importa cómo se creó, solo que pueda descargarse y que su digest sea el declarado.

La imagen no decide a qué puede acceder la aplicación. Un programa que intenta abrir `/etc/shadow` dentro de un container cpak falla, aunque la imagen se haya construido como root, porque el container en el que se ejecuta nunca recibió ese archivo.

## El manifest

Un archivo JSON breve junto a la imagen. Indica el nombre de la aplicación, los binarios y las entradas de escritorio que se exportan, además del acceso solicitado. Esta última lista es el tema de todo el curso.

```
{
  "$schema": "https://raw.githubusercontent.com/Containerpak/cpak/v2/schema/manifest-v3.json",
  "manifest_version": "3.0",
  "name": "Fotoritocco",
  "description": "A photo editor",
  "version": "3.2.0",
  "image": "ghcr.io/example/fotoritocco@sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "binaries": ["/usr/bin/fotoritocco"],
  "services": {
    "server": { "binary": "/usr/bin/fotoritocco", "arguments": ["serve"] }
  },
  "idle_time": 0,
  "override": {
    "socketWayland": true,
    "filesystem": [{ "path": "xdg-pictures", "access": "read-write" }]
  }
}
```

`binaries` enumera los comandos que puede iniciar una persona o una entrada de escritorio. `services` puede asignar a uno de esos binarios un vector de argumentos con nombre para `cpak run --service` y la gestión de servicios persistentes. La declaración no hace persistente el comando; quien administra la máquina lo decide con `cpak service enable`.

Lea ese override como una promesa, no como configuración. Se muestra a quien instala el package, línea por línea, antes de descargar nada. Cada línea añadida es una línea que alguien puede leer, valorar y rechazar.

## La dirección

Un package se instala desde la dirección de un repositorio, no desde el nombre de un índice central:

```
cpak install github.com/you/fotoritocco
```

No hay cola de revisión ni intermediario. Eso tiene dos consecuencias: nadie impedirá que publique, pero nadie responderá por el package tampoco. Una persona desconocida solo tiene el manifest que puede leer y la firma que puede comprobar.

## Por qué existe el manifest

No sirve para configurar el sandbox. El sandbox existe haya o no manifest, y una aplicación sin override recibe un container sin pantalla, sonido, red ni directorios. El manifest permite pedir de vuelta las pocas cosas necesarias.

El trabajo de quien empaqueta se reduce a una pregunta por línea: **¿qué es lo mínimo que hace que esto funcione?** No lo mínimo para que funcione en una máquina concreta con sus archivos, sino lo mínimo para que funcione en general. Las dos lecciones siguientes aplican esa pregunta a dos lugares donde suele fallarse: el filesystem y la entrada de escritorio.

[La referencia del manifest](/docs/manifest) enumera todos los campos. Conviene tenerla abierta al leer el resto.
