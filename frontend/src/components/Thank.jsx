import React from 'react';
import { Avatar } from '../elements';
import logoimage from '../assets/PinkHeart.svg';
import styles from './styles/Thank.module.css'; // Asegura la ruta correcta

const Thank = ({ fromUser, toUser, amount, reason, timestamp }) => {
  const date = new Date(timestamp).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className={styles.thankCard}>
      <div className={styles.visualSide}>
        <div className={styles.avatarStack}>
          <div className={styles.avatarWrapper} title={`De: ${fromUser.nickname}`}>
            <Avatar src={fromUser.avatarUrl} name={fromUser.nickname} size="M" />
          </div>
          
          <div className={styles.connector}>
            <div className={styles.badgeContainer}>
              <img className={styles.heartIcon} src={logoimage} alt="Corazón" />
              <span className={styles.amountBadge}>{amount}</span>
            </div>
          </div>

          <div className={styles.avatarWrapper} title={`Para: ${toUser.nickname}`}>
            <Avatar src={toUser.avatarUrl} name={toUser.nickname} size="M" />
          </div>
        </div>
      </div>

      <div className={styles.infoSide}>
        <div className={styles.header}>
          <span className={styles.usersLog}>
            <strong>{fromUser.nickname}</strong> agradeció a <strong>{toUser.nickname}</strong>
          </span>
          <time className={styles.date}>{date}</time>
        </div>
        <blockquote className={styles.reason}>
          “{reason}”
        </blockquote>
      </div>
    </div>
  );
};

export default Thank;