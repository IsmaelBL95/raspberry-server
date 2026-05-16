import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar } from '../elements';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, Tabs, Tab } from '../components';
import ThankList from '../components/ThankList';
import ThankForm from '../components/ThankForm';
import styles from '../styles/UserProfile.module.css';

const UserProfile = () => {
  const { nickname } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [thanksRefreshKey, setThanksRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/identities/${encodeURIComponent(nickname)}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Profile not found');
        }

        const data = await response.json();

        if (isMounted) {
          setProfile(data?.identity || null);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        if (isMounted) {
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [nickname]);

  if (isLoading) return <LoadingSpinner />;
  if (!profile) return null;

  const isOwnProfile = Boolean(user?.nickname && profile?.nickname && user.nickname === profile.nickname);
  const canThank = isAuthenticated && !isOwnProfile;

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
            <Tab label="Informacion">
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Bio</label>
                  <p>{profile.bio || 'Sin bio'}</p>
                </div>
                <div className={styles.infoItem}>
                  <label>Miembro desde</label>
                  <p>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('es-ES') : '-'}</p>
                </div>
              </div>
            </Tab>

            <Tab label="Agradecimientos">
              <div className={styles.tabContent}>
                {canThank && (
                  <ThankForm
                    toUserNickname={profile.nickname}
                    onSuccess={() => setThanksRefreshKey((prev) => prev + 1)}
                  />
                )}
                <ThankList nickname={profile.nickname} refreshKey={thanksRefreshKey} />
              </div>
            </Tab>
          </Tabs>
        </div>
      </section>
    </main>
  );
};

export default UserProfile;
