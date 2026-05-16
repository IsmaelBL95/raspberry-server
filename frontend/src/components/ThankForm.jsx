import React, { useMemo, useState } from 'react';
import heartIcon from '../assets/PinkHeart.svg';
import styles from './styles/ThankForm.module.css';

const VALUES = [1, 2, 3, 4, 5];

const ThankForm = ({ toUserNickname, onSuccess }) => {
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const remainingChars = useMemo(() => 280 - reason.length, [reason]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!toUserNickname) {
      setError('No se pudo identificar el destinatario.');
      return;
    }

    if (!reason.trim()) {
      setError('El motivo es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/thanks', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toUser: toUserNickname,
          amount,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'No se pudo enviar el agradecimiento.');
      }

      setAmount(1);
      setReason('');

      if (typeof onSuccess === 'function') {
        onSuccess(data);
      }
    } catch (submitError) {
      setError(submitError.message || 'Error enviando agradecimiento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.title}>Enviar agradecimiento</h3>

      <div className={styles.amountGroup}>
        {VALUES.map((value) => (
          <button
            key={value}
            type="button"
            className={`${styles.amountButton} ${amount === value ? styles.active : ''}`}
            onClick={() => setAmount(value)}
            aria-label={`Seleccionar ${value} corazon${value > 1 ? 'es' : ''}`}
          >
            <img src={heartIcon} alt="" aria-hidden="true" />
            <span>{value}</span>
          </button>
        ))}
      </div>

      <label className={styles.label} htmlFor="thanks-reason">Motivo</label>
      <textarea
        id="thanks-reason"
        className={styles.textarea}
        value={reason}
        maxLength={280}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Escribe por que quieres agradecer..."
      />

      <div className={styles.footer}>
        <small className={styles.counter}>{remainingChars} caracteres restantes</small>
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Agradecer'}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
};

export default ThankForm;
