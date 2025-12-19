import React, { useState, useEffect } from 'react';
import { PLANS_ARRAY, getPlanById } from '../../config/plans';
import http from '../../config/http'

const PlanChangeModal = ({ isOpen, onClose, currentPlan, currentBillingCycle = 'monthly', onConfirm, userInfo }) => {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan?.id || 'professional');
  const [billingCycle, setBillingCycle] = useState(currentBillingCycle);
  const [isProcessing, setIsProcessing] = useState(false);

  // Update billing cycle when prop changes
  useEffect(() => {
    setBillingCycle(currentBillingCycle);
  }, [currentBillingCycle]);

  // Use shared plans configuration
  const plans = PLANS_ARRAY.map(plan => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    monthlyPrice: plan.pricing.monthly,
    annualPrice: plan.pricing.annual,
    features: plan.featuresList
  }));

  const getCurrentPrice = (plan) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  const getSelectedPlanData = () => {
    return plans.find(plan => plan.id === selectedPlan);
  };

  const getCurrentPlanData = () => {
    return plans.find(plan => plan.id === currentPlan?.id);
  };

  const calculateCredit = () => {
    const currentPlanData = getCurrentPlanData();
    const newPlanData = getSelectedPlanData();
    
    if (!currentPlanData || !newPlanData) return 0;
    
    const currentPrice = getCurrentPrice(currentPlanData);
    const newPrice = getCurrentPrice(newPlanData);
    
    return currentPrice - newPrice;
  };

  // Create checkout session and redirect to Stripe
  const handleCreateCheckoutSession = async () => {
    try {
      setIsProcessing(true);

      // Get user info - you might need to adjust these fields based on your user data structure
      const userId = userInfo?.id || userInfo?.userId || userInfo?.tenantId;
      const email = userInfo?.email || userInfo?.supportEmail;
      const name = userInfo?.name || userInfo?.companyName || 'Usuario';

      if (!userId || !email) {
        throw new Error('Missing user information (userId or email)');
      }

      console.log('Creating checkout session for:', {
        planId: selectedPlan,
        billingCycle,
        userId,
        email,
        name
      });

      // Call your backend API to create checkout session
      const response = await http.post('/billing/create-checkout-session', {
        planId: selectedPlan,
        billingCycle: billingCycle,
        userId: userId,
        email: email,
        name: name
      });

      if (response.data && response.data.url) {
        console.log('✅ Checkout session created, redirecting to:', response.data.url);
        
        // Close the modal
        onClose();
        
        // Redirect to Stripe Checkout
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL received from server');
      }

    } catch (error) {
      console.error('❌ Error creating checkout session:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Error al crear la sesión de pago. ';
      
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Por favor intenta de nuevo.';
      }
      
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle plan confirmation
  const handleConfirm = () => {
    const selectedPlanData = getSelectedPlanData();
    if (!selectedPlanData) {
      alert('Por favor selecciona un plan válido.');
      return;
    }

    // If same plan, just close modal
    if (selectedPlan === currentPlan?.id && billingCycle === currentBillingCycle) {
      onClose();
      return;
    }

    // If user has existing subscription and changing plan/cycle, call update API
    if (currentPlan?.id && userInfo?.stripeSubscriptionId) {
      handleUpdateSubscription();
    } else {
      // Create new subscription via Stripe Checkout
      handleCreateCheckoutSession();
    }
  };

  // Handle subscription update (for existing subscribers)
  const handleUpdateSubscription = async () => {
    try {
      setIsProcessing(true);

      console.log('Updating existing subscription:', {
        subscriptionId: userInfo.stripeSubscriptionId,
        planId: selectedPlan,
        billingCycle
      });

      const response = await http.post('/billing/updatesubscription', {
        subscriptionId: userInfo.stripeSubscriptionId,
        planId: selectedPlan,
        billingCycle: billingCycle
      });

      if (response.data) {
        console.log('✅ Subscription updated successfully');
        
        // Call the onConfirm callback to update local state
        const selectedPlanData = getSelectedPlanData();
        onConfirm({
          ...selectedPlanData,
          billingCycle,
          price: getCurrentPrice(selectedPlanData)
        });
        
        onClose();
      }

    } catch (error) {
      console.error('❌ Error updating subscription:', error);
      
      let errorMessage = 'Error al actualizar la suscripción. ';
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else {
        errorMessage += 'Por favor intenta de nuevo.';
      }
      
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const isDowngrade = () => {
    const currentPlanData = getCurrentPlanData();
    const newPlanData = getSelectedPlanData();
    
    if (!currentPlanData || !newPlanData) return false;
    
    const currentPrice = getCurrentPrice(currentPlanData);
    const newPrice = getCurrentPrice(newPlanData);
    
    return newPrice < currentPrice;
  };

  // Format currency as MXN
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Cambiar Tu Plan</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Loading overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-700">Procesando...</span>
              </div>
            </div>
          )}

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-md font-medium transition-colors relative disabled:opacity-50 ${
                  billingCycle === 'annual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Anual
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Ahorra 20%
                </span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border rounded-lg p-6 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${plan.id === currentPlan?.id ? 'ring-2 ring-blue-200' : ''} ${
                  isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => !isProcessing && setSelectedPlan(plan.id)}
              >
                {/* Radio Button */}
                <div className="absolute top-4 right-4">
                  <input
                    type="radio"
                    checked={selectedPlan === plan.id}
                    onChange={() => !isProcessing && setSelectedPlan(plan.id)}
                    disabled={isProcessing}
                    className="w-4 h-4 text-blue-600 disabled:opacity-50"
                  />
                </div>

                {/* Current Plan Badge */}
                {plan.id === currentPlan?.id && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Plan Actual
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(getCurrentPrice(plan))}
                    </span>
                    <span className="text-gray-600 ml-1">
                      /{billingCycle === 'monthly' ? 'mes' : 'año'}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className={selectedPlan === plan.id ? 'text-blue-700' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Plan Change Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Resumen del Cambio de Plan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Actual: {getCurrentPlanData()?.name || 'Ninguno'} Plan</span>
                <span className="text-gray-900">
                  {formatCurrency(getCurrentPlanData() ? getCurrentPrice(getCurrentPlanData()) : 0)}/{billingCycle === 'monthly' ? 'mes' : 'año'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nuevo: {getSelectedPlanData()?.name} Plan</span>
                <span className="text-gray-900">
                  {formatCurrency(getSelectedPlanData() ? getCurrentPrice(getSelectedPlanData()) : 0)}/{billingCycle === 'monthly' ? 'mes' : 'año'}
                </span>
              </div>
              {calculateCredit() > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Crédito (prorrateado)</span>
                  <span>+{formatCurrency(calculateCredit())}</span>
                </div>
              )}
            </div>
          </div>

          {/* Downgrade Warning */}
          {isDowngrade() && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <svg className="w-5 h-5 text-orange-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-orange-800">Nota:</h4>
                  <p className="text-sm text-orange-700">
                    Degradar limitará tu cuenta a {getSelectedPlanData()?.features[0]} y {getSelectedPlanData()?.features[1]}. 
                    El uso actual puede verse afectado.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedPlan === currentPlan?.id && billingCycle === currentBillingCycle || isProcessing}
              className={`px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedPlan === currentPlan?.id && billingCycle === currentBillingCycle
                  ? 'bg-gray-300 text-gray-500'
                  : isDowngrade()
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </span>
              ) : selectedPlan === currentPlan?.id && billingCycle === currentBillingCycle ? (
                'Plan Actual'
              ) : isDowngrade() ? (
                'Degradar Plan'
              ) : (
                'Actualizar Plan'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanChangeModal;