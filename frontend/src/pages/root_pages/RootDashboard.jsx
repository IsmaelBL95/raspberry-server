import { useState, useEffect, useMemo } from "react";
import { useNavigate, Outlet, NavLink } from "react-router-dom";

export default function RootDashboard() {
  const [checking, setChecking] = useState(true);
  const [mongoStatus, setMongoStatus] = useState("unknown"); // "up" | "down" | "unknown"
  const navigate = useNavigate();

  // Estilos comunes
  const terminalFont = "'Courier New', Consolas, monospace";
  const greenPhosphor = "#00FF00";

  const mongoIsUp = mongoStatus === "up";
  const statusColor = mongoIsUp ? greenPhosphor : "red";
  const statusText = useMemo(() => {
    if (mongoStatus === "up") return "ACTIVE";
    if (mongoStatus === "down") return "DB_DOWN";
    return "DB_UNKNOWN";
  }, [mongoStatus]);

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
      } catch {
        navigate("/root/auth", { replace: true });
      }
    };

    check();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  // Polling sesión: revalidar cada 60 segundos (solo si pasó el check inicial)
  useEffect(() => {
    if (checking) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch("/api/root/session", { credentials: "include" });
        if (res.status !== 200) {
          navigate("/root/auth", { replace: true });
        }
      } catch {
        navigate("/root/auth", { replace: true });
      }
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [checking, navigate]);

  // Polling /ready: comprobar estado del backend/DB (Mongo) y reflejarlo en el header
  useEffect(() => {
    if (checking) return; // opcional: solo empezar cuando la sesión está validada

    const checkReady = async () => {
      try {
        const res = await fetch("/api/ready", { credentials: "include" });

        // Si responde pero no es JSON válido, caerá al catch del json()
        const data = await res.json();

        // Esperado: { status: "ok"|"degraded", mongo: "up"|"down" }
        if (data?.mongo === "up" || data?.mongo === "down") {
          setMongoStatus(data.mongo);
        } else {
          setMongoStatus("unknown");
        }
      } catch {
        setMongoStatus("down");
      }
    };

    checkReady(); // primera comprobación

    const intervalId = setInterval(checkReady, 30 * 1000); // cada 30s
    return () => clearInterval(intervalId);
  }, [checking]);

  if (checking) {
    return (
      <div
        style={{
          backgroundColor: "#000",
          color: greenPhosphor,
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: terminalFont,
          textTransform: "uppercase",
        }}
      >
        [SYSTEM]: VERIFYING_ROOT_PRIVILEGES...
      </div>
    );
  }

  const navLinkStyle = ({ isActive }) => ({
    color: greenPhosphor,
    textDecoration: "none",
    padding: "4px 8px",
    border: isActive ? `1px solid ${greenPhosphor}` : "1px solid transparent",
    backgroundColor: isActive ? "rgba(0, 255, 0, 0.1)" : "transparent",
  });

  return (
    <div
      style={{
        backgroundColor: "#000",
        color: greenPhosphor,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: terminalFont,
        textTransform: "uppercase",
      }}
    >
      {/* Header persistente */}
      <header
        style={{
          padding: "10px 16px",
          borderBottom: `1px solid ${greenPhosphor}`,
          fontSize: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span>SYSTEM_CONTROL_UNIT // ROOT_ACCESS</span>

        {/* Estado de MongoDB */}
        <span style={{ color: statusColor }}>
          STATUS: {statusText}
        </span>
      </header>

      <div style={{ flex: 1, display: "flex" }}>
        {/* Sidebar persistente */}
        <aside
          style={{
            width: 200,
            borderRight: `1px solid ${greenPhosphor}`,
            padding: "20px 12px",
          }}
        >
          <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <NavLink to="" end style={navLinkStyle}>
              {">"} INICIO
            </NavLink>

            <NavLink to="users" style={navLinkStyle}>
              {">"} USUARIOS
            </NavLink>
          </nav>
        </aside>

        {/* Contenido variable */}
        <main
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}