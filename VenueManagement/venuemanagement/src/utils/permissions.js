// src/utils/permissions.js

// Map routes to modules
export const ROUTE_TO_MODULE = {
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
  '/notifications': 'notifications',
  '/staff': 'staff',
  '/tasks': 'tasks'
};

// Check if user can access a module using allowedModules array
export const canAccess = (allowedModules, module) => {
  return Array.isArray(allowedModules) && allowedModules.includes(module);
};

// Check if user can access a route using allowedModules array
export const canAccessRoute = (allowedModules, pathname) => {
  // Get base route (removes IDs like /customers/123)
  const basePath = '/' + (pathname.split('/')[1] || '');
  const normalizedPath = basePath === '/' ? '/' : basePath;
  const module = ROUTE_TO_MODULE[normalizedPath];
  
  return module ? canAccess(allowedModules, module) : false;
};

// Get module name from pathname
export const getModuleFromPath = (pathname) => {
  const basePath = '/' + (pathname.split('/')[1] || '');
  const normalizedPath = basePath === '/' ? '/' : basePath;
  return ROUTE_TO_MODULE[normalizedPath];
};

// Legacy role-based access (kept for backward compatibility if needed)
export const ROLE_ACCESS = {
  admin: [
    'dashboard', 'events', 'customers', 'quotes', 'products', 'rental', 
    'equipment', 'expenses', 'invoices', 'payments', 'analytics',
    'settings', 'messaging', 'calendar', 'packages', 'incidents', 'staff', 'tasks', 'notifications'
  ],
  manager: [
    'dashboard', 'events', 'customers', 'quotes', 'products', 'rental',
    'equipment', 'analytics', 'messaging', 'calendar', 'packages', 
    'incidents', 'staff', 'tasks', 'notifications'
  ],
  sales: [
    'dashboard', 'events', 'customers', 'quotes', 'products', 'rental',
    'equipment', 'messaging', 'calendar', 'packages', 'tasks', 'notifications'
  ],
  finance: [
    'dashboard', 'expenses', 'invoices', 'payments', 'messaging', 'calendar', 'notifications'
  ]
};

// Legacy function - use allowedModules instead
export const getUserModules = (userRole) => {
  return ROLE_ACCESS[userRole] || [];
};