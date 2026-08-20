---
title: Comparar formatos de paquetes Linux
description: Elija entre cpak, Flatpak, Snap, AppImage, paquetes nativos y Distrobox según lo que necesite distribuir.
tags: [comparison, flatpak, snap, appimage, deb, rpm, distrobox]
section: start
order: 35
---
# Comparar Linux formatos de paquetes

Linux tiene varias buenas formas de entregar software. Resuelven diferentes problemas, por lo que la elección correcta depende de la aplicación, sus usuarios y quién mantendrá el paquete.

| Formato | Mejor ajuste | Entrada de build | base compartida | Aislamiento | Distribución |
| ---------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| cpak | Aplicaciones de escritorio, herramientas para desarrolladores, servicios y sesiones completas creadas como imágenes OCI | Containerfile, OCI imagen y `cpak.json` | Paquetes de plataforma versionados y dependencias anidadas | Espacios de nombres con permisos manifests explícitos y acciones de host escritas | Cualquier Git origen y OCI registro; la Store de cpak es opcional |
| Paquete plano | Aplicaciones de escritorio entre distribuciones | Módulos de manifest Flatpak y constructor de Flatpak | Tiempos de ejecución versionados de Flatpak | Sandbox Bubblewrap, permisos estáticos y portales de escritorio | Cualquier control remoto Flatpak; Flathub es el principal catálogo público |
| Quebrar | Software de escritorio, servidor y dispositivo en el ecosistema Snap | `snapcraft.yaml` y piezas de Snapcraft | Broches de base versionados | Estricto confinamiento mediante AppArmor, seccomp e interfaces; El confinamiento clásico también está disponible. | Snap Store y canales instantáneos |
| Imagen de aplicación | Un ejecutable de escritorio portátil que se ejecuta sin instalación | Directorio de aplicaciones incluido en una imagen | No se requiere runtime compartido | El formato no proporciona ningún entorno de pruebas | Descarga directa de archivos o cualquier servidor de archivos. |
| DEB o RPM | Componentes del sistema y software mantenidos para una distribución específica. | Fuente de distribución y recetas de paquetes binarios | Bibliotecas de distribución de host | Permisos de host normales a menos que la aplicación agregue su propio aislamiento | Repositorios de distribución o repositorios de terceros |
| caja de distribución | Entornos mutables de desarrollo y línea de comandos integrados con el host | Una imagen de container administrada a través de Podman, Docker o Lilipod | Imagen de distribución de containers | Espacios de nombres de motores de containers con amplia integración de host por diseño | Registros de containers; no es un formato de Store de aplicaciones |

## Cuando encaja cpak

cpak es útil cuando el software ya está integrado en un Containerfile, necesita integración directa Linux o tiene que ejecutarse en más de un contexto. El mismo modelo de paquete puede describir una aplicación de escritorio, una herramienta de línea de comandos, un servicio o una sesión de escritorio completa. OCI layers proporcionan reutilización del transporte, mientras que cpak drivers de almacenamiento deduplican el contenido localmente en todos los paquetes.

El manifest enumera el acceso al host antes de la instalación. Las aplicaciones pueden utilizar acciones de host escritas y selectores de archivos nativos sin tener que reescribirse en torno a una API del portal. Un paquete se puede publicar desde su propio repositorio y registro Git y luego incluirse en la Tienda sin transferir la propiedad a un servicio de build central.

cpak es más joven que los otros formatos en esta comparación. Su catálogo público y su paquete de distribución son más pequeños y algunos entornos Linux han recibido menos pruebas de campo. Utilice la [guía de compatibilidad de host](/docs/host-compatibility) antes de convertirlo en el único método de entrega para una gran audiencia.

## Cuando Flatpak encaja

Flatpak tiene un ecosistema maduro centrado en el escritorio, tiempos de ejecución establecidos y un amplio soporte de distribución. Su entorno de pruebas comienza con poco acceso al host, luego se manifiesta y [portales](https://docs.flatpak.org/en/latest/basic-concepts.html#portals) proporciona los recursos que necesita una aplicación. Flathub ofrece un lugar familiar para que los usuarios descubran y actualicen aplicaciones.

Elija Flatpak cuando el acceso al escritorio, las herramientas existentes y la integración del portal sean más importantes que reutilizar un Containerfile o distribuir fuera del modelo de runtime de Flatpak.

## Cuando Snap encaja

Snap cubre software de escritorio, servidores y dispositivos administrados. Las instantáneas estrictas utilizan [interfaces](https://snapcraft.io/docs/explanation/interfaces/all-about-interfaces/) para acceder a los recursos del host, mientras que las instantáneas base proporcionan el filesystem en runtime. Los canales y las actualizaciones automáticas están integrados en snapd y Snap Store.

Elija Snap cuando su Store, modelo de actualización, integración de Ubuntu o administración de dispositivos coincidan con la implementación. El confinamiento clásico está disponible para software que no puede funcionar dentro de interfaces estrictas, pero su publicación requiere revisión en la Store.

## Cuando AppImage encaja

AppImage es directo: descargue un archivo ejecutable, márquelo como ejecutable y ejecútelo. No requiere ningún servicio del sistema ni instalación de paquetes. Esto lo hace útil para herramientas portátiles, builds de prueba y software entregados desde el sitio web de un proyecto.

El formato no proporciona un espacio aislado, un servicio de actualización obligatorio ni tiempos de ejecución compartidos. Esas funciones pueden agregarse mediante aplicaciones y herramientas externas, pero no son garantía del formato en sí. Consulte los [conceptos de AppImage](https://docs.appimage.org/introduction/concepts.html) para conocer su modelo.

## Cuando cabe DEB o RPM

Los paquetes nativos siguen siendo la opción correcta para kernels, drivers, servicios del sistema y componentes que deben seguir el ciclo de vida de distribución. Se integran con el administrador de paquetes del host y utilizan las bibliotecas, políticas y procesos de actualización exactos que mantiene esa distribución.

Esa integración también crea trabajo de mantenimiento en todas las distribuciones y inicios. Un paquete de aplicación nativa puede necesitar recetas, nombres de dependencia y pruebas independientes para Debian, Ubuntu, Fedora, openSUSE y sus releases compatibles.

## Cuando encaja Distrobox

Distrobox crea entornos Linux mutables con acceso cercano al hogar, la pantalla, el audio y los dispositivos del usuario. Es particularmente útil para herramientas de desarrollo, comandos específicos de distribución y trabajo interactivo. Su propia documentación describe ese [modelo de integración de host](https://distrobox.it/).

No es un reemplazo directo de un catálogo de paquetes de aplicaciones. Elíjalo cuando el usuario quiera un entorno de container al que pueda ingresar y modificar. Elija un formato de aplicación cuando el editor deba definir la aplicación, los permisos, las actualizaciones y la entrada del escritorio como un paquete revisado.

## Verifique el paquete, no solo el formato

Un formato no puede hacer que un editor que no es de confianza sea seguro. Verifique el origen, la receta de build, los permisos solicitados, la fuente de actualización y el mantenedor del paquete exacto que planea instalar. La Store de cpak expone el manifest, la imagen OCI, las dependencias y los permisos en cada página de la aplicación por ese motivo.