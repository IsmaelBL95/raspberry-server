import styles from '../styles/Header.module.css';

export default function Header() {
  // Simulación de estado: cambia a 'null' para ver el botón de "Iniciar sesión"
  const user = null
  //const user = {name: "Alex",image: "/avatar.png"};

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src="/PinkHeart.svg" alt="Logo" />
        <img className={styles.title} src="/PinkTitle.svg" alt="Logo" />
      </div>

      <div className={styles.sessionZone}>
        {user ? (
          /* Si hay usuario, mostramos el Avatar */
          <div className={styles.avatar}>
            <img
              src={user.image || "/avatar-placeholder.png"}
              onError={(e) => { e.target.src = "/avatar-placeholder.png"; }}
              alt={user.name}
            />
          </div>
        ) : (
          /* Si no hay usuario (null), mostramos el botón */
          <button className={styles.loginBtn}>Iniciar sesión</button>
        )}
      </div>
    </header>
  );
}