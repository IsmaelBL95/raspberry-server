// src/pages/MainLayout.jsx
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import { useIdentitySession } from "../hooks/useIdentitySession.js";

export default function Home() {
  const navigate = useNavigate();
  const session = useIdentitySession();
  const { identity, loading, isAuthenticated, logout } = session;

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <Header
        identity={identity}
        loading={loading}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
      <Outlet context={session} />
    </>
  );
}