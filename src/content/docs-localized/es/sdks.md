---
title: SDK y herramientas de desarrollo
description: Empaquete toolchains de lenguaje como complementos de editor opcionales.
tags: [sdk, addons, development]
section: packages
order: 60
---
# SDK y herramientas de desarrollo

cpak modela los SDK como paquetes complementarios. Un editor declara los orígenes del SDK que admite y luego cada usuario habilita solo las toolchains que necesita ese editor.

## Habilitar un SDK oficial

Instale el editor y los paquetes SDK, luego habilite el complemento:

```bash
cpak install github.com/containerpak/vscode
cpak install github.com/containerpak/sdk-go
cpak addon enable github.com/containerpak/vscode github.com/containerpak/sdk-go
```

Los paquetes SDK oficiales actuales incluyen Go y Node LTS. Exportan sus paths de comando normales, incluidos los enlaces de compatibilidad utilizados por las herramientas que esperan `/usr/bin` o `/usr/local/bin`.

```bash
cpak install github.com/containerpak/sdk-node-lts
cpak addon enable github.com/containerpak/vscode github.com/containerpak/sdk-node-lts
```

Ejecute VS Code hasta cpak después de cambiar la selección del complemento. Su terminal integrado y sus extensiones ven los binarios del SDK habilitados en el mismo entorno de paquete.

## Crear un paquete SDK

Un SDK es un paquete manifest v2. Su imagen contiene la toolchain, mientras que el estado del editor permanece en la aplicación principal. Declare todos los comandos que otras herramientas puedan llamar:

```json
{
  "$schema": "https://raw.githubusercontent.com/Containerpak/cpak/v2/schema/manifest-v2.json",
  "manifest_version": "2.0",
  "name": "Example SDK",
  "description": "Example language tools for cpak development environments.",
  "version": "1.0.0",
  "image": "ghcr.io/example/sdk-example:main",
  "binaries": ["/usr/local/bin/example", "/usr/local/bin/examplefmt"],
  "desktop_entries": [],
  "dependencies": [],
  "addons": [],
  "addon_provider": {
    "id": "example",
    "slot": "sdk.example",
    "mode": "exclusive",
    "exports": {
      "path": ["/usr/local/bin"]
    }
  },
  "idle_time": 0,
  "override": {
    "filesystem": [{ "path": "home", "access": "read-write" }],
    "network": true
  }
}
```

La ranura del provider permite a un editor descubrir un SDK instalado sin codificar el diseño del filesystem. Utilice `exclusive` para releases alternativas de una toolchain y `multiple` cuando los providers deban coexistir. Exporte paths binarias, de biblioteca, de inclusión, de pkg-config y de CMake no estándar en lugar de copiar enlaces de compatibilidad al padre.

El conjunto de permisos del padre sigue teniendo autoridad después de montar el SDK. El manifest del SDK describe su comportamiento independiente y su superficie de validación.

## Probar un SDK

Verifique el paquete por sí mismo:

```bash
cpak test cpak.json --binary /usr/local/bin/example -- --version
```

Luego pruébelo como un complemento habilitado en cada editor compatible. Abra un shell de inicio de sesión y un shell sin inicio de sesión, porque los editores y las tareas de build no siempre inicializan el mismo entorno.

Para un SDK de lenguaje, compile y ejecute un proyecto mínimo. Cubre importaciones, compiladores, subprocesos y paths de salida además del comando de release.

## Actualizaciones de release

Actualice la imagen, la release del manifest, la documentación y las comprobaciones de CI juntas. Publicar todas las arquitecturas anunciadas. Mantenga una tag inmutable o un resumen disponible el tiempo suficiente para bloquear archivos y revertir registros para resolver el contenido probado.