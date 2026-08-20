---
title: Dependencias y complementos
description: Conecte los paquetes necesarios y complementos opcionales por aplicación.
tags: [dependencies, addons, composition]
section: packages
order: 50
---
# Dependencias y complementos

Un cpak puede requerir otro paquete u ofrecerlo como complemento opcional. Ambos mantienen el componente en su propio repositorio e imagen OCI, pero tienen diferentes ciclos de vida y contratos de runtime.

## Dependencias requeridas

Las dependencias se instalan con el padre. El modo predeterminado es `nested`, que mantiene la dependencia en su propia zona de pruebas y permite que el padre invoque solo los archivos binarios exportados por ese paquete.

```json
"dependencies": [
  {
    "origin": "github.com/containerpak/umu"
  }
]
```

El proceso anidado recibe la intersección de los permisos principal y de dependencia. No puede adquirir acceso de host que el padre no tenga.

También se requiere una dependencia con `"mode": "layer"`, pero los layers de su filesystem se componen debajo de la imagen principal. Utilice este modo cuando el padre deba ver los archivos de dependencia directamente en su propio runtime.

Una dependencia puede seleccionar un branch, liberar o confirmar. `cpak lock` resuelve el gráfico completo y registra resúmenes de imágenes inmutables.

### Botellas y UMU

Bottles declara UMU como una dependencia anidada. La integración de UMU necesita el iniciador de UMU, por lo que cpak lo instala con Bottles y expone su comando declarado a través del intermediario de paquetes anidado.

Nada cambia para los usuarios de Bottles cuando se introducen complementos opcionales en otros lugares. UMU sigue siendo obligatorio, comienza en su propio entorno cpak y sigue el contrato de permiso compartido con Bottles.

## Complementos opcionales

Un complemento aporta layers a un padre compatible. El padre sigue siendo utilizable sin él.

```json
"addons": [
  "github.com/containerpak/sdk-go",
  "github.com/containerpak/sdk-node-lts"
]
```

Un complemento sin metadatos del provider utiliza una opción explícita de activación o desactivación. Un complemento de provider está disponible tan pronto como se instala y el padre enumera su origen. El próximo inicio compone las dependencias de layer requeridas, el padre y los providers activos en orden manifest.

Al deshabilitar un complemento se eliminan sus layers de la siguiente vista de runtime. No reescribe la imagen principal ni copia archivos en el directorio de datos de la aplicación. Un complemento instalado puede servir a varios padres mientras cada uno mantiene su propia selección.

## Espacios para providers

Un provider le dice a cpak qué capacidad proporciona un complemento. La ranura agrupa paquetes que pueden cumplir la misma función, mientras que el modo controla cuántos pueden estar activos.

```json
"addon_provider": {
  "id": "jdk25",
  "slot": "sdk.java",
  "mode": "exclusive",
  "exports": {
    "path": ["/opt/jdk/bin"],
    "library_path": ["/opt/jdk/lib"],
    "include_path": ["/opt/jdk/include"],
    "pkg_config_path": ["/opt/jdk/lib/pkgconfig"],
    "cmake_prefix_path": ["/opt/jdk"],
    "environment": ["JAVA_HOME=/opt/jdk"]
  }
}
```

Una ranura `exclusive` activa un provider. El primer provider disponible es el predeterminado hasta que el usuario selecciona otro. Una ranura `multiple` activa todos los providers instalados, que se adaptan a colecciones como las herramientas de compatibilidad de Steam. Los providers en un espacio deben usar el mismo modo.

Las paths de exportación son paths absolutas dentro del paquete compuesto. cpak los antepone a `PATH`, `LD_LIBRARY_PATH`, `LIBRARY_PATH`, `CPATH`, `PKG_CONFIG_PATH` y `CMAKE_PREFIX_PATH` según corresponda. Las entradas en `environment` establecen pares `NAME=value` explícitos después de la composición de la path.

## Administrar complementos

Enumere los complementos compatibles con un paquete instalado:

```bash
cpak addon list github.com/containerpak/vscode
cpak addon list --json github.com/containerpak/vscode
```

Inspeccionar las tragamonedas y sus providers instalados:

```bash
cpak addon slots github.com/containerpak/vscode
cpak addon providers github.com/containerpak/vscode
cpak addon providers github.com/containerpak/vscode sdk.go
```

Elija un provider para un espacio exclusivo por ID de provider u origen:

```bash
cpak addon use github.com/containerpak/vscode sdk.go tinygo
```

Habilite o deshabilite un complemento para ese paquete:

```bash
cpak addon enable github.com/containerpak/vscode github.com/containerpak/sdk-go
cpak addon disable github.com/containerpak/vscode github.com/containerpak/sdk-go
```

El manifest del paquete registra las combinaciones que admite su editor. Un usuario aún puede agregar otro paquete deliberadamente, siendo responsable de esa combinación local:

```bash
cpak addon enable --anyway github.com/example/editor github.com/example/sdk
```

`addon list` informa si cada opción está instalada y habilitada. Al habilitar un complemento, se instala cuando es necesario. Deshabilitarlo mantiene el paquete independiente solo cuando otro padre todavía lo usa. cpak también evita la eliminación mientras está habilitado para un padre instalado.

Los complementos mantienen sus propias releases y actualizan su ciclo de vida. Un complemento actualizado se vuelve visible la próxima vez que se inicia su padre.

## Ejemplo de vapor

Steam admite herramientas de rendimiento y builds de compatibilidad como complementos opcionales:

```json
"addons": [
  "github.com/containerpak/gamemode",
  "github.com/containerpak/gamescope",
  "github.com/containerpak/mangohud",
  "github.com/containerpak/proton-ge",
  "github.com/containerpak/protosoda"
]
```

Los usuarios pueden habilitar solo las herramientas que deseen:

```bash
cpak addon enable github.com/containerpak/steam github.com/containerpak/mangohud
cpak addon enable github.com/containerpak/steam github.com/containerpak/protosoda
```

MangoHud, Gamescope y GameMode agregan comandos, bibliotecas y metadatos de runtime al filesystem Steam compuesto. Funcionan con las opciones de inicio que Steam ya usa:

```text
mangohud %command%
gamescope -- %command%
gamemoderun %command%
```

GE-Proton y ProtoSoda instalan sus directorios de herramientas de compatibilidad en el filesystem compuesto. Steam los descubre a través de `STEAM_EXTRA_COMPAT_TOOLS_PATHS`, por lo que las builds habilitadas aparecen en su selector de compatibilidad sin ser copiadas en el directorio de datos de Steam.

### Pasar complementos al recipiente a presión

Steam inicia los juegos dentro del recipiente a presión de Valve, que reemplaza `/usr` con el runtime de Steam seleccionado. El paquete Steam une su raíz cpak compuesta con ese runtime anidado:

```sh
export PATH="$CPAK_ROOTFS/usr/bin:$CPAK_ROOTFS/usr/games:$PATH"
export STEAM_EXTRA_COMPAT_TOOLS_PATHS="$CPAK_ROOTFS/usr/share/steam/compatibilitytools.d"
export VK_ADD_LAYER_PATH="$CPAK_ROOTFS/usr/share/vulkan/implicit_layer.d"
export PRESSURE_VESSEL_FILESYSTEMS_RO="$CPAK_ROOTFS/usr"
```

`CPAK_ROOTFS` identifica la raíz compuesta activa. La mayoría de las aplicaciones no necesitan este puente. Es necesario cuando un padre inicia otro container o runtime que oculta las paths proporcionadas por sus complementos.

## Empaquetando un complemento

Un complemento es un paquete cpak normal con su propio Git origen, manifest, imagen e historial de releases. El padre enumera los orígenes de complementos admitidos en `cpak.json`; el complemento posee todos los archivos que aporta. Agregue `addon_provider` cuando cpak debería descubrir el paquete automáticamente o exponer paths de ejecución no estándar.

Coloque los archivos donde los padres ya esperan encontrarlos. Los comandos pueden usar `/usr/bin`, las bibliotecas pueden usar los directorios de bibliotecas de la plataforma y los complementos pueden usar una path específica para padres. Si el descubrimiento necesita una variable de entorno, defínala en el paquete principal para que se resuelva en `CPAK_ROOTFS` cuando sea necesario.

Mantenga las paths de los complementos separadas siempre que sea posible. Los complementos activos siguen el orden en el manifest principal y un layer posterior gana cuando dos paquetes proporcionan la misma path.

Utilice la misma familia de plataformas mantenida que la principal cuando se ajuste al paquete. Los layers OCI iguales se almacenan una vez mediante resumen, por lo que una base compartida no agrega otra copia al almacén local.

Un complemento utiliza los permisos de host efectivos del padre mientras está montado en ese padre. Los permisos en el manifest del complemento se aplican cuando el complemento se ejecuta por sí solo; no pueden ampliar la política principal.

Pruebe ambos estados antes de publicar:

```bash
cpak addon enable github.com/example/parent github.com/example/addon
cpak run github.com/example/parent parent-command
cpak addon disable github.com/example/parent github.com/example/addon
cpak run github.com/example/parent parent-command
```

La prueba habilitada debe demostrar que el padre descubre los archivos aportados. La prueba deshabilitada debe demostrar que el padre aún inicia y el complemento está ausente.

## Elegir la relación

Utilice una dependencia anidada para una herramienta requerida que debe mantener su propia zona de pruebas. Utilice una dependencia de layer para los archivos requeridos que deben aparecer dentro del filesystem principal. Utilice un complemento cuando el padre trabaje sin él y el usuario deba controlar la selección.