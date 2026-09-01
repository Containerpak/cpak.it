El sandbox de cpak tiene varios límites independientes. Llamarlos a todos container oculta tanto por qué funciona un permiso como por qué falla una evasión.

## Los namespaces deciden el mundo que ve el proceso

El namespace de montaje empieza con la raíz compuesta del paquete. Los namespaces de proceso, IPC, hostname y cgroup separan el estado del runtime del host. La red permanece en un namespace privado con o sin el permiso `network`. El permiso agrega acceso a internet y LAN mediante un helper de espacio de usuario, mientras el loopback del host sigue bloqueado. Solo `hostNetwork` sustituye ese límite por el namespace de red del host. Los namespaces de usuario permiten esto sin convertir la aplicación en un proceso root del host.

Los namespaces de usuario anidados están bloqueados de forma predeterminada. Navegadores y programas similares pueden pedir `userNamespaces` cuando necesitan crear otro sandbox dentro de cpak. Ese permiso es específico: no concede el filesystem del host ni el bus del sistema.

## Los montajes deciden qué objetos del host existen

Un grant de filesystem se convierte en un path dentro del namespace de montaje, con un modo explícito read-only o read-write. Pantalla, audio, dispositivos y buses tienen campos de manifest separados porque cada uno abre un objeto distinto del host. Un objeto ausente no se alcanza adivinando otro path.

## Landlock restringe los paths después de preparar el entorno

El runtime instala reglas Landlock después de abrir y montar los paths necesarios. Así el proceso recibe del kernel una lista de paths legibles y escribibles incluso dentro de su namespace. La ABI disponible depende del kernel del host; `cpak doctor` la informa, y un inicio puede requerir el sandbox cuando un fallback no sea aceptable.

Landlock impide que un proceso confinado cambie la topología del filesystem. Un paquete que concede `userNamespaces` se ejecuta sin Landlock para que el sandbox anidado pueda crear sus propios montajes. El paquete sigue viendo solo la raíz y las rutas del host expuestas por el namespace de montaje de cpak, cada una con su modo declarado, y la política seccomp restante sigue activa.

## seccomp restringe las llamadas al sistema

`no_new_privs` impide ganar privilegios mediante ejecución setuid. Después seccomp filtra llamadas al sistema no permitidas, incluidas las necesarias para crear otro namespace de usuario cuando no se concedió ese permiso. El aislamiento de montajes y seccomp resuelven problemas distintos: uno controla los objetos visibles y el otro las operaciones del kernel.

## Los brokers no disuelven el sandbox

Una solicitud que debe llegar al host se convierte en una host action tipada mediante el broker. La solicitud contiene una operación finita y campos validados, no un comando de shell. La validación del peer la vincula a la instancia del package y el package debe tener el permiso correspondiente.

Los manifests peligrosos siguen siendo fáciles de identificar: acceso a todo el directorio personal, bus de sesión o de sistema, dispositivos amplios, compartición de procesos y montajes root del host ensanchan el límite. El sandbox no estrecha un permiso amplio.

[Sandbox y modelo de amenazas](/docs/sandbox) enumera cada límite y sus requisitos en el host.
