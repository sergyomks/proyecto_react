import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente que redirige a los usuarios a rutas permitidas según su rol
 * Si el usuario intenta acceder a una ruta no permitida, lo redirige a su ruta por defecto
 */
const RoleBasedRedirect = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Rutas permitidas por rol
  const allowedRoutes = {
    ADMIN: ['/dashboard', '/pos', '/products', '/categories', '/inventory', '/sales', '/clients', '/reports', '/users', '/settings'],
    VENDEDOR: ['/dashboard', '/pos', '/products', '/categories', '/sales', '/clients'],
    CAJERO: ['/pos']
  };

  // Ruta por defecto según el rol
  const defaultRoutes = {
    ADMIN: '/dashboard',
    VENDEDOR: '/dashboard',
    CAJERO: '/pos'
  };

  const userRole = user?.rol;
  const currentPath = location.pathname;

  // Si no hay rol definido, permitir acceso (el ProtectedRoute manejará la autenticación)
  if (!userRole) {
    return children;
  }

  const userAllowedRoutes = allowedRoutes[userRole] || [];
  const userDefaultRoute = defaultRoutes[userRole] || '/pos';

  // Verificar si la ruta actual está permitida para el rol
  const isRouteAllowed = userAllowedRoutes.some((route) => currentPath.startsWith(route));

  // Si la ruta no está permitida, redirigir a la ruta por defecto
  if (!isRouteAllowed) {
    return <Navigate to={userDefaultRoute} replace />;
  }

  return children;
};

export default RoleBasedRedirect;
