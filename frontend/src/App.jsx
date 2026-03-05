import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

// Lazy load pages
const Home = lazy(() => import("./pages/Home.jsx"));
const RootAuth = lazy(() => import("./pages/root_pages/RootAuth.jsx"));
const RootDashboard = lazy(() => import("./pages/root_pages/RootDashboard.jsx"));

const NotFound = lazy(() => import("./pages/NotFound.jsx"));

// páginas internas del dashboard
const DashboardHome = lazy(() => import("./pages/root_pages/DashboardHome.jsx"));
const DashboardUsers = lazy(() => import("./pages/root_pages/DashboardUsers.jsx"));

const LoadingFallback = () => <div>Cargando...</div>;

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/root/auth" element={<RootAuth />} />
          <Route path="/root/dashboard" element={<RootDashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="users" element={<DashboardUsers />} />
          </Route>

          <Route path="/root" element={<Navigate to="/root/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
