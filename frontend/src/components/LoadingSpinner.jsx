import React from 'react';

const LoadingSpinner = () => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: 'transparent'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #C43285',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};

export default LoadingSpinner;