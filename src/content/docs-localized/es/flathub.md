---
title: Instala aplicaciones de Flathub
description: Encuentra una aplicación en Flathub, instálala con cpak y mantenla actualizada sin instalar Flatpak.
tags: [flatpak, flathub, install]
section: start
order: 25
---

# Instala aplicaciones de Flathub

cpak instala aplicaciones Flatpak sin Flatpak. Lee la aplicación, su runtime y sus extensiones desde el repositorio OSTree del remote, comprueba cada objeto con la clave de firma del remote y los guarda como capas de cpak. Después, la aplicación se ejecuta en el sandbox de cpak como cualquier otro paquete. Flathub viene configurado de serie, con su clave incluida en cpak, así que no hay nada que añadir antes de la primera instalación. El soporte de Flatpak requiere cpak 2.14.9 o posterior; `cpak capabilities` muestra `flatpak-install` cuando la build lo incluye.

## Encuentra una aplicación

Busca en [flathub.org](https://flathub.org). Cada página de aplicación tiene una dirección de la forma `https://flathub.org/apps/<id>`, y la última parte es el id que necesita cpak, como `org.gnome.Calculator` u `org.mozilla.firefox`. El mismo id aparece en el comando de instalación que Flathub muestra bajo el botón Install.

## Instálala

Pasa el id a `cpak install --flatpak`:

```bash
cpak install --flatpak org.gnome.Calculator
```

Antes de descargar nada, cpak muestra la aplicación, el runtime que necesita y los permisos que pide, traducidos a una política de cpak. Las peticiones que tienen un equivalente en cpak se conceden como cpak las concede. Las que no lo tienen, o que debilitarían el sandbox, se rechazan y se enumeran con el motivo: el bus de sesión o de sistema directo, la raíz del host, `/tmp`, los sockets de otros servicios bajo `xdg-run`, `devel` y todo `/dev`. Responde a la pregunta para instalar, o pasa `--yes` en los scripts.

El botón Install de Flathub también enlaza un archivo `.flatpakref`. cpak lo lee desde una ruta o una dirección HTTPS:

```bash
cpak install --flatpak https://dl.flathub.org/repo/appstream/org.gimp.GIMP.flatpakref
```

Una rama distinta de la predeterminada se elige con `--branch`:

```bash
cpak install --flatpak org.mozilla.firefox --branch stable
```

Algunas aplicaciones, como Google Chrome o Discord, solo publican en Flathub una pequeña receta y descargan el programa real de su editor. cpak descarga ese archivo durante la instalación, lo comprueba con el checksum que promete la build de Flathub y ejecuta el paso de extracción de la aplicación dentro del sandbox, sin acceso a la red.

## Ejecútala

La aplicación aparece en el menú del escritorio como cualquier otra. Desde un terminal, cpak crea un alias corto con la última parte del id cuando el nombre está libre, y lo muestra al terminar la instalación:

```bash
cpak run calculator
```

La aplicación se instala con el origen `flatpak/<remote>/<id>`, por ejemplo `flatpak/flathub/org.gnome.calculator`. Ese origen funciona con todos los comandos que aceptan uno.

## Mantenla actualizada

Las aplicaciones Flatpak siguen el mismo ciclo de vida que los paquetes de cpak:

```bash
cpak list
cpak update
cpak rollback flatpak/flathub/org.gnome.calculator
cpak remove flatpak/flathub/org.gnome.calculator
```

El runtime se instala junto a la aplicación y se comparte con todas las aplicaciones de la misma rama. Se elimina junto con la última aplicación que lo usa.

## Cambia los permisos

Un permiso que cpak rechazó al instalar todavía puede concederse, y uno concedido retirarse, con un override:

```bash
cpak override edit flatpak/flathub/org.gnome.calculator
```

## Otros remotes

Flathub es el remote predeterminado. Otro remote se añade instalando desde su `.flatpakref`: cpak muestra la huella de la clave antes de confiar en ella, y las instalaciones posteriores desde ese remote se eligen con `--flatpak-remote`:

```bash
cpak install --flatpak org.example.App --flatpak-remote example
```

## Integración con el escritorio

La aplicación llega al escritorio como lo haría con Flatpak, a través de los portales, pero sin ningún servicio de portal. cpak sirve por sí mismo el bus de sesión del sandbox y responde a los selectores de archivos, enlaces, notificaciones, ajustes, estado de la red y resolución de proxies mediante su broker. Los procesos auxiliares iniciados con `flatpak-spawn` se ejecutan en el mismo sandbox, nunca en el host. El controlador NVIDIA del host se usa mediante el soporte NVIDIA de cpak, y Mesa llega desde el runtime.

Para mover las aplicaciones que ya instalaste con Flatpak, consulta [Sustituye Flatpak por cpak](/docs/replace-flatpak).
