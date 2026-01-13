import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader/Loader';

// Rutas permitidas por rol
const allowedRoutes = {
  ADMIN: [
    '/dashboard',
    '/pos',
    '/products',
    '/categories',
    '/inventory',
    '/sales',
    '/clients',
    '/reports',
    '/users',
    '/settings',
    '/ecommerce',
    '/segmentation'
  ],
  VENDEDOR: ['/dashboard', '/pos', '/products', '/categories', '/sales', '/clients'],
  CAJERO: ['/pos']
};

// Ruta por defecto según el rol
const defaultRoutes = {
  ADMIN: '/dashboard',
  VENDEDOR: '/dashboard',
  CAJERO: '/pos'
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar permisos de ruta según el rol
  const userRole = user?.rol;
  const currentPath = location.pathname;

  if (userRole) {
    const userAllowedRoutes = allowedRoutes[userRole] || [];
    const userDefaultRoute = defaultRoutes[userRole] || '/pos';

    // Verificar si la ruta actual está permitida para el rol
    const isRouteAllowed = userAllowedRoutes.some((route) => currentPath.startsWith(route));

    // Si la ruta no está permitida, redirigir a la ruta por defecto
    if (!isRouteAllowed && currentPath !== userDefaultRoute) {
      return <Navigate to={userDefaultRoute} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
