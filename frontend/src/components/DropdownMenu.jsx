import React, { useState, useRef, useEffect } from 'react';
import Avatar from '../elements/Avatar';
import styles from './styles/DropdownMenu.module.css';

const DropdownMenu = ({ user, menuItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.container} ref={menuRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Avatar src={user?.image} name={user?.name} />
      </button>

      {isOpen && (
        <ul className={styles.menu}>
          {menuItems.map((item, index) => {
            // Combinamos la clase base con una clase específica si existe en el item
            const itemClass = `${styles.menuItem} ${item.isPrimary ? styles.primary : ''} ${item.className || ''}`;

            return (
              <li
                key={index}
                className={itemClass}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
              >
                {item.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default DropdownMenu;