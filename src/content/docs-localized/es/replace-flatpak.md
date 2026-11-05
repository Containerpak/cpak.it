---
title: Sustituye Flatpak por cpak
description: Instala cpak, mueve las aplicaciones instaladas con Flatpak junto con sus datos y elimina Flatpak cuando nada dependa de él.
tags: [flatpak, migration, install]
section: start
order: 27
---

# Sustituye Flatpak por cpak

cpak instala por sí mismo las aplicaciones Flatpak, así que un sistema puede usarlas sin Flatpak. El cambio tiene tres pasos: instalar cpak, migrar las aplicaciones y eliminar Flatpak cuando las aplicaciones migradas funcionen. Hasta el último paso, las dos instalaciones conviven y no se pierde nada.

## Instala cpak

Sigue [Instala cpak](/docs/install) y después comprueba el host y la build:

```bash
cpak doctor
cpak capabilities
```

La migración requiere cpak 2.14.9 o posterior, donde `cpak capabilities` muestra `flatpak-install`.

## Migra las aplicaciones

```bash
cpak migrate-flatpak
```

cpak lee directamente la instalación de usuario en `~/.local/share/flatpak` y la del sistema en `/var/lib/flatpak`, así que para este paso no hace falta tener instalado el comando `flatpak`. Para cada aplicación averigua qué id, rama y remote pedir, y la instala de nuevo desde ese remote. No se importa nada de la instalación del host: la build se descarga y se verifica con la clave en la que confía cpak. Un remote que cpak ya conoce por su dirección, Flathub ante todo, conserva la clave de cpak; un remote que cpak no conoce se toma con la clave con la que lo autentica la instalación de Flatpak, y el plan lo indica.

El plan enumera cada aplicación con los permisos que tendrá con cpak y después pregunta si continuar. Para mover una sola aplicación:

```bash
cpak migrate-flatpak org.gnome.Calculator
```

## Qué pasa con los datos

Cada aplicación guardaba sus archivos en `~/.var/app/<id>`. cpak los copia en la home privada que le asigna: `config` pasa a `.config`, `data` pasa a `.local/share` y todo lo demás conserva su nombre. La caché se queda atrás, porque la aplicación la reconstruye y suele ser la parte más grande.

La copia se hace una sola vez. Un archivo que la aplicación ya escribió con cpak es más reciente que la copia de Flatpak, así que se conserva. Volver a ejecutar la migración reconoce las aplicaciones que movió una ejecución anterior, sin consultar su remote, y no copia sus datos por segunda vez: no devuelve nada de lo que hayas borrado con cpak mientras tanto.

Una aplicación que con Flatpak tenía acceso a toda la home lee sus datos de ahí y no tiene nada que copiar. Sus datos se quedan donde están.

## Comprueba el resultado

Las instalaciones de Flatpak se quedan como están, así que el menú del escritorio muestra cada aplicación migrada dos veces hasta que se elimine Flatpak. Inicia la copia de cpak desde un terminal para saber con certeza cuál se ejecuta:

```bash
cpak list
cpak run calculator
```

`cpak migrate-flatpak` termina con 0 solo cuando se movieron todas las aplicaciones. Termina con 11 cuando no se pudo alcanzar un remote y con 12 cuando una respuesta no superó la verificación, para que un script sepa cuándo volver a intentarlo. Una aplicación que falla se notifica y se queda en Flatpak.

## Elimina las copias de Flatpak

Cuando las aplicaciones migradas funcionen, las copias de Flatpak pueden irse:

```bash
cpak migrate-flatpak --delete-flatpaks
```

Esto desinstala de Flatpak cada aplicación migrada junto con lo que guardaba en `~/.var/app` y después elimina los runtimes de Flatpak que ya nadie usa. Como los datos se van con ella, cpak te pide que escribas completa una frase de consentimiento, y `--yes` no la responde. Una aplicación que no se pudo migrar, o que tenía acceso a toda la home, nunca se elimina. Este paso usa el comando `flatpak`, así que ejecútalo antes de quitar Flatpak del sistema.

## Elimina Flatpak

Con todas las aplicaciones en cpak, elimina el paquete de Flatpak con el gestor de paquetes del sistema, por ejemplo:

```bash
sudo dnf remove flatpak
sudo apt remove flatpak
sudo pacman -R flatpak
```

A partir de ahí, las aplicaciones de Flathub se instalan con cpak. Consulta [Instala aplicaciones de Flathub](/docs/flathub).
