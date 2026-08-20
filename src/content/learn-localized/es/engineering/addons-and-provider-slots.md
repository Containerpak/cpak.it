La composición parte de una pregunta: ¿el package principal necesita este package o puede funcionar sin él? Los packages necesarios son dependencias. Las capacidades opcionales son addons.

## Elegir la relación de runtime

Una dependencia anidada conserva su sandbox y expone únicamente los comandos declarados. Una dependencia de layer aporta archivos directamente al root del package principal. Un addon se instala y se compone solo cuando la persona usuaria lo habilita para ese principal.

Los layers de addon siguen el orden del manifest principal. Cuando dos packages ofrecen el mismo path, gana el layer posterior. El addon no puede ampliar los permisos del host del principal, y los permisos de su propio manifest solo importan cuando se ejecuta por separado.

## Un provider indica qué capacidad aporta

```
"addon_provider": {
  "id": "go",
  "slot": "sdk.go",
  "mode": "exclusive",
  "exports": {
    "path": ["/opt/go/bin"],
    "include_path": ["/opt/go/include"]
  }
}
```

El slot nombra la capacidad, no el repositorio del package. El ID del provider identifica una implementación dentro de ese slot. Los exports añaden paths de herramientas, librerías, includes, pkg-config y CMake sin asumir que todos los SDK se instalan bajo `/usr`.

## Los slots exclusive y multiple resuelven casos distintos

Un slot `exclusive` activa un solo provider. Una persona desarrolladora puede instalar Go y TinyGo y seleccionar cuál aporta `sdk.go` a un editor. Un slot `multiple` activa todos los providers habilitados, lo que encaja con herramientas de compatibilidad de Steam como GE-Proton y ProtoSoda.

```
cpak addon slots github.com/containerpak/vscode
cpak addon providers github.com/containerpak/vscode sdk.go
cpak addon use github.com/containerpak/vscode sdk.go go
```

La selección se guarda para la aplicación principal. Instalar un provider nuevo no sustituye de forma silenciosa una selección explícita. Retirar un provider activo borra o rechaza la selección según el contrato del slot.

## La detección se mantiene local

cpak evalúa los providers de addons instalados que admite el package principal. El Store no declara un ganador global. Así se mantienen orígenes de packages descentralizados y se ofrecen a las aplicaciones nombres de capacidad estables.

[Dependencias y addons](/docs/dependencies-addons) documenta la composición de packages y las pruebas con estados habilitado y deshabilitado.
