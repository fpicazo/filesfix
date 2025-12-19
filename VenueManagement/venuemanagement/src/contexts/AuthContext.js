// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../config/http';
import { ROUTE_TO_MODULE } from '../utils/permissions';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(''); 
  const [allowedModules, setAllowedModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
          const user = await validateToken(token);
          setCurrentUser(user);
          setUserRole(user.role);
          setAllowedModules(user.allowedModules || []);
        }
      } catch (err) {
        console.error('Authentication error:', err);
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setIsLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await http.get('/api/users/validate');
      const data = response.data;
      
      if (data.user) {
        localStorage.setItem('userData', JSON.stringify({
          userId: data.user.userId,
          tenantId: data.user.tenantId,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          allowedModules: data.user.allowedModules || []
        }));
      }
      
      return data.user;
    } catch (error) {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      throw new Error('Token validation failed');
    }
  };

  const login = async (email, password, rememberMe = false) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await http.post('/api/users/login', { email, password });
      const data = response.data;

      if (rememberMe) {
        localStorage.setItem('authToken', data.token);
      } else {
        sessionStorage.setItem('authToken', data.token);
      }

      setCurrentUser(data.user);
      setUserRole(data.user.role);
      setAllowedModules(data.user.allowedModules || []);
      
      localStorage.setItem('userData', JSON.stringify({
        userId: data.user.userId,              
        tenantId: data.user.tenantId,
        name: data.user.name || '',
        email: data.user.email || '',
        role: data.user.role || '',
        allowedModules: data.user.allowedModules || []
      }));
      
      if (window.socketInstance) {
        window.socketInstance.disconnect();
        window.socketInstance = null;
      }
      
      navigate('/');
      return data.user;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during login';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await http.post('/api/tenants', userData);
      const data = response.data;

      localStorage.setItem('authToken', data.token);
      
      setCurrentUser(data.user);
      setUserRole(data.user.role || 'admin'); 
      setAllowedModules(data.user.allowedModules || []);
      
      localStorage.setItem('userData', JSON.stringify({
        userId: data.user.userId,
        tenantId: data.user.tenantId,
        name: data.user.name || userData.name || '',
        email: data.user.email || userData.email || '',
        role: data.user.role || 'admin',
        allowedModules: data.user.allowedModules || []
      }));
      
      navigate('/');
      return data.user;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during registration';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (window.socketInstance) {
      window.socketInstance.disconnect();
      window.socketInstance = null;
    }
    
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    setCurrentUser(null);
    setUserRole('');
    setAllowedModules([]);
    
    navigate('/login');
  };

  // Route to module mapping
  const getModuleFromPath = (pathname) => {
    const ROUTE_TO_MODULE = {
      '/': 'dashboard',
      '/events': 'events',
      '/customers': 'customers',
      '/quotes': 'quotes',
      '/products': 'products',
      '/rental': 'rental',
      '/equipment': 'equipment',
      '/expenses': 'expenses',
      '/invoices': 'invoices',
      '/payments': 'payments',
      '/analytics': 'analytics',
      '/settings': 'settings',
      '/messaging': 'messaging',
      '/calendar': 'calendar',
      '/packages': 'packages',
      '/incidents': 'incidents',
      '/staff': 'staff'
    };

    // Get base route (removes IDs like /customers/123)
    const basePath = '/' + (pathname.split('/')[1] || '');
    return ROUTE_TO_MODULE[basePath === '/' ? '/' : basePath];
  };

  const value = {
    currentUser,
    userRole,
    allowedModules,
    isLoading,
    error,
    login,
    register,
    logout,
    validateToken,
    // Permission functions using allowedModules
    hasPermission: (module) => allowedModules.includes(module),
    canAccessRoute: (pathname) => {
      // Get base route (removes IDs like /customers/123)
      const basePath = '/' + (pathname.split('/')[1] || '');
      const normalizedPath = basePath === '/' ? '/' : basePath;
      const module = ROUTE_TO_MODULE[normalizedPath];
      return module ? allowedModules.includes(module) : false;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};