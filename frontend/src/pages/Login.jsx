// src/pages/Login.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";

const initialFormData = {
  nickname: "",
  password: "",
};

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.nickname.trim()) {
      return "El usuario es obligatorio.";
    }

    if (!formData.password) {
      return "La contraseña es obligatoria.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setErrorMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/identities/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          nickname: formData.nickname.trim(),
          password: formData.password,
        }),
      });

      if (response.status === 200) {
        setFormData(initialFormData);
        navigate("/", { replace: true });
        return;
      }

      if (response.status === 400) {
        setErrorMessage("Debes introducir usuario y contraseña.");
        return;
      }

      if (response.status === 401) {
        setErrorMessage("Usuario o contraseña incorrectos.");
        return;
      }

      setErrorMessage("No se ha podido iniciar sesión.");
    } catch {
      setErrorMessage("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <h3 className={styles.title}>Identificación</h3>

        {errorMessage ? (
          <p className={styles.errorMessage}>{errorMessage}</p>
        ) : null}

        <input
          className={styles.input}
          type="text"
          name="nickname"
          placeholder="Usuario"
          value={formData.nickname}
          onChange={handleChange}
          disabled={loading}
        />

        <input
          className={styles.input}
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
        />

        <button className={styles.loginButton} type="submit" disabled={loading}>
          {loading ? "Validando..." : "Iniciar sesión"}
        </button>
      </form>

      <form className={styles.registerForm}>
        <h3 className={styles.title}>¿Aún no tienes cuenta?</h3>
        <button
          className={styles.registerButton}
          type="button"
          onClick={() => navigate("/register")}
        >
          Registrarse
        </button>
      </form>

      <NavLink to="/" className={styles.backLink}>
        Volver al inicio
      </NavLink>
    </main>
  );
};

export default Login;