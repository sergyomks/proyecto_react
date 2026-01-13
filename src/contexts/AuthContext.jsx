import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión al iniciar
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);

      if (savedToken && savedUser) {
        try {
          // Validar token con el backend
          const { valid, user: validatedUser } = await authApi.validateToken();

          if (valid && validatedUser) {
            setUser(validatedUser);
            setToken(savedToken);
          } else {
            // Token inválido, limpiar sesión
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          }
        } catch (error) {
          console.error('Error validando sesión:', error);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    try {
      const { token: newToken, user: userData } = await authApi.login(email, password);

      setUser(userData);
      setToken(newToken);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Error al iniciar sesión' };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
    }
  }, []);

  // Verificar permiso basado en rol
  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;

      const rolePermissions = {
        ADMIN: ['all', 'users', 'products', 'categories', 'sales', 'reports', 'inventory', 'settings', 'clients'],
        VENDEDOR: ['products', 'categories', 'sales', 'pos', 'clients'],
        CAJERO: ['pos', 'sales']
      };

      const userPermissions = rolePermissions[user.rol] || [];
      return userPermissions.includes('all') || userPermissions.includes(permission);
    },
    [user]
  );

  // Verificar si es admin
  const isAdmin = useCallback(() => {
    return user?.rol === 'ADMIN';
  }, [user]);

  // Refrescar datos del usuario
  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const { valid, user: validatedUser } = await authApi.validateToken();
      if (valid && validatedUser) {
        setUser(validatedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(validatedUser));
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error refrescando usuario:', error);
    }
  }, [token, logout]);

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    logout,
    hasPermission,
    isAdmin,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;
