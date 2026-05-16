import React from 'react';
import { Avatar } from '../elements';
import pinkHeart from '../assets/PinkHeart.svg';
import styles from './styles/Thank.module.css';

const Thank = ({ fromUser, toUser, amount, reason, timestamp }) => {
  const date = new Date(timestamp).toLocaleDateString('es-ES');

  return (
    <article className={styles.thankCard}>
      <div className={styles.visualSide}>
        <div className={styles.avatarStack}>
          <div className={styles.avatarWrapper} title={`De: ${fromUser?.nickname || 'Usuario'}`}>
            <Avatar src={fromUser?.avatarUrl} name={fromUser?.nickname} size="M" />
          </div>

          <div className={styles.connector} aria-hidden="true">
            <div className={styles.amountBadge}>
              <img className={styles.heartIcon} src={pinkHeart} alt="" />
              <span>{amount}</span>
            </div>
          </div>

          <div className={styles.avatarWrapper} title={`Para: ${toUser?.nickname || 'Usuario'}`}>
            <Avatar src={toUser?.avatarUrl} name={toUser?.nickname} size="M" />
          </div>
        </div>
      </div>

      <div className={styles.infoSide}>
        <header className={styles.header}>
          <span className={styles.usersLog}>
            <strong>{fromUser?.nickname || 'Usuario'}</strong> agradecio a <strong>{toUser?.nickname || 'Usuario'}</strong>
          </span>
          <time className={styles.date}>{date}</time>
        </header>

        <p className={styles.reason}>{reason}</p>
      </div>
    </article>
  );
};

export default Thank;
