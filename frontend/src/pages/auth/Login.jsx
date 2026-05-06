// src/pages/auth/Login.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../elements/index';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    user: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Actualiza formulario y limpia errores del campo.
   */
  const handleChange = (e) => {
    const { id, value } = e.target;

    const fieldName = id === 'user-name' ? 'user' : 'password';

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value
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
   * Backend sigue siendo la validación real.
   */
  const validateForm = () => {
    const newErrors = {};

    const username = formData.user.trim();

    if (!username) {
      newErrors['user-name'] = 'El usuario es obligatorio';

    } else if (username.length < 3) {
      newErrors['user-name'] = 'Usuario inválido';

    } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
      newErrors['user-name'] = 'Solo letras y números';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';

    } else if (formData.password.length < 8) {
      newErrors.password = 'Contraseña inválida';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /**
   * Envío de login.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/identities/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        // Necesario para cookies HttpOnly
        credentials: 'include',

        body: JSON.stringify({
          user: formData.user.trim(),
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrors({
          server: data.error || 'Error de autenticación'
        });

        return;
      }

      await refreshUser();
      navigate('/dashboard');

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
      <form
        className={styles.formCard}
        onSubmit={handleSubmit}
      >
        <h2>Iniciar sesión</h2>

        {errors.server && (
          <div
            className={styles.errorBanner}
            style={{
              color: 'red',
              marginBottom: '10px'
            }}
          >
            {errors.server}
          </div>
        )}

        {/* Usuario */}
        <div>
          <div
            className={`${styles.inputWrapper} ${
              errors['user-name'] ? styles.errorContainer : ''
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
              id="user-name"
              type="text"
              className={`${styles.inputField} ${
                errors['user-name'] ? styles.inputError : ''
              }`}
              placeholder="Usuario"
              value={formData.user}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          {errors['user-name'] && (
            <span className={styles.errorText}>
              {errors['user-name']}
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
              autoComplete="current-password"
            />
          </div>

          {errors.password && (
            <span className={styles.errorText}>
              {errors.password}
            </span>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Accediendo...' : 'Entrar'}
        </Button>

        <Link
          className={styles.link}
          to="/forgot-password"
        >
          He olvidado mi <strong>contraseña</strong>
        </Link>

        <hr className={styles.divider} />

        <Link
          className="outline"
          style={{ textAlign: 'center' }}
          to="/register"
        >
          Crear cuenta
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

export default Login;
