// src/pages/auth/Register.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../elements/index';
import styles from '../../styles/Login.module.css';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    user: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Actualiza campos dinámicamente y limpia errores asociados.
   */
  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));

    if (errors[id] || errors.server) {
      setErrors((prev) => ({
        ...prev,
        [id]: null,
        server: null
      }));
    }
  };

  /**
   * Validación frontend (UX).
   * El backend sigue siendo la autoridad real.
   */
  const validateForm = () => {
    const newErrors = {};

    const username = formData.user.trim();

    if (!username) {
      newErrors.user = 'El usuario es obligatorio';

    } else if (username.length < 3) {
      newErrors.user = 'El usuario debe tener al menos 3 caracteres';

    } else if (username.length > 30) {
      newErrors.user = 'Máximo 30 caracteres';

    } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
      newErrors.user = 'Solo letras y números';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';

    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes repetir la contraseña';

    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /**
   * Envío de registro.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/identities/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: formData.user.trim(),
          password: formData.password,
          password_confirmation: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 409) {
          setErrors({
            user: 'Este nombre de usuario ya está registrado'
          });

        } else {
          setErrors({
            server: data.error || 'Error en el registro'
          });
        }

        return;
      }

      // Registro correcto
      navigate('/login');

    } catch (error) {
      setErrors({
        server: 'Error de conexión con el servidor'
      });

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.loginPage}>
      <form className={styles.formCard} onSubmit={handleSubmit}>
        <h2>Crear cuenta</h2>

        {errors.server && (
          <div
            className={styles.errorBanner}
            style={{
              color: 'red',
              marginBottom: '10px',
              textAlign: 'center'
            }}
          >
            {errors.server}
          </div>
        )}

        {/* Usuario */}
        <div>
          <div
            className={`${styles.inputWrapper} ${
              errors.user ? styles.errorContainer : ''
            }`}
          >
            <svg
              className={styles.icon}
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>

            <input
              id="user"
              type="text"
              className={`${styles.inputField} ${
                errors.user ? styles.inputError : ''
              }`}
              placeholder="Usuario"
              value={formData.user}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          {errors.user && (
            <span className={styles.errorText}>
              {errors.user}
            </span>
          )}
        </div>

        {/* Contraseña */}
        <div>
          <div
            className={`${styles.inputWrapper} ${
              errors.password ? styles.errorContainer : ''
            }`}
          >
            <svg
              className={styles.icon}
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                ry="2"
              ></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>

            <input
              id="password"
              type="password"
              className={`${styles.inputField} ${
                errors.password ? styles.inputError : ''
              }`}
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          {errors.password && (
            <span className={styles.errorText}>
              {errors.password}
            </span>
          )}
        </div>

        {/* Repetir contraseña */}
        <div>
          <div
            className={`${styles.inputWrapper} ${
              errors.confirmPassword ? styles.errorContainer : ''
            }`}
          >
            <svg
              className={styles.icon}
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>

            <input
              id="confirmPassword"
              type="password"
              className={`${styles.inputField} ${
                errors.confirmPassword ? styles.inputError : ''
              }`}
              placeholder="Repetir contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          {errors.confirmPassword && (
            <span className={styles.errorText}>
              {errors.confirmPassword}
            </span>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '10px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Registrando...' : 'Registrarse'}
        </Button>

        <hr className={styles.divider} />

        <Link
          className={styles.link}
          to="/login"
          style={{ textAlign: 'center' }}
        >
          ¿Ya tienes cuenta? <strong>Inicia sesión</strong>
        </Link>

        <Link
          className={styles.link}
          to="/"
          style={{ textAlign: 'center' }}
        >
          Volver
        </Link>
      </form>
    </main>
  );
};

export default Register;