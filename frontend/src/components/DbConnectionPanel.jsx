import { useEffect, useRef, useState } from "react";

export default function DbConnectionPanel() {
  const [status, setStatus] = useState("loading"); // loading | connected | disconnected | error
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success"|"error", text: string } | null

  const mountedRef = useRef(true);

  const setSafe = (fn) => {
    if (!mountedRef.current) return;
    fn();
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/db/status", { credentials: "include" });
      if (!res.ok) throw new Error("Status request failed");
      const data = await res.json();

      // Se espera algo como: { connected: true/false }
      setSafe(() => setStatus(data.connected ? "connected" : "disconnected"));
    } catch {
      setSafe(() => setStatus("error"));
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchStatus();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const connect = async () => {
    if (busy) return;
    setBusy(true);
    setMessage(null);

    try {
      const res = await fetch("/api/db/connect", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Connect failed");

      setMessage({ type: "success", text: "✅ Connected to database." });
      await fetchStatus();
    } catch {
      setMessage({ type: "error", text: "❌ Could not connect to database." });
      setStatus("error");
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    if (busy) return;
    setBusy(true);
    setMessage(null);

    try {
      const res = await fetch("/api/db/disconnect", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Disconnect failed");

      setMessage({ type: "success", text: "✅ Disconnected from database." });
      await fetchStatus();
    } catch {
      setMessage({ type: "error", text: "❌ Could not disconnect from database." });
      setStatus("error");
    } finally {
      setBusy(false);
    }
  };

  const statusLabel = (() => {
    if (status === "loading") return "Checking DB status...";
    if (status === "connected") return "Connected";
    if (status === "disconnected") return "Disconnected";
    return "Error";
  })();

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", borderRadius: "8px", maxWidth: "420px" }}>
      <h2 style={{ marginTop: 0 }}>Database</h2>

      <p style={{ margin: "8px 0" }}>
        <strong>Status:</strong> {statusLabel}
      </p>

      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <button onClick={connect} disabled={busy || status === "connected"}>
          Connect
        </button>
        <button onClick={disconnect} disabled={busy || status === "disconnected"}>
          Disconnect
        </button>
        <button onClick={fetchStatus} disabled={busy}>
          Refresh
        </button>
      </div>

      <div style={{ minHeight: "22px", marginTop: "12px" }}>
        {message && (
          <p style={{ margin: 0, color: message.type === "success" ? "green" : "red" }}>
            {message.text}
          </p>
        )}
      </div>

      {busy && <p style={{ marginTop: "10px", fontSize: "12px", opacity: 0.7 }}>Working...</p>}
    </div>
  );
}