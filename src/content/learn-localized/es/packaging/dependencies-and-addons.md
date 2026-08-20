Un segundo package puede unirse a una aplicación de tres formas. La elección depende de si es obligatorio y de si sus archivos deben compartir el root del package principal.

## Dependencia anidada

Use el modo anidado predeterminado para una herramienta necesaria que debe conservar su propio sandbox. El package principal solo invoca comandos exportados y el package anidado recibe la intersección de ambos límites de permisos. Bottles utiliza esta relación para UMU.

## Dependencia de layer

Use `mode: layer` cuando los archivos necesarios deben aparecer directamente dentro del filesystem del package principal. Esos layers se componen por debajo de la aplicación. Es una relación de filesystem, por lo que la dependencia no se convierte en un servicio independiente.

## Addon opcional

Use un addon cuando el package principal funciona sin él y la persona usuaria debe poder decidir. El addon se instala en su primer uso y sus layers se unen al principal solo mientras esté habilitado para esa aplicación.

```
cpak addon enable github.com/example/editor github.com/example/sdk-go
cpak addon disable github.com/example/editor github.com/example/sdk-go
```

Coloque los archivos aportados donde los espera el package principal o declare un provider de addon con exports explícitos de path, librería, include, pkg-config y CMake. Pruebe los estados habilitado y deshabilitado. El package principal debe seguir iniciando después de retirar el addon.

[Dependencias y addons](/docs/dependencies-addons) incluye ejemplos con Steam y SDK.
