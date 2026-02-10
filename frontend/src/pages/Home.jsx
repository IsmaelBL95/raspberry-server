import { useState, useEffect } from "react";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch("/api/health");
        if (response.ok) {
          const data = await response.json();
          setBackendStatus(data.status);
        } else {
          setError("Backend respondió con error");
        }
      } catch (err) {
        setError("No se puede conectar con el backend");
      } finally {
        setLoading(false);
      }
    };

    checkBackend();
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>🏠 Home</h1>
      <p>Bienvenido a Rasp Server</p>

      <div style={{ marginTop: "20px" }}>
        <h2>Estado del Backend</h2>
        {loading && <p>Verificando backend...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {backendStatus && (
          <p style={{ color: "green" }}>✅ Backend: {backendStatus}</p>
        )}
      </div>

      <div style={{ marginTop: "30px" }}>
        <a href="/root/auth" style={{ marginRight: "10px" }}>
          Root Auth
        </a>
        <a href="/root/dashboard">Root Dashboard</a>
      </div>
    </div>
  );
}
