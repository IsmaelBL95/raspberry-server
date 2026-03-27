// src/components/Header.jsx
import { NavLink } from "react-router-dom";
import styles from "../styles/Header.module.css";

export default function Header({
  identity,
  loading,
  isAuthenticated,
  onLogout,
}) {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <img src="/PinkHeart.svg" alt="Logo" />
          <img className={styles.title} src="/PinkTitle.svg" alt="Logo" />
        </div>

        <div className={styles.sessionZone}>
          {loading ? (
            <span className={styles.sessionText}>Comprobando sesión...</span>
          ) : null}

          {!loading && isAuthenticated ? (
            <>
              <span className={styles.sessionText}>
                Hola, {identity.firstName || identity.nickname}
              </span>
              <button
                className={styles.logoutBtn}
                type="button"
                onClick={onLogout}
              >
                Cerrar sesión
              </button>
            </>
          ) : null}

          {!loading && !isAuthenticated ? (
            <NavLink to="/login">
              <button className={styles.loginBtn} type="button">
                Iniciar sesión
              </button>
            </NavLink>
          ) : null}
        </div>
      </div>
    </header>
  );
}