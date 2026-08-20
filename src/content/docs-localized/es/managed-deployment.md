---
title: Implementación gestionada
description: Decida de forma centralizada quién puede publicar software en sus máquinas y qué permisos puede obtener cada aplicación.
tags: [enterprise, security, policy]
section: runtime
order: 55
---

# Implementación gestionada

En una máquina gestionada, el administrador controla tres aspectos distintos: el límite máximo de permisos, los editores de confianza y el comportamiento cuando una aplicación no coincide con el estado registrado.

Cada control usa un archivo separado porque responde a una pregunta distinta. Los archivos se guardan junto al registro de integridad y la cuenta que inicia la aplicación no puede modificarlos.

## Ceiling: el límite máximo de permisos

El ceiling define la policy más amplia permitida por el host. El manifest y el override local establecen lo que solicita la aplicación; el ceiling limita el resultado para todos los usuarios de la máquina.

```bash
cpak system ceiling
cpak system set-ceiling /etc/cpak/ceiling.json
cpak system set-ceiling none
```

El archivo usa la misma estructura de permisos que un override y solo decide sobre las claves que contiene. Una clave ausente queda bajo el control del manifest y del propietario de la instalación:

```json
{
  "socketSessionBus": false,
  "network": false,
  "filesystem": [{ "path": "xdg-download", "access": "read-only" }]
}
```

Esta policy cierra el bus de sesión y la red, además limita cualquier solicitud al sistema de archivos a la lectura del directorio Descargas. No define audio, dispositivos ni el bus de accesibilidad, por lo que esos permisos permanecen intactos.

Un valor `true` no concede un permiso. El ceiling se aplica por intersección: `"deviceDri": true` deja pasar una solicitud del manifest o de un override local, pero no la crea. Una aplicación que no solicita el dispositivo gráfico sigue sin recibirlo.

En una máquina no gestionada, el propietario puede añadir o quitar permisos con un override local. En una máquina gestionada puede hacer lo mismo dentro del ceiling, pero no puede superarlo ni desactivarlo.

El ceiling es independiente de las firmas. Se aplica del mismo modo a un paquete sin firmar y a otro firmado por un editor aprobado.

## Trust policy: quién puede publicar

La trust policy indica qué orígenes pueden instalarse y qué identidades pueden firmarlos. El servicio privilegiado la aplica durante el registro de la aplicación, por lo que omitir el cliente no evita la decisión.

```bash
cpak system trust
cpak system set-trust /etc/cpak/trust.json
cpak system set-trust none
```

```json
{
  "abi": 1,
  "require_publisher": true,
  "approved_origins": ["github.com/acme/editor"],
  "approved_signers": [
    {
      "issuer": "https://token.actions.githubusercontent.com",
      "repo": "github.com/acme/editor"
    }
  ],
  "revoked": [
    { "origin": "github.com/acme/editor", "generation": 7, "reason": "CVE-2026-1234" }
  ]
}
```

`approved_origins` contiene orígenes exactos, no patrones. Un patrón de organización aprobaría también repositorios creados más tarde por personas distintas.

`revoked` retira una confianza ya concedida. Sin una generación, la revocación cubre todas las generaciones de ese origen. Una revocación siempre tiene prioridad sobre una aprobación.

## Contrafirma: una segunda aprobación

`require_approval` exige que la organización firme el mismo estado que ya firmó el editor. La firma del editor prueba quién publicó el paquete; la contrafirma prueba que la organización aprobó esa release concreta.

```json
{
  "abi": 1,
  "require_approval": true,
  "approval_signers": [
    { "issuer": "https://token.actions.githubusercontent.com", "repo": "github.com/acme/approvals" }
  ]
}
```

## Exigir una firma

Un host puede impedir el registro de paquetes sin firmar:

```bash
cpak system signatures
cpak system set-signatures required
cpak system set-signatures optional
```

`optional` es el valor predeterminado. Con `required`, un paquete sin firmar puede descargarse pero no queda registrado; el nivel de enforcement decide si un intento de inicio se registra o se rechaza.

## Enforcement: qué sucede al iniciar

El ceiling, las firmas y la trust policy establecen qué puede registrarse. El enforcement decide qué sucede cuando el inicio no coincide con el registro.

```bash
cpak system enforcement
cpak system set-enforcement warn
cpak system set-enforcement refuse
```

`off` es el valor predeterminado. `warn` no bloquea el inicio y registra cada diferencia, por lo que una flota puede observarse antes de activar el bloqueo. `refuse` impide iniciar aplicaciones no reconocidas.

Un store que contradice su propio estado se rechaza incluso con `off`, porque no es un estado desconocido sino una violación de la integridad registrada.

## Dónde se guardan las decisiones

Estos controles se guardan bajo `/var/lib/cpak/integrity`, pertenecen a root y deben ser archivos regulares que ningún otro usuario pueda modificar. Un archivo que no supera estas comprobaciones no se aplica.

Modificar los controles requiere autenticación administrativa. Leerlos no, para que un usuario pueda entender por qué una aplicación no se inicia.

## Host no gestionado

Si no se configura ninguno de estos controles, cpak conserva su comportamiento normal: no existe un ceiling del sistema y el override local puede añadir o quitar permisos. Una actualización de cpak nunca activa por sí sola una policy empresarial.

## Límites del modelo

Aprobar un editor no garantiza que todas sus releases sean seguras. Una release comprometida debe revocarse.

La firma no demuestra que la imagen corresponda al código fuente revisado. Para eso se necesitan builds reproducibles.

Una instalación resuelta mediante un lock file todavía no puede presentar una firma verificable del editor. Con una policy que la exige, queda sin registrar. Consulte [inicio verificado](/docs/verified-launch).
