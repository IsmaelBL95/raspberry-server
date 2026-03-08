import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TerminalScreen from "../../components/TerminalScreen.jsx";

/**
 * Authentication page for the root dashboard.  It checks for an
 * existing session on mount and displays a password input for
 * entering a 16‑character key.  The key is submitted
 * automatically once it reaches 16 characters.  The form provides
 * feedback based on the response status codes.
 */
export default function RootAuth() {
  const navigate = useNavigate();

  const [checkingSession, setCheckingSession] = useState(true);
  const [keyInput, setKeyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const hasSubmittedRef = useRef(false);

  // Check if there is an existing valid session on mount.
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
        if (err?.name === "AbortError") return;
        setCheckingSession(false);
      }
    };
    checkSession();
    return () => controller.abort();
  }, [navigate]);

  // Auto‑submit the key once it reaches 16 characters.
  useEffect(() => {
    if (keyInput.length !== 16) {
      hasSubmittedRef.current = false;
      return;
    }
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    submitKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyInput]);

  // Submit the authentication key to the backend.
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
        setFeedback({ type: "success", message: "AUTH_SUCCESS: ACCESS_GRANTED" });
        setIsBlocked(false);
        setTimeout(() => {
          navigate("/root/dashboard", { replace: true });
        }, 500);
      } else if (res.status === 429) {
        setFeedback({ type: "error", message: "AUTH_FAILED: RATE_LIMIT_EXCEEDED. SYS_LOCKED." });
        setIsBlocked(true);
        setKeyInput("");
      } else if (res.status === 401) {
        setFeedback({ type: "error", message: "AUTH_FAILED: INVALID_KEY" });
        setKeyInput("");
      } else {
        setFeedback({ type: "error", message: "AUTH_FAILED: UNKNOWN_ERR" });
        setKeyInput("");
      }
    } catch {
      setFeedback({ type: "error", message: "AUTH_FAILED: CONNECTION_LOST" });
      setKeyInput("");
    } finally {
      setLoading(false);
    }
  };

  // Display a terminal screen while checking the session.
  if (checkingSession) {
    return <TerminalScreen message="[SYSTEM]: INITIALIZING_SESSION_CHECK..." />;
  }

  return (
    <div
      style={{
        backgroundColor: "#000000",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "'Courier New', Consolas, monospace",
        color: "#00FF00",
        textTransform: "uppercase",
      }}
    >
      <div style={{ width: "320px" }}>
        <h1
          style={{
            fontSize: "14px",
            fontWeight: "normal",
            marginBottom: "20px",
            borderBottom: "1px solid #00FF00",
            paddingBottom: "5px",
          }}
        >
          root_system: authenticate
        </h1>
        <input
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          disabled={loading || isBlocked}
          maxLength={16}
          placeholder=""
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            backgroundColor: "#000000",
            color: "#00FF00",
            border: "1px solid #00FF00",
            borderRadius: "0px",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
            letterSpacing: "2px",
          }}
        />
        <div style={{ minHeight: "28px", marginTop: "12px" }}>
          {feedback && (
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                color: feedback.type === "success" ? "#00FF00" : "#FF0000",
              }}
            >
              {feedback.message}
            </p>
          )}
        </div>
        <div
          style={{
            marginTop: "10px",
            fontSize: "10px",
            color: "#00FF00",
          }}
        >
          {!isBlocked ? `BUFFER: [${keyInput.length}/16]` : "STATUS: LOCKDOWN"}
        </div>
      </div>
    </div>
  );
}