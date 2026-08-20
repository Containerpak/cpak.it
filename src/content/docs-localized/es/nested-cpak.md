---
title: Anidado cpak
description: Declare y ejecute una dependencia cpak como un servicio controlado dentro de otro paquete.
tags: [nested, dependencies, runtime]
section: runtime
order: 40
---
# Anidado cpak

Nested cpak permite que una aplicación ejecute una dependencia declarada en un entorno de paquete separado. El padre posee su interfaz y su estado, mientras que la dependencia proporciona su runtime y sus archivos binarios.

## Declarar la dependencia

Agregue el paquete anidado como una dependencia manifiesta:

```json
"dependencies": [
  {
    "origin": "github.com/containerpak/umu",
    "branch": "main"
  }
]
```

cpak instala la dependencia con el padre y la registra en el gráfico del paquete. Los layers compartidas permanecen deduplicadas en el almacén local.

## Solicitar ejecución

El paquete principal envía una solicitud anidada estructurada al servicio cpak. El runtime del host resuelve la dependencia instalada, aplica su manifest, inicia o reutiliza la instancia solicitada y devuelve el resultado a través del protocolo privado.

El padre recibe una path de solicitud cuyo ámbito es su dependencia declarada. La base de datos del host cpak y el socket de control permanecen fuera del entorno principal.

## Archivos y estado

El paquete anidado tiene sus propias layers inmutables y estado de escritura. Las paths compartidas explícitas pueden conectar el workflow principal a la dependencia cuando ambos manifests lo permitan.

Mantenga los archivos propiedad de la aplicación en el nivel principal a menos que el runtime anidado sea su propietario natural. Esto evita que una actualización o reemplazo de la dependencia se lleve consigo datos principales no relacionados.

## Permisos

El paquete anidado utiliza la intersección de su manifest, las overrides del usuario y el límite de permiso principal. El acceso de los padres sigue estando limitado por su propia política efectiva.

## Ciclo de vida y registros

Las instancias anidadas utilizan el supervisor cpak. Su salida está disponible a través de registros cpak y utilizan el mismo ciclo de vida de la instancia. Los errores principales deben incluir el origen del paquete anidado y la solicitud fallida.

## Probar la integración

Pruebe primero la dependencia como independiente cpak. Luego pruebe el workflow principal completo hasta cpak, incluida la primera instalación, el inicio repetido, la actualización, la reversión y la limpieza.

Valide la carga de trabajo anidada completa después de verificar el descubrimiento binario. Un paquete que gestiona un runtime debe crear su estado e iniciar una aplicación representativa a través de la dependencia.