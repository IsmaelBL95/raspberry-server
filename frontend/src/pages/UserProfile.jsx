import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar } from '../elements';
import { LoadingSpinner, Tabs, Tab } from '../components';
import ThankList from '../components/ThankList';
import styles from '../styles/UserProfile.module.css';

// Datos de prueba (Mock Data)
const MOCK_THANKS = [
  {
    id: "1",
    fromUser: { nickname: "Leotroy", avatarUrl: "/avatars/leotroy.jpg" },
    toUser: { nickname: "Admin", avatarUrl: "/avatars/admin.jpg" },
    amount: 3,
    reason: "Por ayudarme con la configuración del servidor.",
    timestamp: "2023-10-27T10:30:00Z"
  },
  {
    id: "2",
    fromUser: { nickname: "Admin", avatarUrl: "/avatars/admin.jpg" },
    toUser: { nickname: "Leotroy", avatarUrl: "/avatars/leotroy.jpg" },
    amount: 5,
    reason: "Excelente documentación del proyecto.",
    timestamp: "2023-10-28T15:45:00Z"
  },
  {
    id: "3",
    fromUser: { nickname: "LauraDev", avatarUrl: "/avatars/laura.jpg" },
    toUser: { nickname: "Leotroy", avatarUrl: "/avatars/leotroy.jpg" },
    amount: 2,
    reason: "Gracias por detectar el bug en producción tan rápido.",
    timestamp: "2023-10-29T08:15:00Z"
  },
  {
    id: "4",
    fromUser: { nickname: "Carlos", avatarUrl: "/avatars/carlos.jpg" },
    toUser: { nickname: "LauraDev", avatarUrl: "/avatars/laura.jpg" },
    amount: 4,
    reason: "Tu apoyo con el diseño de la base de datos fue clave.",
    timestamp: "2023-10-29T14:20:00Z"
  },
  {
    id: "5",
    fromUser: { nickname: "SofiaQA", avatarUrl: "/avatars/sofia.jpg" },
    toUser: { nickname: "Carlos", avatarUrl: "/avatars/carlos.jpg" },
    amount: 1,
    reason: "Por revisar mis tests automatizados.",
    timestamp: "2023-10-30T09:10:00Z"
  },
  {
    id: "6",
    fromUser: { nickname: "Admin", avatarUrl: "/avatars/admin.jpg" },
    toUser: { nickname: "SofiaQA", avatarUrl: "/avatars/sofia.jpg" },
    amount: 6,
    reason: "Gran trabajo coordinando la entrega del sprint.",
    timestamp: "2023-10-30T17:55:00Z"
  },
  {
    id: "7",
    fromUser: { nickname: "MiguelOps", avatarUrl: "/avatars/miguel.jpg" },
    toUser: { nickname: "Admin", avatarUrl: "/avatars/admin.jpg" },
    amount: 3,
    reason: "Gracias por resolver el problema de acceso al panel.",
    timestamp: "2023-10-31T11:40:00Z"
  },
  {
    id: "8",
    fromUser: { nickname: "Leotroy", avatarUrl: "/avatars/leotroy.jpg" },
    toUser: { nickname: "MiguelOps", avatarUrl: "/avatars/miguel.jpg" },
    amount: 4,
    reason: "Tu guía con Docker me ahorró muchísimo tiempo.",
    timestamp: "2023-11-01T13:25:00Z"
  },
  {
    id: "9",
    fromUser: { nickname: "ElenaUX", avatarUrl: "/avatars/elena.jpg" },
    toUser: { nickname: "Leotroy", avatarUrl: "/avatars/leotroy.jpg" },
    amount: 2,
    reason: "Gracias por implementar los cambios de interfaz tan rápido.",
    timestamp: "2023-11-02T16:05:00Z"
  },
  {
    id: "10",
    fromUser: { nickname: "Admin", avatarUrl: "/avatars/admin.jpg" },
    toUser: { nickname: "ElenaUX", avatarUrl: "/avatars/elena.jpg" },
    amount: 5,
    reason: "Excelente propuesta de mejora para la experiencia de usuario.",
    timestamp: "2023-11-03T12:00:00Z"
  }
];

const UserProfile = () => {
  const { nickname } = useParams();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulamos una carga de red breve para probar el LoadingSpinner
    const timer = setTimeout(() => {
      setProfile({
        nickname: nickname,
        firstName: "Don Leotroy",
        lastName: "de los Benavente",
        avatarUrl: null,
        bio: "Esta es una biografía de prueba para verificar el layout.",
        createdAt: "2023-01-01T00:00:00Z",
        thanks: MOCK_THANKS // Inyectamos el JSON directamente aquí
      });
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [nickname]);

  if (isLoading) return <LoadingSpinner />;
  if (!profile) return null;

  return (
    <main className={styles.profilePage}>
      <header className={styles.banner}>
        <div className={styles.avatarOverlap}>
          <Avatar src={profile.avatarUrl} name={profile.nickname} size="XXL" />
        </div>
      </header>

      <section className={styles.content}>
        <div className={styles.userHeader}>
          <h1 className={styles.nickname}>{profile.nickname}</h1>
          <p className={styles.realName}>{profile.firstName} {profile.lastName}</p>
        </div>

        <div className={styles.tabsWrapper}>
          <Tabs position="center">
            <Tab label="Información">
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Bio</label>
                  <p>{profile.bio}</p>
                </div>
                <div className={styles.infoItem}>
                  <label>Miembro desde</label>
                  <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </Tab>

            <Tab label="Agradecimientos">
              <div className={styles.tabContent}>
                <ThankList
                  thanks={profile.thanks}
                  targetNickname={nickname}
                />
              </div>
            </Tab>
          </Tabs>
        </div>
      </section>
    </main>
  );
};

export default UserProfile;