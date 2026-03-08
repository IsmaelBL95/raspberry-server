import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

// Lazy loaded routes and pages.  Lazy loading defers loading of the
// modules until they are requested, reducing initial bundle size.
const Home = lazy(() => import("./pages/Home.jsx"));
const RootAuth = lazy(() => import("./routes/root/RootAuth.jsx"));
const RootLayout = lazy(() => import("./routes/root/RootLayout.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

// Nested routes inside the root dashboard.  These are scoped to
// children of RootLayout.
const DashboardHome = lazy(() => import("./routes/root/DashboardHome.jsx"));
const DashboardUsers = lazy(() => import("./routes/root/DashboardUsers.jsx"));

// Fallback component displayed while lazy components are loading.
const LoadingFallback = () => <div>Cargando...</div>;

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/root/auth" element={<RootAuth />} />
          <Route path="/root/dashboard" element={<RootLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="users" element={<DashboardUsers />} />
          </Route>
          {/* Redirect /root to /root/dashboard for backwards compatibility */}
          <Route path="/root" element={<Navigate to="/root/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;