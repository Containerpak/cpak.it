---
title: Compatibilidad de host
description: Linux, arquitectura, kernel, filesystem, escritorio, inicio y GPU requisitos para el runtime v2.
tags: [host, compatibility, requirements]
section: start
order: 40
---
# Compatibilidad de host

cpak se ejecuta en Linux y utiliza las instalaciones del kernel directamente. El binario de runtime estático se publica para `amd64` y `arm64`. El soporte de la arquitectura de la aplicación también depende de la imagen OCI publicada por cada paquete.

## Capacidades de host requeridas

`cpak doctor` es la verificación autorizada para la máquina actual. El runtime de una aplicación que funcione necesita espacios de nombres de usuario sin privilegios, OverlayFS rootless y las operaciones de montaje utilizadas para ensamblar la vista del paquete.

```bash
cpak doctor
cpak doctor --json
```

El informe JSON separa las comprobaciones requeridas de las funciones de recursos y refuerzo opcionales. Su estado de salida coincide con el campo `ready`.

## Cobertura de distribución

El workflow de portabilidad verifica que el binario estático cpak se ejecute y genere su esquema en imágenes de espacio de usuario de Debian 13, Fedora 42, Arch Linux, openSUSE Tumbleweed y Ubuntu 26.04.

Las pruebas de integración del kernel se ejecutan en varias generaciones de ejecutores de Ubuntu GitHub. Valide el escritorio de destino, el filesystem, GPU y la combinación de inicio con `cpak doctor` y una prueba de humo de la aplicación.

## Sistemas de archivos

La Store de cpak necesita un filesystem local que admita FVS y OverlayFS rootless. El uso compartido de bloques definidos por contenido funciona en todos los sistemas de archivos locales compatibles. Los checkouts de layers nativas prefieren enlaces de referencia, luego enlaces físicos y luego archivos independientes.

Los sistemas de archivos de red, los montajes FUSE existentes y las configuraciones de espacios de nombres de usuario restringidos pueden fallar la verificación del runtime. Mantenga la Store en un filesystem Linux local para obtener la más amplia compatibilidad. La path de ejecución preparada utiliza directorios nativos y OverlayFS rootless.

## Sesiones de escritorio

cpak puede exponer audio, accesibilidad, impresión y dispositivos seleccionados compatibles con Wayland, X11, PulseAudio. El manifest de la aplicación debe habilitar el recurso coincidente y ese recurso debe existir en la sesión del usuario.

Los paquetes sin cabeza pueden omitir los sockets de escritorio. Pruebe los paquetes de escritorio en cada path de visualización que declaren.

## inicio y cgrupos

cpak se ejecuta bajo el administrador de servicios de usuario del host. La sesión del usuario debe proporcionar los directorios y sockets de runtime necesarios.

Los límites de memoria, CPU y de proceso requieren drivers delegados cgroup v2. Las aplicaciones solicitan estos drivers solo cuando su manifest define un límite. cpak rechaza un límite solicitado cuando el host no puede aplicarlo.

## Funciones de seguridad

Seccomp es requerido por la política de runtime. Landlock agrega restricciones de path en los núcleos que admiten el ABI requerido. `cpak doctor` informa Landlock como no disponible cuando el host no puede aplicarlo.

## GPU soporte

Los dispositivos DRI cubren pilas de gráficos comunes basadas en Mesa. NVIDIA el soporte resuelve los archivos del driver del espacio de usuario del host en el inicio. Pruebe la transferencia del driver en el hardware de destino y la release del driver del host.

> [!NOTE] Lanzamiento experimental > cpak v2 se lanza como una opción de distribución experimental. El informe de compatibilidad le indica lo que el runtime puede demostrar localmente; La cobertura de hardware específica del paquete está documentada en cada paquete.