Un ceiling establece hasta dónde puede llegar una aplicación. Enforcement comprueba que el inicio coincida con el registro. Ninguno responde a la primera pregunta de un parque administrado: **¿quién publicó este software?**

## Registrar o no un paquete sin firma

```
cpak system signatures            # what is in force
cpak system set-signatures required
```

Hay dos valores posibles. `optional` es el predeterminado: un paquete sin firma se registra y el ledger anota que carece de ella. Esta información se conserva aunque el host no la utilice para bloquear nada, por lo que la política puede activarse más adelante.

`required` rechaza el registro de una aplicación que no haya sido firmada por una identidad autorizada para representar su origen. Rechaza el _registro_, no la instalación. El software ya escrito en el disco permanece allí, pero no queda registrado, y cpak lo indica con claridad.

La política de firma y enforcement trabajan juntos. Con `warn`, una aplicación sin registrar se inicia y muestra un aviso. Con `refuse`, no se inicia.

## Qué publishers se consideran de confianza

Una firma demuestra que alguien firmó el paquete, no que el host confíe en esa persona. La política de confianza se expresa en un archivo:

```
cpak system set-trust /etc/cpak/trust.json
cpak system trust                 # what is in force
cpak system set-trust none        # remove it
```

```
{
  "abi": 1,
  "require_publisher": true,
  "approved_signers": [{ "issuer": "https://token.actions.githubusercontent.com" }],
  "approved_origins": ["github.com/yourcompany/"],
  "revoked": [{ "origin": "github.com/someone/thing", "reason": "key lost" }]
}
```

Una política vacía acepta todo, por lo que un host sin configurar mantiene el comportamiento predeterminado. Un campo ausente en la definición de un signer significa _cualquier valor_. En el ejemplo, el host acepta cualquier firma emitida mediante GitHub Actions, sin importar el repositorio.

## Firmado por alguien y aprobado por nosotros

`require_publisher` y `require_approval` expresan requisitos diferentes.

El primero exige la firma de un publisher incluido en la lista. El segundo exige que **la organización haya refrendado el estado exacto del paquete**: no solo su origen o publisher, sino esa build concreta. Es el control adecuado cuando se necesita una revisión interna del paquete.

## Revocar una decisión anterior

Una revocación retira una aprobación ya concedida. Si indica una generación, revoca únicamente esa. Si la generación no está presente, revoca todas las generaciones del origen. El motivo permanece en la política para que la decisión siga siendo comprensible más adelante.

Cada resultado incluye su explicación, tanto cuando permite el inicio como cuando lo rechaza. Entender por qué una aplicación se inició requiere la misma información que entender por qué fue bloqueada.

[Despliegue administrado](/docs/managed-deployment) documenta el formato completo del archivo.
