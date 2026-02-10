import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RootAuth() {
  const navigate = useNavigate();

  // 1) Gate: primero comprobamos sesión
  const [checkingSession, setCheckingSession] = useState(true);

  // 2) UI de auth
  const [keyInput, setKeyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);

  // Evita múltiples submits por StrictMode o re-renders
  const hasSubmittedRef = useRef(false);

  // Verificar sesión: si es válida -> dashboard; si no -> mostrar UI
  useEffect(() => {
    const controller = new AbortController();

    const checkSession = async () => {
      try {
        const res = await fetch("/api/root/session", {
          credentials: "include",
          signal: controller.signal,
        });

        if (res.status === 200) {
          navigate("/root/dashboard", { replace: true });
          return;
        }

        setCheckingSession(false);
      } catch (err) {
        // En desarrollo (StrictMode) un AbortError es normal durante el remount
        if (err?.name === "AbortError") return;
        setCheckingSession(false);
      }
    };

    checkSession();
    return () => controller.abort();
  }, [navigate]);

  // Auto-submit al llegar EXACTAMENTE a 16 caracteres (una vez por intento)
  useEffect(() => {
    if (keyInput.length !== 16) {
      hasSubmittedRef.current = false; // permite un nuevo intento cuando el input cambia
      return;
    }
    if (hasSubmittedRef.current) return;

    hasSubmittedRef.current = true;
    submitKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyInput]);

  const submitKey = async () => {
    if (loading) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/root/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ key: keyInput }),
      });

      if (res.status === 200) {
        setFeedback({ type: "success", message: "✅ Autenticación correcta" });
        setIsBlocked(false);
        setTimeout(() => {
          navigate("/root/dashboard", { replace: true });
        }, 500);
      } else if (res.status === 429) {
        // Rate limit: bloqueado temporalmente
        setFeedback({
          type: "error",
          message: "❌ Demasiados intentos. Inténtalo de nuevo más tarde.",
        });
        setIsBlocked(true);
        setKeyInput("");
      } else if (res.status === 401) {
        // Clave incorrecta
        setFeedback({ type: "error", message: "❌ Clave incorrecta" });
        setKeyInput("");
      } else {
        // Otros errores
        setFeedback({ type: "error", message: "❌ Error de conexión" });
        setKeyInput("");
      }
    } catch {
      setFeedback({ type: "error", message: "❌ Error de conexión" });
      setKeyInput("");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Checking session...
      </div>
    );
  }

  // UI mínima y didáctica (según requisitos)
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div style={{ width: "320px", textAlign: "center" }}>
        <h1>Root Auth</h1>

        <input
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          disabled={loading || isBlocked}
          maxLength={16}
          placeholder="Introduce la clave (16 caracteres)"
          style={{ width: "100%", padding: "10px", fontSize: "16px" }}
        />

        <div style={{ minHeight: "28px", marginTop: "12px" }}>
          {feedback && (
            <p
              style={{
                margin: 0,
                color: feedback.type === "success" ? "green" : "red",
              }}
            >
              {feedback.message}
            </p>
          )}
        </div>

        <div style={{ marginTop: "10px", fontSize: "12px", opacity: 0.7 }}>
          {!isBlocked ? `${keyInput.length}/16` : "Bloqueado temporalmente"}
        </div>
      </div>
    </div>
  );
}