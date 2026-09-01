---
title: Repositorios privados de GitHub y registros OCI
description: Vincule credenciales de origen e imagen a un solo origen de paquete sin importar la configuración del motor de contenedores.
tags: [registry, authentication, security]
section: operations
order: 25
---
# Repositorios privados de GitHub y registros OCI

El acceso al código fuente del paquete y a la imagen OCI usa credenciales separadas. Un repositorio privado de GitHub necesita una solicitud autenticada para leer `cpak.json`. Una imagen privada necesita autenticación con el registro. cpak vincula ambas formas a un origen de paquete exacto.

## Repositorios privados de GitHub

Use la sesión actual de GitHub CLI cuando `cpak.json` se encuentre en un repositorio privado:

```bash
cpak auth login github.com/example/private-app --github
```

cpak lee el token guardado por `gh auth`. Si no existe una sesión de GitHub y el comando es interactivo, inicia `gh auth login` en el navegador con scopes de repositorio y lectura de paquetes. La credencial de origen solo se acepta para el origen exacto `github.com/owner/repository`.

Cuando ese manifest privado apunta a GHCR, la misma credencial de GitHub también se vincula al repositorio OCI exacto de la referencia de imagen. Una imagen alojada en otro registro sigue necesitando un inicio de sesión separado.

`--github` no se puede combinar con `--username`, `--token` ni `--token-host`.

## Registros privados OCI

### Almacenar una credencial de registro

La autenticación básica utiliza un nombre de usuario y una contraseña:

```bash
cpak auth login github.com/example/private-app --username account
```

La autenticación de token omite el nombre de usuario:

```bash
cpak auth login github.com/example/private-app --token
```

Para GHCR, pase el nombre de usuario de GitHub con `--username` e introduzca un personal access token como contraseña. El flag `--token` sirve para un bearer token emitido por el registro y no se puede combinar con un nombre de usuario.

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

El mismo archivo puede proporcionar un token de GitHub para el origen privado:

```bash
cpak auth login github.com/example/private-app --github --secret-file token.txt
```

cpak almacena la path absoluta del archivo en el enlace y lee el secreto de ese archivo para cada solicitud de registro. Los metadatos vinculantes contienen solo la path. Mantenga el archivo en esa path con el mismo propietario y modo. `cpak auth logout` elimina el enlace y deja intacto el archivo propiedad del usuario.

Un runtime automatizado puede inyectar `CPAK_REGISTRY_AUTH_FILE`. El archivo JSON debe ser propiedad del usuario actual y tener el modo `0600`:

```json
{
  "records": [
    {
      "origin": "github.com/example/private-app",
      "source_host": "github.com",
      "registry": "ghcr.io",
      "repository": "example/private-app",
      "username": "account",
      "password": "TOKEN"
    }
  ]
}
```

Omita `registry`, `repository` y `username` cuando el token solo sirva para el origen privado de GitHub. La autenticación bearer del registro usa `access_token` en lugar de `username` y `password`. Se rechaza un registro que combine ambas formas.

## Servicios de tokens

cpak acepta desafíos de registro básico y de portador. Las credenciales se envían al host de registro de forma predeterminada. Un registro que utiliza un host de token independiente requiere una entrada explícita en la lista de permitidos:

```bash
cpak auth login github.com/example/private-app \
  --username account \
  --token-host auth.example.com
```

Los puntos finales de token deben utilizar HTTPS, excepto los registros de bucle invertido que se utilizan para el desarrollo local. Los redireccionamientos no pueden llevar credenciales a otro host. Los tokens obtenidos a través de una verificación de registro permanecen en la memoria hasta su breve vencimiento.
