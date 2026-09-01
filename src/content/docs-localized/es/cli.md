---
title: Referencia CLI
description: Los comandos v2 actuales para paquetes, instancias, desarrollo, almacenamiento e integración de sistemas.
tags: [cli, reference]
section: operations
order: 10
---

# referencia CLI

Ejecute `cpak <command> --help` para los indicadores aceptados por la build instalada. Las tablas siguientes describen la superficie de comando v2 actual.

## Ciclo de vida del paquete

| Dominio    | Objetivo                                                              |
| ---------- | --------------------------------------------------------------------- |
| `install`  | Instale un paquete desde un origen Git.                               |
| `run`      | Instale cuando sea necesario, inicie el entorno y ejecute un binario. |
| `list`     | Listar los paquetes instalados. Acepta `--json`.                      |
| `update`   | Actualice un paquete o cada paquete instalado.                        |
| `rollback` | Restaura la release instalada anteriormente.                          |
| `remove`   | Elimine un paquete instalado y sus propios recursos de ejecución.     |
| `extract`  | Exporte un paquete resuelto como un archivo tar.                      |
| `alias`    | Establezca, elimine o enumere alias de origen local.                  |

Instale, ejecute, elimine, detenga y acepte selectores de branch, liberación o commit cuando corresponda.

## Instancias en ejecución

| Dominio       | Objetivo                                                                       |
| ------------- | ------------------------------------------------------------------------------ |
| `launch`      | Inicie un comando en el entorno del paquete activo.                            |
| `shell`       | Abra un shell interactivo en una instancia de paquete.                         |
| `logs`        | Imprima o siga la salida de la instancia.                                      |
| `stop`        | Detener una instancia en ejecución.                                            |
| `service`     | Inicie el servicio local cpak.                                                 |
| `orchestrate` | Inicie varias aplicaciones con pedidos, comprobaciones de estado y reintentos. |

Utilice `--instance` en los comandos admitidos para seleccionar una instancia con nombre del mismo paquete.

## Desarrollo de paquetes

| Dominio            | Objetivo                                                    |
| ------------------ | ----------------------------------------------------------- |
| `init`             | Genera un esqueleto de manifest v3.                         |
| `validate`         | Validar `cpak.json`.                                        |
| `gen-schema`       | Escriba el esquema generado por el runtime actual.          |
| `migrate-manifest` | Convierta un manifest v1 a v2.                              |
| `lock`             | Resuelva manifests e imágenes OCI en `cpak.lock.json`.      |
| `test`             | Instale y verifique un paquete local en una Store temporal. |
| `dev`              | Pruebe un paquete local y ejecute su binario seleccionado.  |

`test` y `dev` aceptan `--origin` para dependencias relativas y `--lock` para un archivo de bloqueo explícito.

## Composición y política

| Dominio    | Objetivo                                                                         |
| ---------- | -------------------------------------------------------------------------------- |
| `addon`    | Inspeccione complementos y ranuras, seleccione providers o cambie la activación. |
| `override` | Reemplace un valor de permiso local.                                             |
| `grant`    | Enumere, administre o revoque concesiones de archivos persistentes.              |
| `doctor`   | Informar sobre las capacidades de ejecución del host.                            |
| `audit`    | Verifique la integridad de la Store local y, opcionalmente, repárela.            |

Utilice `cpak addon slots` y `cpak addon providers` para inspeccionar el estado del provider, luego `cpak addon use` para seleccionar un provider exclusivo. `enable` y `disable` permanecen disponibles para opciones de complementos explícitas. La salida JSON está disponible para `list`, `slots` y `providers`.

`cpak update --non-interactive` rechaza actualizaciones que solicitan permisos adicionales. JSON la salida está disponible para actualización, lista, médico, lista de alias y recolección de basura donde se muestra en la ayuda del comando.

## Almacenamiento

| Dominio | Objetivo                                                     |
| ------- | ------------------------------------------------------------ |
| `dedup` | Deduplicar archivos iguales debajo de una path seleccionada. |
| `gc`    | Informar o eliminar layers sin referencia y datos de caché.  |

Ejecute `cpak gc --json` antes de `cpak gc --apply` cuando automatice la limpieza.

## Acceso al registro y al runtime

| Dominio       | Objetivo                                                                   |
| ------------- | -------------------------------------------------------------------------- |
| `auth`        | Vincula el acceso al registro a un origen de paquete y al repositorio OCI. |
| `self-update` | Busque o instale un binario cpak oficial más nuevo.                        |

Utilice `cpak auth login`, `logout`, `list` o `status` para administrar el acceso privado al paquete. Lea [Repositorios privados de GitHub y registros OCI](/docs/registry-authentication) antes de agregar un host de token independiente.

`cpak self-update --check` informa un release disponible y deja el binario instalado sin cambios. Las builds del administrador de paquetes mantienen el aviso de release y delegan el reemplazo al administrador de paquetes del sistema. Consulte [Actualizar el runtime cpak](/docs/runtime-updates).
