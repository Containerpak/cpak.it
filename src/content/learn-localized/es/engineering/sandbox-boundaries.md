El sandbox de cpak tiene varios límites independientes. Llamarlos a todos container oculta tanto por qué funciona un permiso como por qué falla una evasión.

## Los namespaces deciden el mundo que ve el proceso

El namespace de montaje empieza con el root compuesto del package. Los namespaces de proceso, IPC, hostname y cgroup separan el estado de runtime del host. Se usa un namespace de red salvo que el manifest conceda acceso a la red. Los namespaces de usuario permiten esto sin convertir la aplicación en un proceso root del host.

Los namespaces de usuario anidados están bloqueados de forma predeterminada. Navegadores y programas similares pueden pedir `userNamespaces` cuando necesitan crear otro sandbox dentro de cpak. Ese permiso es específico: no concede el filesystem del host ni el bus del sistema.

## Los montajes deciden qué objetos del host existen

Un grant de filesystem se convierte en un path dentro del namespace de montaje, con un modo explícito read-only o read-write. Pantalla, audio, dispositivos y buses tienen campos de manifest separados porque cada uno abre un objeto distinto del host. Un objeto ausente no se alcanza adivinando otro path.

## Landlock restringe los paths después de preparar el entorno

El runtime instala reglas Landlock después de abrir y montar los paths necesarios. Así el proceso recibe del kernel una lista de paths legibles y escribibles incluso dentro de su namespace. La ABI disponible depende del kernel del host; `cpak doctor` la informa, y un inicio puede requerir el sandbox cuando un fallback no sea aceptable.

## seccomp restringe las llamadas al sistema

`no_new_privs` impide ganar privilegios mediante ejecución setuid. Después seccomp filtra llamadas al sistema no permitidas, incluidas las necesarias para crear otro namespace de usuario cuando no se concedió ese permiso. El aislamiento de montajes y seccomp resuelven problemas distintos: uno controla los objetos visibles y el otro las operaciones del kernel.

## Los brokers no disuelven el sandbox

Una solicitud que debe llegar al host se convierte en una host action tipada mediante el broker. La solicitud contiene una operación finita y campos validados, no un comando de shell. La validación del peer la vincula a la instancia del package y el package debe tener el permiso correspondiente.

Los manifests peligrosos siguen siendo fáciles de identificar: acceso a todo el directorio personal, bus de sesión o de sistema, dispositivos amplios, compartición de procesos y montajes root del host ensanchan el límite. El sandbox no estrecha un permiso amplio.

[Sandbox y modelo de amenazas](/docs/sandbox) enumera cada límite y sus requisitos en el host.
