# Logging Policy

Este documento define **la taxonomía oficial de logging del proyecto**, sus niveles, semántica, colores y reglas de uso.
El objetivo es maximizar **claridad operativa**, **diagnóstico rápido** y **consistencia**.

---

## Principios generales

* El **nivel semántico** define la gravedad.
* El **emoji/color refuerza visualmente** la severidad.
* Los logs deben ser:

  * deterministas
  * consistentes
  * explotables por humanos y máquinas
* No se usan `console.log` directos fuera del logger central.

---

## Escala de severidad (menor → mayor)

```text
trace        🔵
debug        🔵
info         🟢
notice       🟡
warn         🟠
error        🔴
critical     🔴
alert        ⚫
fatal        ⚫
```

---

## Definición detallada de niveles

### trace 🔵

**Ruido técnico extremo.**
Uso exclusivo para diagnóstico profundo y puntual.

* Muy verboso
* No debe activarse en producción
* Ejemplos:

  * dumps internos
  * trazas detalladas de flujo

---

### debug 🔵

**Información de depuración.**

* Flujo interno del sistema
* Útil en desarrollo o troubleshooting
* No implica impacto operativo

---

### info 🟢

**Operación normal del sistema.**

* Estados esperados
* Eventos normales
* Ejemplos:

  * servidor iniciado
  * tarea completada correctamente

---

### notice 🟡

**Evento relevante pero no problemático.**

* Cambios de estado
* Situaciones esperadas pero dignas de atención
* No requiere acción

Ejemplos:

* uso de configuración alternativa
* feature flag activado

---

### warn / warning 🟠

**Riesgo potencial.**

* Anomalía
* Situación que **podría** derivar en error
* Requiere atención o seguimiento

Ejemplos:

* reintentos
* timeouts no críticos
* degradación parcial

---

### error 🔴

**Fallo real en una operación.**

* El sistema sigue funcionando
* La operación concreta ha fallado

Ejemplos:

* error en una petición
* fallo de validación
* excepción controlada

---

### critical 🔴

**Fallo grave que compromete el servicio.**

* Impacto significativo
* Degradación severa
* Puede requerir intervención inmediata

Ejemplos:

* dependencia crítica caída
* incapacidad de procesar tráfico

---

### alert ⚫

**Estado crítico inmediato.**

* El sistema está en condiciones inaceptables
* Acción inmediata requerida

Ejemplos:

* corrupción de datos
* pérdida de consistencia
* recursos críticos agotados

---

### fatal / emergency ⚫

**Colapso del sistema o parada forzada.**

* El proceso no puede continuar
* Shutdown inmediato y controlado

Ejemplos:

* error irrecuperable en arranque
* fallo de inicialización crítica

---

## Reglas obligatorias

1. **No mezclar niveles**

   * Usa un solo nombre canónico (`warn`, no `warning`).
2. **No usar niveles por conveniencia**

   * Cada nivel tiene semántica estricta.
3. **`alert` y `fatal` implican shutdown**
4. **Los emojis son obligatorios**

   * Son parte del contrato visual del sistema.

---

## Compatibilidad externa

Si se integra con sistemas estándar (syslog, cloud logging, APM):

| Nivel interno | Nivel externo sugerido |
| ------------- | ---------------------- |
| trace         | debug                  |
| debug         | debug                  |
| info          | info                   |
| notice        | info                   |
| warn          | warning                |
| error         | error                  |
| critical      | error / critical       |
| alert         | critical               |
| fatal         | emergency              |

---

## Nota final

Esta taxonomía **es una decisión de diseño consciente**.
No replica estándares clásicos al 100%, pero es **internamente coherente, documentada y operativamente eficaz**.

Cualquier cambio **debe actualizar este documento**.