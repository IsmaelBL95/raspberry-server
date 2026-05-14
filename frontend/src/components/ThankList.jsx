import React from 'react';
import Thank from './Thank';
import styles from './styles/ThankList.module.css';

const ThankList = ({ thanks, targetNickname }) => {
  if (!thanks || thanks.length === 0) {
    return <p className={styles.emptyMessage}>No hay agradecimientos que mostrar.</p>;
  }

  // Filtrado lógico: Agradecimientos donde el usuario es origen o destino
  const relatedThanks = thanks.filter(t => 
    t.fromUser.nickname === targetNickname || t.toUser.nickname === targetNickname
  );

  if (relatedThanks.length === 0) {
    return <p className={styles.emptyMessage}>Este usuario aún no tiene actividad de agradecimientos.</p>;
  }

  return (
    <section className={styles.listContainer}>
      {relatedThanks.map((item) => (
        <Thank 
          key={item.id} 
          fromUser={item.fromUser}
          toUser={item.toUser}
          amount={item.amount}
          reason={item.reason}
          timestamp={item.timestamp}
          // Pasamos una prop extra opcional para resaltar si es recibido o enviado
          isReceived={item.toUser.nickname === targetNickname}
        />
      ))}
    </section>
  );
};

export default ThankList;