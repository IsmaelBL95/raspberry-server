import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RootDashboard() {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

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

  if (checking) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Checking session...</div>;
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>📊 Root Dashboard</h1>
      <p>Panel de administración root (placeholder)</p>
      <a href="/">Volver a Home</a>
    </div>
  );
}
