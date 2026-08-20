---
title: Instalar cpak
description: Instale el comando v2, verifique el host y comprenda dónde guarda cpak sus datos.
tags: [install, host]
section: start
order: 10
---
# Instalar cpak

cpak se distribuye como dos archivos binarios estáticos de Go y extrae el contenido de OCI a través de la API de distribución. El comando `cpak` posee el ciclo de vida del paquete y la aplicación. `cpak-storaged` prepara y verifica las comprobaciones del layer nativa durante la instalación, actualización o mantenimiento y luego sale. Una aplicación preparada se inicia directamente desde su índice de ejecución.

## descargar el binario

Abra la [última release cpak](https://github.com/Containerpak/cpak/releases/latest) y descargue `cpak-linux-amd64` más `cpak-storaged-linux-amd64` en x86-64, o los dos activos `arm64` coincidentes en ARM64. Descargue `SHA256SUMS` de la misma release, luego verifique e instale ambos binarios en su usuario `PATH`:

```bash
sha256sum -c --ignore-missing SHA256SUMS
install -Dm755 cpak-linux-amd64 "$HOME/.local/bin/cpak"
install -Dm755 cpak-storaged-linux-amd64 "$HOME/.local/bin/cpak-storaged"
cpak --help
```

Reemplace ambos nombres de activos `amd64` con sus variantes `arm64` en ARM64.

Mantenga ambos binarios en el mismo directorio. cpak descubre su servicio de almacenamiento junto al comando activo antes de verificar al usuario `PATH`. Una instalación en todo el sistema es opcional. El instalador gráfico y `cpak self-update` reemplazan ambos archivos juntos y preparan el almacenamiento de la aplicación existente antes de regresar.

## Instalar una aplicación desde la Tienda

Cada página de aplicación en la [cpak Tienda](/store) proporciona un instalador gráfico firmado, el comando de terminal equivalente y una URL de instalación directa. El archivo descargado se instala cpak, su servicio de almacenamiento correspondiente y la aplicación seleccionada.

Los navegadores normalmente guardan los archivos descargados sin el bit ejecutable. Habilite la ejecución en las propiedades del archivo o ejecute:

```bash
chmod +x Application-amd64.cpak-installer
./Application-amd64.cpak-installer
```

Al abrirlo desde una sesión de escritorio se muestran los detalles de la aplicación, los permisos solicitados, el progreso y el resultado final. Iniciarlo desde una terminal utiliza un mensaje de texto equivalente. Lea [cpak-installer](/docs/cpak-installer) para obtener detalles de verificación, inspección de metadatos, enlaces directos e integración de desarrolladores.

## comprobar el host

Ejecute la verificación de capacidad del host antes de instalar una aplicación:

```bash
cpak doctor
cpak doctor --json
```

El informe cubre los espacios de nombres de usuario, los desarraigados OverlayFS, `mount_setattr`, seccomp, Landlock, los drivers delegados cgroup v2, el acceso a pantalla y audio, y el puente de comando del host controlado. Una advertencia explica que falta un layer de refuerzo opcional o un driver de recursos. Una capacidad requerida fallida impide que se inicie la path de ejecución afectada.

> [!NOTE] Soporte de host
> Landlock y los cgroups delegados dependen del kernel y del administrador de sesiones. `cpak doctor` informa si cada función está activa.

## Ubicaciones de datos

cpak sigue la convención del directorio base XDG. Su almacén local contiene registros de paquetes, layers OCI dirigidas al contenido, estado de la aplicación grabable, entradas de escritorio exportadas, registros y overrides de usuarios.

Configure la variable de entorno XDG correspondiente antes de ejecutar cpak si necesita una ubicación no predeterminada. Mantenga juntos la base de datos y los directorios de layers cuando mueva una Store. Las referencias registradas en la base de datos se utilizan para auditoría, recolección de basura y reversión.

## Integración de escritorio

Los paquetes pueden exportar binarios y archivos `.desktop` declarados en su manifest. cpak escribe las entradas de cara al usuario debajo del directorio de datos de usuario estándar, para que los lanzadores puedan descubrirlas sin una instalación raíz.

Ejecute una aplicación instalada desde su entrada del escritorio o con `cpak run`. Ambas paths utilizan el mismo estado de paquete, permisos y complementos habilitados.

## Actualización cpak

Verifique e instale un release cpak más reciente:

```bash
cpak self-update --check
cpak self-update
cpak doctor
cpak audit
```

En una computadora de escritorio, cpak verifica una vez al día mientras se ejecuta otro comando. GNOME usa Zenity cuando está instalado, KDE usa KDialog y otras sesiones usan el cuadro de diálogo integrado cpak. Ambos recursos de runtime se descargan de la release oficial, se comparan con `SHA256SUMS`, se escriben junto a los archivos binarios actuales y se instalan con cambios de nombre atómicos. Las aplicaciones que ya se están ejecutando continúan utilizando sus procesos existentes.

La primera actualización que introduce un diseño de almacenamiento más nuevo prepara los layers instaladas antes de que se inicie la siguiente aplicación. La operación es atómica y reanudable. Los inicios de escritorio muestran un cuadro de diálogo de progreso cuando la preparación lleva más de 400 milisegundos; Los inicios de terminales informan el progreso en la terminal.

Un paquete de distribución puede desactivar el reemplazo binario en el momento de la build. cpak todavía informa que existe un release más nueva y le dice al usuario que la solicite al mantenedor del paquete. Lea [cpak actualizaciones de runtime](/docs/runtime-updates) para conocer la configuración del empaquetador y la selección del backend del escritorio.

## Quitar cpak

Los datos de la aplicación permanecen en el almacén local después de eliminar los archivos binarios del runtime. Elimine los paquetes no deseados y ejecute la recolección de basura antes de eliminar la Store. Al eliminar la Store, se descartan todos los paquetes instalados y su estado de escritura.

```bash
cpak list
cpak remove github.com/containerpak/example
cpak gc --apply
```
