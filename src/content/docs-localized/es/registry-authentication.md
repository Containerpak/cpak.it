---
title: Registros privados OCI
description: Vincule una credencial de registro a un origen y repositorio de paquete sin importar la configuración del motor de container.
tags: [registry, authentication, security]
section: operations
order: 25
---
# Registros privados OCI

cpak extrae imágenes públicas OCI de forma anónima. Un paquete cuyo manifest apunta a un repositorio privado necesita un enlace de credenciales explícito.

## Almacenar una credencial

La autenticación básica utiliza un nombre de usuario y una contraseña:

```bash
cpak auth login github.com/example/private-app --username account
```

La autenticación de token omite el nombre de usuario:

```bash
cpak auth login github.com/example/private-app --token
```

El comando de inicio de sesión lee el manifest del paquete, analiza su referencia de imagen y vincula la credencial a los tres valores siguientes:

- origen del paquete
- host de registro
- OCI path del repositorio

La credencial no puede autenticar otro origen de paquete ni otro repositorio en el mismo registro. El elemento del Servicio Secreto también vincula el nombre de usuario y cada host de token aprobado, por lo que la edición de metadatos públicos no puede reorientar un secreto existente.

## Almacenamiento de escritorio

El inicio de sesión interactivo almacena el secreto a través de la API D-Bus del Servicio Secreto de escritorio. Los metadatos de enlace público se escriben en el directorio de configuración cpak con el modo `0600`. Las contraseñas y tokens no se escriben en ese archivo.

cpak habla directamente con el Servicio Secreto y mantiene los enlaces de credenciales separados de Docker, Podman, Buildah y la configuración del asistente de credenciales del container.

Enumere las vinculaciones o inspeccione un origen:

```bash
cpak auth list
cpak auth status github.com/example/private-app
```

Eliminar un origen y su secreto almacenado:

```bash
cpak auth logout github.com/example/private-app
```

## Sistemas sin cabeza

Lea el secreto de un archivo normal propiedad del usuario con el modo `0600`:

```bash
install -m 0600 /dev/null token.txt
cpak auth login github.com/example/private-app --token --secret-file token.txt
```

cpak almacena la path absoluta del archivo en el enlace y lee el secreto de ese archivo para cada solicitud de registro. Los metadatos vinculantes contienen solo la path. Mantenga el archivo en esa path con el mismo propietario y modo. `cpak auth logout` elimina el enlace y deja intacto el archivo propiedad del usuario.

Un runtime automatizado puede inyectar `CPAK_REGISTRY_AUTH_FILE`. El archivo JSON debe ser propiedad del usuario actual y tener el modo `0600`:

```json
{
  "records": [
    {
      "origin": "github.com/example/private-app",
      "registry": "ghcr.io",
      "repository": "example/private-app",
      "access_token": "TOKEN"
    }
  ]
}
```

La autenticación básica utiliza `username` y `password` en lugar de `access_token`. Se rechaza un registro que combine ambas formas.

## Servicios de tokens

cpak acepta desafíos de registro básico y de portador. Las credenciales se envían al host de registro de forma predeterminada. Un registro que utiliza un host de token independiente requiere una entrada explícita en la lista de permitidos:

```bash
cpak auth login github.com/example/private-app \
  --username account \
  --token-host auth.example.com
```

Los puntos finales de token deben utilizar HTTPS, excepto los registros de bucle invertido que se utilizan para el desarrollo local. Los redireccionamientos no pueden llevar credenciales a otro host. Los tokens obtenidos a través de una verificación de registro permanecen en la memoria hasta su breve vencimiento.