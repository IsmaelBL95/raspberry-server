// src/pages/Profile.jsx
import { useState } from "react";
import { Navigate, useOutletContext } from "react-router-dom";
import styles from "../styles/Profile.module.css";

function formatDateInput(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

const Profile = () => {
  const { identity, loading, isAuthenticated, refresh } = useOutletContext();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (loading) {
    return <div className={styles.message}>Cargando...</div>;
  }

  if (!isAuthenticated || !identity) {
    return <Navigate to="/login" replace />;
  }

  const startEdit = () => {
    setForm({
      firstName: identity.firstName || "",
      lastName: identity.lastName || "",
      birthDate: formatDateInput(identity.birthDate),
    });
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSave = async () => {
    if (saving) return;

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Nombre y apellidos son obligatorios.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/identities/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          birthDate: form.birthDate || null,
        }),
      });

      if (response.status === 200) {
        await refresh();
        setIsEditing(false);
        setSuccess("Perfil actualizado correctamente.");
        return;
      }

      if (response.status === 400) {
        setError("Datos inválidos.");
        return;
      }

      if (response.status === 401) {
        setError("Sesión no válida.");
        return;
      }

      setError("No se pudo actualizar.");
    } catch {
      setError("Error de red.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <h2 className={styles.title}>Mi perfil</h2>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        {!isEditing ? (
          <>
            <p><strong>Nombre:</strong> {identity.firstName}</p>
            <p><strong>Apellidos:</strong> {identity.lastName}</p>
            <p><strong>Usuario:</strong> {identity.nickname}</p>
            <p><strong>Fecha nacimiento:</strong> {identity.birthDate ? new Date(identity.birthDate).toLocaleDateString() : "No indicado"}</p>
            <p><strong>Estado:</strong> {identity.status}</p>

            <button onClick={startEdit} className={styles.button}>
              Editar
            </button>
          </>
        ) : (
          <>
            <input name="firstName" value={form.firstName} onChange={handleChange} />
            <input name="lastName" value={form.lastName} onChange={handleChange} />
            <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} />

            <button onClick={handleSave} disabled={saving} className={styles.button}>
              {saving ? "Guardando..." : "Guardar"}
            </button>

            <button onClick={() => setIsEditing(false)} className={styles.cancel}>
              Cancelar
            </button>
          </>
        )}
      </section>
    </main>
  );
};

export default Profile;