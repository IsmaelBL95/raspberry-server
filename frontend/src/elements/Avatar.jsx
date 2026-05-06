import React, { useState } from 'react';
import styles from './styles/Avatar.module.css';
import avatarPlaceholder from '../assets/AvatarPlaceholder.png';

const Avatar = ({ src, name = '', size = 'medium' }) => {
  const [imgError, setImgError] = useState(false);

  // Generar iniciales (Máximo 2 letras)
  const getInitials = (fullname) => {
    if (!fullname) return null; // Retorna null si no hay nombre
    return fullname
      .split(' ')
      .filter(n => n.length > 0) // Evita errores con espacios múltiples
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const containerClasses = `${styles.avatar} ${styles[size]}`;
  const initials = getInitials(name);

  return (
    <div className={containerClasses}>
      {src && !imgError ? (
        <img 
          src={src} 
          alt={name} 
          onError={() => setImgError(true)} 
          className={styles.image}
        />
      ) : initials ? (
        <span className={styles.initials}>{initials}</span>
      ) : (
        <img 
          src={avatarPlaceholder} 
          alt="Placeholder" 
          className={styles.image} 
        />
      )}
    </div>
  );
};

export default Avatar;