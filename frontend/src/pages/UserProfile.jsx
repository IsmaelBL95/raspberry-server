import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar } from '../elements';
import { LoadingSpinner } from '../components';
import { Tabs, Tab } from '../components';
import styles from '../styles/UserProfile.module.css';

const UserProfile = () => {
  const { nickname } = useParams();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/identities/${nickname}`, {
          method: 'GET',
        });

        const data = await response.json();

        if (!response.ok || !data?.success || !data?.identity) {
          throw new Error(data?.error || 'No se pudo cargar el perfil');
        }

        if (isMounted) {
          setProfile(data.identity);
        }
      } catch (fetchError) {
        if (isMounted) {
          setProfile(null);
          setError(fetchError.message || 'Error al cargar el perfil');
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

  if (isLoading) {
    return <main><LoadingSpinner /></main>;
  }

  if (error) {
    return <main><h1>{error}</h1></main>;
  }

  /*
  <Avatar
        src={profile.avatarUrl}
        alt={`${profile.nickname}'s avatar`}
        name={profile.nickname}
        size="XXL"
        className={styles.avatar}
      />
  */

  return (
    <main>
      <div className={styles.profileHeader}>
        <div className={styles.profileHeaderContainer}>
          <div className={styles.profilePicture}>
            <Avatar
              src={profile.avatarUrl}
              alt={`${profile.nickname}'s avatar`}
              name={profile.nickname}
              size="XXL"
              className={styles.avatar}
            />
          </div>
        </div>
      </div>
      <div className={styles.profileContent}>
        <Tabs position="right">
          <Tab label="Historial">

          </Tab>
          <Tab label="Información">

          </Tab>
        </Tabs>
      </div>
    </main>
  );
};

export default UserProfile;