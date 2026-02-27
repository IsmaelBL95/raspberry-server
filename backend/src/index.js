// Carga variables de entorno desde un archivo .env si existe. Requiere
// que el paquete `dotenv` esté instalado. Si no lo está, la importación
// fallará silenciosamente en tiempo de compilación.
import "dotenv/config.js";

import main from "./main.js";

// Ejecutamos la función principal una vez cargadas las variables de entorno.
main();