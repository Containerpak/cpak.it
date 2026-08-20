Hasta ahora hemos configurado políticas. Esta lección cubre la otra mitad del trabajo: una aplicación no se inicia y hay que averiguar rápidamente por qué.

## Qué políticas están activas

```
cpak system status
```

Es el primer comando que debe ejecutarse y el que más se omite. Muestra el nivel de enforcement, la política de firma, el ceiling y la política de confianza. Muchos informes que afirman que cpak no funciona proceden de hosts configurados como `refuse` y luego olvidados.

## Por qué no se inicia este paquete

```
cpak system explain github.com/example/thing
```

El comando aplica la política a un paquete instalado realmente en la máquina. Responde a preguntas como "el ceiling parece correcto, ¿por qué se restringe este permiso?" y produce la información que debe incluirse en un informe.

El playground del ceiling muestra la misma comparación antes de aplicar una política. `explain` la muestra después, utilizando el estado real de la máquina.

## El rechazo que sobrevive a la eliminación

Eliminar una aplicación no borra lo que conoce el ledger. cpak conserva la generación alcanzada y la identidad del publisher, para que la eliminación no se convierta en una forma de instalar una versión anterior o sin firma.

Esta protección produce un caso que puede sorprender: una reinstalación rechazada cuando la aplicación ya no está presente. El mensaje indica el motivo y el comando necesario para renunciar a la protección.

```
cpak system clear-removal github.com/example/thing
```

El comando elimina el anchor conservado y requiere autenticación administrativa. No existe una variante limitada a la cuenta propia, porque el anchor protege a todo el host contra un downgrade, la pérdida de firma y la ampliación de permisos.

Antes de solicitar autenticación, cpak muestra exactamente qué se va a eliminar. Si la generación registrada es más reciente que la que se quiere instalar, el rechazo está funcionando correctamente. Continuar significa aceptar el downgrade de forma consciente.

## El orden correcto

Ejecute primero `status`, porque describe la política activa. Use después `explain`, porque muestra el resultado para un paquete concreto. Deje `clear-removal` para el final y úselo solo después de leer qué se perderá: es el único de los tres comandos que modifica el estado del sistema.
