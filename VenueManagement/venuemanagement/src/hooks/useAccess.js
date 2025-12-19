// src/hooks/useAccess.js
import { useAuth } from '../contexts/AuthContext';

export const useAccess = () => {
  const { currentUser, userRole, allowedModules, hasPermission } = useAuth();
  
  return {
    canAccess: (module) => hasPermission(module),
    modules: allowedModules || [],
    role: userRole,
    allowedModules: allowedModules || [],
    user: currentUser
  };
};