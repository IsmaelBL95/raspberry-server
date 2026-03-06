import styles from '../styles/Header.module.css';


export default function Header() {
  return (
    <header className={styles.header}>
        <div className={styles.logo}>
            <img src="/PinkHeart.svg" alt="Logo" />
        </div>
        <div className={styles.sessionZone}>
            <button className={styles.loginButton}>Iniciar sesión</button>
        </div>
    </header>
  );
}