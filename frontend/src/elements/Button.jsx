import React from 'react';
import styles from './styles/Button.module.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  className = '', 
  ...props 
}) => {
  // Acceso a las clases mediante el objeto styles
  // Usamos template literals para combinar la clase base, la variante y el tamaño
  const btnClasses = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`;

  return (
    <button className={btnClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;