// src/components/Header.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "../styles/Header.module.css";

function getInitials(identity) {
  if (!identity) return "";

  const first = identity.firstName?.[0] || "";
  const last = identity.lastName?.[0] || "";

  if (first || last) {
    return (first + last).toUpperCase();
  }

  return identity.nickname?.[0]?.toUpperCase() || "";
}

export default function Header({
  identity,
  loading,
  isAuthenticated,
  onLogout,
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setOpen((prev) => !prev);

  const handleProfile = () => {
    setOpen(false);
    navigate("/profile");
  };

  const handleLogout = async () => {
    setOpen(false);
    await onLogout();
  };

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
            <div className={styles.avatarWrapper}>
              <button
                type="button"
                className={styles.avatarButton}
                onClick={toggleMenu}
              >
                {getInitials(identity)}
              </button>

              {open ? (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    {identity.firstName || identity.nickname}
                  </div>

                  <button
                    className={styles.dropdownItem}
                    onClick={handleProfile}
                  >
                    Mi perfil
                  </button>

                  <button
                    className={styles.dropdownItem}
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : null}
            </div>
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