---
title: Publicar en la Store
description: Prepare un paquete para el catálogo oficial y agregue los metadatos y medios revisados.
tags: [store, publishing, catalog]
section: packages
order: 80
---
# Publicar en la Store

La Tienda es un layer de descubrimiento. Los paquetes también se pueden instalar directamente desde un origen Git válido.

## Preparar el origen del paquete.

Antes del envío del catálogo, el repositorio de paquetes debe contener:

- un archivo de manifest v2 válido en `cpak.json`
- una imagen OCI publicada para cada arquitectura anunciada
- un README conciso con comandos de instalación y prueba
- un workflow de CI que crea la imagen y verifica sus archivos binarios exportados
- una prueba cpak real de la path de la aplicación principal

Ejecute el flujo de validación del paquete con la referencia del repositorio público antes del envío.

El repositorio `README.md` pertenece a mantenedores y contribuyentes. Agregue un `STORE-README.md` opcional cuando los usuarios necesiten instrucciones específicas del paquete, como configuración de cuenta, acceso al registro, términos de licencia, una primera descarga grande o comportamiento de primera ejecución. La Tienda muestra este archivo en la página de la aplicación solo cuando su entrada de catálogo está fijada con `release` y lo lee desde esa tag de release exacta. Nunca lee `STORE-README.md` de `main`.

## Preparar medios del catálogo

La Store oficial mantiene los metadatos de descubrimiento en [Containerpak/store](https://github.com/Containerpak/store). Cada directorio de aplicaciones incluye un catálogo `manifest.json` y un ícono de aplicación original llamado `icon.svg`. Las capturas de pantalla utilizan archivos WebP numerados y un `showcase.webm` opcional puede demostrar la aplicación.

Utilice ilustraciones originales del proyecto. No invente un icono de reemplazo para una aplicación anterior. Preservar sus requisitos de licencia y atribución.

## Elige una categoría

Coloque la entrada del catálogo debajo de la categoría coincidente y la path de origen. La path de origen sigue la dirección del repositorio para que siga siendo única e inspeccionable.

```text
Graphics/
  github/
    com/
      example/
        editor/
          manifest.json
          icon.svg
          screenshot-1.webp
```

No edite manualmente los índices de catálogos generados. El workflow de validación de la Store los reconstruye y los verifica a partir de las entradas de origen.

## Revisar los permisos del paquete

La Tienda muestra permisos manifests efectivos a los usuarios. El acceso amplio al filesystem, el acceso a todos los dispositivos, el acceso al bus del sistema, la ejecución de raíz, el intercambio de procesos y las capacidades de servicio de host necesitan un motivo de paquete concreto.

Los permisos de runtime provienen del manifest instalado y las overrides locales del usuario. Los metadatos del catálogo se utilizan para el descubrimiento y la presentación del instalador.

## Mantener la entrada actualizada

Las actualizaciones de paquetes normalmente siguen la referencia de origen registrada en la entrada del catálogo. Actualice capturas de pantalla y descripciones cuando cambie el comportamiento visible de la aplicación. Elimine las afirmaciones que ya no sean ciertas.

El repositorio de paquetes es la fuente de `cpak.json` y referencias de imágenes. Los metadatos de la Store apuntan a ese contrato de paquete.

## Descargas del instalador

El workflow de inicio cpak produce instaladores gráficos y de terminal firmados para las aplicaciones enumeradas. El catálogo de releases vincula los metadatos de la Store, la revisión del código fuente, la arquitectura, los permisos y la base del instalador en una cápsula verificada.

Lea [cpak-installer](/docs/cpak-installer) para conocer el punto final directo, el contrato de integración, los activos de release y el modelo de verificación.

## Catálogos federados

La identidad del paquete de cpak está descentralizada. Otro proyecto puede mantener su propio índice revisado con diferentes categorías y políticas mientras apunta a los mismos orígenes de paquete. La instalación del paquete sigue siendo independiente de cualquier catálogo.