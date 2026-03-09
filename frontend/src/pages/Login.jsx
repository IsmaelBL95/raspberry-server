import { NavLink } from 'react-router-dom';
import styles from '../styles/Login.module.css';

const Login = () => {
  return (
    <main className={styles.container}>
      <form className={styles.loginForm}>
        <h3 className={styles.title}>Identificación</h3>
        <input className={styles.input} type="text" placeholder="Usuario" />
        <input className={styles.input} type="password" placeholder="Contraseña" />
        <button className={styles.loginButton} type="submit">
          Iniciar sesión
        </button>
      </form>

      <form className={styles.registerForm}>
        <h3 className={styles.title}>¿Aún no tienes cuenta?</h3>
        <button className={styles.registerButton} type="button">
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