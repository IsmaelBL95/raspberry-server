# Resumen de cambios

Se ha refactorizado por completo el proyecto de Express para alinearlo con las mejores prácticas de ingeniería de software orientada a servicios. A continuación se describen de forma concisa los cambios realizados y el motivo de cada mejora.

## Arquitectura en capas

- **Separación de responsabilidades**: se ha reorganizado el código siguiendo un patrón de capas (`routes`, `controllers`, `services`, `middlewares`, `db`, `config` y `utils`). De este modo, las rutas únicamente definen endpoints y delegan la lógica de negocio a los controladores, estos a su vez llaman a servicios especializados y modelos. Esta separación facilita el mantenimiento y permite evolucionar cada pieza de forma aislada.

- **Servicios reutilizables**: la lógica de autenticación para la cuenta raíz se encapsula en `services/rootAuthService.js`. Este servicio gestiona generación y verificación de JWT, protección contra fuerza bruta y exposición de constantes de configuración. El controlador deja de contener lógica de negocio duplicada.

- **Configuración centralizada**: las variables de entorno y ajustes de la aplicación se obtienen desde `config/index.js`. Esto evita lecturas dispersas de `process.env` por todo el código y permite ajustar la aplicación sin modificar fuentes.

## Gestión global de errores

- **Middleware de errores**: se ha añadido `middlewares/errorHandler.js`, un manejador único que captura excepciones propagadas desde cualquier parte de la cadena. Este componente transforma las excepciones en respuestas HTTP coherentes, evitando duplicar bloques `try/catch` en cada controlador. Además, soporta encabezados como `Retry‑After` para los bloqueos.

- **Envoltorio para funciones asíncronas**: se implementó `middlewares/asyncHandler.js`, que permite envolver controladores `async` para propagar automáticamente cualquier error hacia el manejador global. Esto simplifica los controladores y reduce ruido.

## Optimización de rendimiento

- **Evitar operaciones bloqueantes**: se revisó el código en busca de tareas que bloquearan el event loop. El bucle de reconexión a Mongo se mantiene asíncrono mediante `await` y `setTimeout`, y la comparación de claves se hace con buffers precalculados. No se detectaron ciclos de CPU intensivos ni operaciones síncronas pesadas.

- **Acceso a estado O(1)**: el servicio de autenticación mantiene un mapa LRU para las IPs que ajusta su tamaño máximo (`MAX_IP_ENTRIES`) y TTL (`ENTRY_TTL`). Esta estructura garantiza acceso constante y evita crecimiento ilimitado de memoria.

## Código limpio y coherente

- **Nombres declarativos**: se renombraron funciones y constantes para describir su propósito, por ejemplo `authenticateRoot`, `errorHandler`, `getCookieOptions`.

- **Eliminación de código muerto**: se retiraron comentarios redundantes y se simplificaron estructuras innecesarias. Las rutas 404 se manejan en un único middleware.

- **Utilidades reutilizables**: se trasladó el logger a `utils/logger.js` para evitar duplicación y permitir su sustitución futura por un registrador más sofisticado.

## Seguridad

- **Cabeceras de seguridad**: el middleware `helmet` se registra en `app.js`, añadiendo protecciones estándar como `X‑Frame‑Options`, `X‑Content‑Type‑Options` y `Strict‑Transport‑Security`.

- **Cookies seguras**: las cookies de sesión se marcan como `httpOnly`, `sameSite=strict` y `secure` (dependiendo del entorno), minimizando el riesgo de robo de sesión. La expiración se define en segundos según la configuración del JWT.

- **Sanitización básica**: los controladores validan los parámetros de entrada (`Missing key`, `Invalid key`) y delegan la lógica de autenticación al servicio, evitando exponer detalles de implementación.

- **Variables de entorno**: se proporciona un fichero `.env.example` para que el despliegue configure claves secretas fuera del código fuente. El proyecto deja de exigir `dotenv` en tiempo de ejecución aunque soporta su uso si está instalado.

## Detalles de la nueva estructura

```
backend/
├── package.json           # dependencias y scripts
├── .env.example           # plantilla de configuración
├── REFORMAS.md            # este resumen de cambios
└── src
    ├── app.js             # instancia de Express y registro de middlewares
    ├── index.js           # punto de entrada que carga variables y ejecuta main()
    ├── main.js            # arranque de servidor y gestor de Mongo
    ├── server.js          # utilidades para iniciar y cerrar el servidor HTTP
    ├── config
    │   └── index.js       # carga de configuración
    ├── utils
    │   └── logger.js      # logger simple
    ├── db
    │   └── mongoManager.js # gestión de conexión a MongoDB con reconexión
    ├── middlewares
    │   ├── asyncHandler.js   # wrapper de controladores asíncronos
    │   ├── errorHandler.js   # manejador global de errores
    │   ├── requireMongo.js   # verifica disponibilidad de Mongo
    │   └── rootAuth.js       # valida JWT de sesión raíz
    ├── services
    │   └── rootAuthService.js # lógica de autenticación y bloqueo por fuerza bruta
    ├── controllers
    │   └── rootController.js  # controladores HTTP para la cuenta raíz
    └── routes
        ├── index.js        # rutas base (/health, /ready, /root)
        └── rootRoutes.js   # endpoints de autenticación raíz
```

## Deuda técnica pendiente

1. **Persistencia del estado de autenticación**: el sistema actual almacena los intentos fallidos y bloqueos en memoria. Esto provoca que, al reiniciar el proceso o en despliegues con balanceo, el estado se pierda o no se comparta. Para entornos con múltiples réplicas se requeriría externalizar este estado en Redis u otra base de datos distribuida.

2. **Aprovisionamiento de modelos y esquemas**: aunque el proyecto incluye un gestor de conexión a MongoDB, no existen modelos definidos ni operaciones sobre la base de datos. La incorporación de un patrón `Model` con `mongoose` obligaría a crear una capa adicional y probablemente servicios que encapsulen consultas y reglas de negocio.

3. **Gestión de usuarios y permisos**: el diseño asume una única clave raíz fija. Para un sistema real sería necesario un modelo de usuarios, hash de contraseñas, roles y permisos, así como flujos de renovación y revocación de tokens. Esto implica un cambio de arquitectura más profundo.

4. **Rate limiting generalizado**: el control de fuerza bruta se aplica sólo a la autenticación de la raíz. Para proteger el resto de la API frente a ataques de denegación se debería integrar un middleware de `rate-limit` configurable.

5. **Tests automatizados**: actualmente no se incluyen pruebas unitarias ni de integración. Incorporar una suite de tests garantizaría la estabilidad del refactor y facilitaría futuras evoluciones del código.