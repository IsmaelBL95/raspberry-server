import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RootAuth() {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await fetch("/api/root/session", { credentials: "include" });
        if (!mounted) return;
        if (res.status === 200) {
          navigate("/root/dashboard", { replace: true });
        } else {
          setChecking(false);
        }
      } catch (err) {
        setChecking(false);
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
      <h1>🔐 Root Auth</h1>
      <p>Root Auth placeholder (session invalid)</p>
      <a href="/">Volver a Home</a>
    </div>
  );
}
