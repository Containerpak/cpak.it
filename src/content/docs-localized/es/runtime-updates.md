---
title: Actualiza el runtime cpak
description: Configure comprobaciones de actualizaciones de escritorio y CLI, builds de administradores de paquetes y selección de diálogos nativos.
tags: [updates, desktop, packaging]
section: operations
order: 22
---
# Actualizar el runtime cpak

cpak comprueba la última release oficial GitHub como máximo una vez al día cuando se inicia un comando. El comando solicitado continúa cuando el punto final de actualización no está disponible.

## línea de comando

Verifique sin cambiar el binario:

```bash
cpak self-update --check
```

Descargue e instale la release:

```bash
cpak self-update
```

cpak selecciona los activos `cpak-linux-ARCH` y `cpak-storaged-linux-ARCH` coincidentes, descarga `SHA256SUMS` y verifica ambos binarios. Cada archivo se escribe en un ejecutable temporal en el directorio binario actual, se sincroniza y se le cambia el nombre. El reemplazo comienza después de que ambos activos pasen la verificación.

## Notificación de escritorio

Una sesión de escritorio muestra un aviso para cada nueva release. El comando que activó la verificación continúa mientras el cuadro de diálogo de actualización se ejecuta por separado.

El backend se selecciona en este orden:

1. el backend configurado por la distribución o el usuario
2. el valor predeterminado seleccionado durante la build cpak
3. KDialog en KDE o Zenity en GNOME, Unity y Cinnamon cuando el valor predeterminado compilado es `auto`
4. la interfaz incorporada cpak

Establezca un backend en `~/.config/cpak/cpak.json`, `/etc/cpak/cpak.json` o `/usr/share/cpak/cpak.json`:

```json
{
  "desktop": {
    "dialog_backend": "kde"
  }
}
```

Los valores admitidos son `auto`, `gnome`, `kde` y `builtin`. Un backend nativo configurado recurre a la interfaz integrada cuando su herramienta no está disponible.

Configure `CPAK_OPTS_FILE` para probar un archivo de configuración específico.

## Paquetes de distribución

Cree un binario propiedad del administrador de paquetes con:

```bash
make VERSION=v2.1.2 SELF_UPDATE_MODE=managed DIALOG_BACKEND=auto
```

Las builds administradas continúan verificando el inicio oficial. La CLI y el aviso de escritorio identifican la release disponible y dirigen al usuario al responsable del paquete. El reemplazo binario directo está deshabilitado.

`DIALOG_BACKEND` acepta `auto`, `gnome`, `kde` o `builtin` y se aplica tanto al instalador binario cpak como al instalador cpak. Una configuración JSON todavía tiene prioridad y una herramienta nativa no disponible recurre a la interfaz integrada.

El workflow GitHub utiliza `SELF_UPDATE_MODE=enabled` y `DIALOG_BACKEND=auto` para los binarios estáticos oficiales. Las builds de distribución establecen sus valores seleccionados en el momento de la build.