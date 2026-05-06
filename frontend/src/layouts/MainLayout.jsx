import { Outlet } from 'react-router-dom';
import { Header } from '../components/index';

const MainLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default MainLayout;