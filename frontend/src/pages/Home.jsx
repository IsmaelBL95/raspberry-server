import ThankList from '../components/ThankList';

const Home = () => {
  return (
    <main style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '80px 20px 24px' }}>
      <section style={{ width: '100%', maxWidth: '800px' }}>
        <ThankList />
      </section>
    </main>
  );
};

export default Home;
