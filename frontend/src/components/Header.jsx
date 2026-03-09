import { NavLink } from "react-router-dom";
import styles from '../styles/Header.module.css';

export default function Header() {

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <img src="/PinkHeart.svg" alt="Logo" />
          <img className={styles.title} src="/PinkTitle.svg" alt="Logo" />
        </div>

        <div className={styles.sessionZone}>
          <NavLink to="/login">
            <button className={styles.loginBtn}>Iniciar sesión</button>
          </NavLink>
        </div>
      </div>

    </header>
  );
}