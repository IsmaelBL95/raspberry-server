import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

// Lazy load pages
const Home = lazy(() => import("./pages/Home.jsx"));
const RootAuth = lazy(() => import("./pages/RootAuth.jsx"));
const RootDashboard = lazy(() => import("./pages/RootDashboard.jsx"));

const LoadingFallback = () => <div>Cargando...</div>;

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/root/auth" element={<RootAuth />} />
          <Route path="/root/dashboard" element={<RootDashboard />} />
          <Route path="/root" element={<Navigate to="/root/dashboard" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
