


export const PLANS_CONFIG = {
  starter: {
    id: 'starter',
    name: 'Inicial',
    description: 'Para equipos pequeños que empiezan',
    pricing: {
      monthly: 599,     // MXN
      annual: 5749      // MXN (20% discount applied)
    },
    stripeIds: {
      monthly: 'price_1RYV3WED5WjSyWUbeF4AWNmm',
      annual: 'price_1RYV3VED5WjSyWUbf6ZQR2Na'
    },
    features: {
      agents: 3,
      conversations: '1000/mes',
      channels: 'Canales básicos',
      storage: '10 GB'
    },
    featuresList: [
      '3 agentes incluidos',
      '1000 conversaciones/mes', 
      'Canales básicos',
      '10 GB de almacenamiento'
    ]
  },
  
  professional: {
    id: 'professional',
    name: 'Profesional',
    description: 'Perfecto para equipos en crecimiento',
    pricing: {
      monthly: 1700,    // MXN
      annual: 16499     // MXN (20% discount applied)
    },
    stripeIds: {
      monthly: 'price_1RYV3WED5WjSyWUbL61deAjp',
      annual: 'price_1RYV3WED5WjSyWUb9OBhbdB8'
    },
    features: {
      agents: 10,
      conversations: 'Ilimitadas',
      channels: 'Todos los canales',
      storage: '100 GB'
    },
    featuresList: [
      '10 agentes incluidos',
      'Conversaciones ilimitadas',
      'Todos los canales',
      '100 GB de almacenamiento'
    ]
  },
  
  enterprise: {
    id: 'enterprise', 
    name: 'Empresarial',
    description: 'Para organizaciones grandes',
    pricing: {
      monthly: 2998,    // MXN
      annual: 28790.4   // MXN (20% discount applied)
    },
    stripeIds: {
      monthly: 'price_1RYV3WED5WjSyWUbIyyvxhs9',
      annual: 'price_1RYUj4ED5WjSyWUbtXET8nPu'
    },
    features: {
      agents: 'Ilimitados',
      conversations: 'Ilimitadas', 
      channels: 'Todos los canales + API',
      storage: '1 TB'
    },
    featuresList: [
      'Agentes ilimitados',
      'Conversaciones ilimitadas',
      'Todos los canales + API',
      '1 TB de almacenamiento'
    ]
  }
};

// Helper function to get plan by ID
export const getPlanById = (planId) => {
  return PLANS_CONFIG[planId] || null;
};

// Helper function to get price by plan and frequency
export const getPlanPrice = (planId, frequency = 'monthly') => {
  const plan = getPlanById(planId);
  return plan ? plan.pricing[frequency] : 0;
};

// Helper function to get Stripe price ID
export const getStripePriceId = (planId, frequency = 'monthly') => {
  const plan = getPlanById(planId);
  return plan ? plan.stripeIds[frequency] : null;
};

// Helper function to get plan from Stripe price ID (for webhooks)
export const getPlanFromStripeId = (stripePriceId) => {
  for (const [planId, plan] of Object.entries(PLANS_CONFIG)) {
    if (plan.stripeIds.monthly === stripePriceId) {
      return { planId, frequency: 'monthly' };
    }
    if (plan.stripeIds.annual === stripePriceId) {
      return { planId, frequency: 'annual' };
    }
  }
  return { planId: 'starter', frequency: 'monthly' }; // fallback
};

// Export all plans as array for easy iteration
export const PLANS_ARRAY = Object.values(PLANS_CONFIG);

// Legacy format for backward compatibility (if needed)
export const PRICE_IDS = Object.fromEntries(
  Object.entries(PLANS_CONFIG).map(([key, plan]) => [
    key, 
    plan.stripeIds
  ])
);