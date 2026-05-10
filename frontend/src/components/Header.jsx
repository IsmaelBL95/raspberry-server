import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoimage from '../assets/PinkHeart.svg';
import logotext from '../assets/PinkTitle.svg';
import { Button } from '../elements/index';
import { DropdownMenu } from '../components/index';
import { useAuth } from '../context/AuthContext';
import styles from './styles/Header.module.css';

const Logo = () => {
  return (
    <div className={styles.logo}>
      <img className={styles.logoImage} src={logoimage} alt="Logo" />
      <img className={styles.logoText} src={logotext} alt="Logo Text" />
    </div>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.nickname || '';

  const navItems = [
    {
      label: 'Mi Perfil',
      onClick: () => {
        const profileSlug = user?.nicknameCanonical || user?.nickname;
        if (profileSlug) {
          navigate(`/profile/${profileSlug}`);
        }
      },
    },
    {
      label: 'Ajustes',
      onClick: () => console.log('Abriendo ajustes...'),
    },
    {
      label: 'Cerrar sesion',
      isPrimary: true,
      onClick: logout,
    },
  ];

  return (
    <header className={styles.header}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Logo />
      </Link>
      {isLoading ? null : isAuthenticated ? (
        <DropdownMenu
          user={{ name: displayName, image: null }}
          menuItems={navItems}
        />
      ) : (
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <Button>Iniciar sesion</Button>
        </Link>
      )}
    </header>
  );
};

export default Header;
