import { Link, Outlet } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="app-shell">
      <header>
        <h1>Frontend con React + React Router</h1>
        <nav>
          <Link to="/">Inicio</Link>
          <Link to="/about">Acerca</Link>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
