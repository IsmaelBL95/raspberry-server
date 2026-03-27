// src/pages/Register.jsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "../styles/Login.module.css";

const initialFormData = {
  firstName: "",
  lastName: "",
  nickname: "",
  password: "",
  confirmPassword: "",
  birthDate: "",
};

const Register = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      return "El nombre es obligatorio.";
    }

    if (!formData.lastName.trim()) {
      return "Los apellidos son obligatorios.";
    }

    if (!formData.nickname.trim()) {
      return "El usuario es obligatorio.";
    }

    if (!formData.password) {
      return "La contraseña es obligatoria.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Las contraseñas no coinciden.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      nickname: formData.nickname.trim(),
      password: formData.password,
    };

    if (formData.birthDate) {
      payload.birthDate = formData.birthDate;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/identities/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 201) {
        setSuccessMessage("Usuario registrado correctamente.");
        setFormData(initialFormData);
        return;
      }

      if (response.status === 409) {
        setErrorMessage("Ese usuario ya existe.");
        return;
      }

      if (response.status === 400 || response.status === 500) {
        setErrorMessage("No se ha podido completar el registro.");
        return;
      }

      setErrorMessage("Ha ocurrido un error al registrar el usuario.");
    } catch {
      setErrorMessage("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <form className={styles.registerPageForm} onSubmit={handleSubmit}>
        <h3 className={styles.title}>Crear cuenta</h3>

        {errorMessage ? (
          <p className={styles.errorMessage}>{errorMessage}</p>
        ) : null}

        {successMessage ? (
          <p className={styles.successMessage}>{successMessage}</p>
        ) : null}

        <input
          className={styles.input}
          type="text"
          name="firstName"
          placeholder="Nombre"
          value={formData.firstName}
          onChange={handleChange}
          disabled={loading}
        />

        <input
          className={styles.input}
          type="text"
          name="lastName"
          placeholder="Apellidos"
          value={formData.lastName}
          onChange={handleChange}
          disabled={loading}
        />

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

        <input
          className={styles.input}
          type="password"
          name="confirmPassword"
          placeholder="Confirmar contraseña"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={loading}
        />

        <input
          className={styles.input}
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          disabled={loading}
        />

        <button className={styles.loginButton} type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>

      <NavLink to="/login" className={styles.backLink}>
        Volver a login
      </NavLink>
    </main>
  );
};

export default Register;