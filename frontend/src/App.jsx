import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles/global.css';

// 1. Cargamos los Layouts de forma normal (suelen ser ligeros y se usan siempre)
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// 2. Cargamos las páginas de forma perezosa (Lazy Loading)
const Home = lazy(() => import('./pages/Home'));
const UsersList = lazy(() => import('./pages/UsersList'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminUserDetail = lazy(() => import('./pages/admin/AdminUserDetail'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));

// Componente de carga (puedes usar un Spinner más bonito)
const Loading = lazy(() => import('./components/LoadingSpinner'));

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Suspense fallback={<Loading />}><Home /></Suspense> },
      { path: "users", element: <Suspense fallback={<Loading />}><UsersList /></Suspense> },
      { path: "profile/:id", element: <Suspense fallback={<Loading />}><UserProfile /></Suspense> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Suspense fallback={<Loading />}><AdminDashboard /></Suspense> },
      { path: "users", element: <Suspense fallback={<Loading />}><AdminUsers /></Suspense> },
      { path: "users/:id", element: <Suspense fallback={<Loading />}><AdminUserDetail /></Suspense> },
    ],
  },
  {
    path: "/login",
    element: <Suspense fallback={<Loading />}><Login /></Suspense>,
  },
  {
    path: "/register",
    element: <Suspense fallback={<Loading />}><Register /></Suspense>,
  },
  {
    path: "/admin/auth",
    element: <Suspense fallback={<Loading />}><AdminLogin /></Suspense>,
  },
  {
    path: "/loading",
    element: <Loading />,
  },
  {
    path: "*",
    element: <main><h1>404 - Página no encontrada</h1></main>,
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;