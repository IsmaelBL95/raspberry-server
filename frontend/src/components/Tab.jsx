import React, { useState } from 'react';
import styles from './styles/Tab.module.css';

/**
 * Componente Tabs
 * @param {string} position - Determina la alineación de las pestañas ('left', 'right', 'center'). Por defecto 'center'.
 */
const Tabs = ({ children, position = 'center' }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Función para asignar la clase de posicionamiento basada en la prop 'position'
  const getPositionClass = () => {
    switch (position) {
      case 'left':
        return styles.left;
      case 'right':
        return styles.right;
      default:
        return ''; // El centro es el valor por defecto en el CSS
    }
  };

  return (
    <div className={styles.tabsContainer}>
      {/* Lista de pestañas con clases combinadas */}
      <div 
        className={`${styles.tabsList} ${getPositionClass()}`} 
        role="tablist"
      >
        {React.Children.map(children, (child, index) => {
          if (!child) return null;

          return (
            <button
              key={index}
              role="tab"
              aria-selected={activeIndex === index}
              className={activeIndex === index ? styles.active : ''}
              onClick={() => setActiveIndex(index)}
            >
              {child.props.label}
            </button>
          );
        })}
      </div>

      {/* Panel de contenido */}
      <div className={styles.tabsPanel} role="tabpanel">
        {React.Children.toArray(children)[activeIndex]}
      </div>
    </div>
  );
};

/**
 * Subcomponente Tab (Wrapper de contenido)
 */
const Tab = ({ children }) => {
  return <>{children}</>;
};

export { Tabs, Tab };