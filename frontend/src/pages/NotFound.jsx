// 404 Not Found page component

export default function NotFound() {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>404 - Página No Encontrada</h1>
      <p>Lo sentimos, la página que buscas no existe.</p>
      <a href="/">Volver al Inicio</a>
    </div>
  );
}