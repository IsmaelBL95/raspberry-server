// 404 Not Found page component

/**
 * Generic 404 page displayed when no matching route is found.  It
 * provides a simple message and link back to the home page.
 */
export default function NotFound() {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>404 - Página No Encontrada</h1>
      <p>Lo sentimos, la página que buscas no existe.</p>
      <a href="/">Volver al Inicio</a>
    </div>
  );
}