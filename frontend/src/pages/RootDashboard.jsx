import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RootDashboard() {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  // Verificación inicial: comprobar sesión antes de renderizar
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await fetch("/api/root/session", { credentials: "include" });
        if (!mounted) return;
        if (res.status === 200) {
          setChecking(false);
        } else {
          navigate("/root/auth", { replace: true });
        }
      } catch (err) {
        navigate("/root/auth", { replace: true });
      }
    };
    check();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  // Polling: revalidar sesión cada 60 segundos
  useEffect(() => {
    // Solo iniciar polling si la verificación inicial pasó
    if (checking) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch("/api/root/session", { credentials: "include" });
        if (res.status !== 200) {
          // Sesión expirada o inválida -> redirigir a auth
          navigate("/root/auth", { replace: true });
        }
      } catch (err) {
        // Error de conexión -> redirigir a auth
        navigate("/root/auth", { replace: true });
      }
    }, 60 * 1000); // 60 segundos

    // Cleanup: limpiar intervalo al desmontar
    return () => clearInterval(intervalId);
  }, [checking, navigate]);

  if (checking) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Checking session...</div>;
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>📊 Root Dashboard</h1>
      <p>Panel de administración root (placeholder)</p>
      <p style={{ fontSize: "14px", color: "#999" }}>
        Sesión activa por 5 minutos (verificación cada 60s)
      </p>
      <a href="/">Volver a Home</a>
    </div>
  );
}
