import React, { useState, useEffect } from 'react';
import { PLANS_CONFIG, getPlanById, getPlanPrice } from '../../config/plans';
import PlanChangeModal from './PlanChangeModal';
import BillingAddressModal from './BillingAddressModal';
import http from '../../config/http'

const Subscription = ({ settings, updateSetting }) => {
  const licencelevel = settings.licencelevel || "";
  const licenceexpiresAt = settings.licenceexpiresAt || "";
  const licencefrequency = settings.licencefrequency || "monthly";

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);


  const getCurrentPlanPrice = () => {
    return getPlanPrice(licencelevel, licencefrequency);
  };

  const getCurrentPlan = () => {
    return getPlanById(licencelevel);
  };

  const [currentPlan, setCurrentPlan] = useState(() => {
    const plan = getCurrentPlan();
    return {
      name: plan ? plan.name : 'Sin Plan',
      description: plan ? plan.description : 'No tienes un plan activo',
      price: getCurrentPlanPrice(),
      status: licencelevel ? 'Activo' : 'Inactivo',
      renewDate: licenceexpiresAt ? new Date(licenceexpiresAt).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : 'No disponible',
      features: plan ? plan.features : {}
    };
  });

  const [usage, setUsage] = useState({
    activeAgents: { current: 8, total: currentPlan.features.agents === 'Ilimitados' ? '∞' : currentPlan.features.agents || 0 },
    conversations: { current: 2847, label: 'este mes' },
    storage: { current: 45.2, total: currentPlan.features.storage === '1 TB' ? 1000 : (currentPlan.features.storage === '100 GB' ? 100 : 10), unit: 'GB' }
  });

  const [billingInfo, setBillingInfo] = useState({
    paymentMethod: {
      type: settings.paymentMethodType || "",
      lastFour: settings.paymentMethodLast4 || "",
      expiry: settings.paymentMethodExpiry || "",
    },
    billingAddress: {
      company: settings.name || "",
      street: settings.billingStreet || "",
      city: settings.billingCity || "",
      state: settings.billingState || "",
      zipCode: settings.billingZip || "",
      country: settings.billingCountry || "",
    }
  });

  const [billingHistory, setBillingHistory] = useState([
    {
      date: '25 Abr, 2023',
      description: currentPlan.name,
      amount: currentPlan.price,
      status: 'Pagado',
      invoice: 'INV-001'
    }
  ]);

  // Generate plans array from config
  const plans = Object.values(PLANS_CONFIG).map(plan => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: plan.pricing[licencefrequency],
    features: plan.featuresList,
    isCurrent: licencelevel === plan.id
  }));

  // Prepare user info for the modal
  const userInfo = {
    id: settings.userId || settings.tenantId,
    userId: settings.userId || settings.tenantId,
    tenantId: settings.tenantId,
    email: settings.email || settings.supportEmail,
    name: settings.name || settings.companyName,
    companyName: settings.companyName,
    stripeCustomerId: settings.stripeCustomerId,
    stripeSubscriptionId: settings.stripeSubscriptionId
  };

  // Update currentPlan when license level changes
  useEffect(() => {
    const plan = getCurrentPlan();
    if (plan) {
      setCurrentPlan({
        name: plan.name,
        description: plan.description,
        price: getCurrentPlanPrice(),
        status: 'Activo',
        renewDate: licenceexpiresAt ? new Date(licenceexpiresAt).toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) : 'No disponible',
        features: plan.features
      });

      // Update usage totals based on new plan
      setUsage(prev => ({
        ...prev,
        activeAgents: { 
          current: prev.activeAgents.current, 
          total: plan.features.agents === 'Ilimitados' ? '∞' : plan.features.agents 
        },
        storage: { 
          current: prev.storage.current, 
          total: plan.features.storage === '1 TB' ? 1000 : (plan.features.storage === '100 GB' ? 100 : 10), 
          unit: 'GB' 
        }
      }));
    } else {
      setCurrentPlan({
        name: 'Sin Plan',
        description: 'No tienes un plan activo',
        price: 0,
        status: 'Inactivo',
        renewDate: 'No disponible',
        features: {}
      });
    }
  }, [licencelevel, licenceexpiresAt, licencefrequency]);

  const handlePlanChange = () => {
    // Validate required user info before opening modal
    if (!userInfo.id || !userInfo.email) {
      alert('Información de usuario incompleta. Por favor verifica tu configuración.');
      console.error('Missing user info for checkout:', userInfo);
      return;
    }
    setShowUpgradeModal(true);
  };

  const handleConfirmUpgrade = async (planData) => {
    try {
      console.log('📝 Updating local plan settings:', planData);

      // Calculate expiration date based on billing cycle
      const expirationDate = new Date();
      if (planData.billingCycle === 'annual') {
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      } else {
        expirationDate.setMonth(expirationDate.getMonth() + 1);
      }

      // Update the license level in settings
      await updateSetting({
        ...settings,
        licencelevel: planData.id,
        licenceexpiresAt: expirationDate.toISOString(),
        licencefrequency: planData.billingCycle
      });
      
      setShowUpgradeModal(false);
      
      console.log('✅ Plan actualizado localmente:', planData.id, 'con frecuencia:', planData.billingCycle);
    } catch (error) {
      console.error('❌ Error al actualizar el plan:', error);
      alert('Error al actualizar el plan. Por favor intenta de nuevo.');
    }
  };

   
const handleEditPayment = async () => {
    try {
        console.log('🔄 Iniciando edición de método de pago...');
        
        const response = await http.post('/billing/edit-card', {}, {
            headers: {
                'tenantId': userInfo.tenantId
            }
        });

        console.log('📝 Editar método de pago response:', response.data);
        
        // Correct way to get the URL from response
        const url = response.data.url;
        
        if (url) {
            console.log('🔗 Redirecting to:', url);
            // Redirect user to the Stripe-hosted page
            window.location.href = url;
        } else {
            throw new Error('No URL received from server');
        }

    } catch (error) {
        console.error('❌ Error al editar el método de pago:', error);
        
        // More specific error message
        const errorMessage = error.response?.data?.error || 
                           error.message || 
                           'Error al editar el método de pago. Por favor intenta de nuevo.';
        
        alert(errorMessage);
    }
};

  const handleDownloadInvoice = (invoice) => {
    console.log('Descargar factura:', invoice);
    // TODO: Implement invoice download functionality
  };

  const getUsagePercentage = (current, total) => {
    if (total === '∞' || total === 'Ilimitados') return 100;
    return Math.min((current / total) * 100, 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const isExpired = licenceexpiresAt && new Date(licenceexpiresAt) < new Date();

  const handleEditAddress = () => {
    console.log('Editar dirección de facturación');
    setShowAddressModal(true);
};

// Add this new function to handle address confirmation
const handleConfirmAddressUpdate = async (updatedAddress) => {
    try {
        console.log('📝 Updating local billing address:', updatedAddress);

        // Update the local billingInfo state
        setBillingInfo(prev => ({
            ...prev,
            billingAddress: {
                company: prev.billingAddress.company, // Keep existing company name
                street: updatedAddress.street,
                city: updatedAddress.city,
                state: updatedAddress.state,
                zipCode: updatedAddress.zipCode,
                country: updatedAddress.country
            }
        }));

        // Update the settings object if you need to persist it
        await updateSetting({
            ...settings,
            billingStreet: updatedAddress.street,
            billingCity: updatedAddress.city,
            billingState: updatedAddress.state,
            billingCountry: updatedAddress.country,
            billingZip: updatedAddress.zipCode
        });

        console.log('✅ Billing address updated locally');
        
    } catch (error) {
        console.error('❌ Error updating local billing address:', error);
        alert('Error al actualizar la dirección localmente. Por favor recarga la página.');
    }
};


  return (
    <div className="space-y-8">
      {/* Plan Change Modal */}
      <PlanChangeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={{ id: licencelevel, ...getCurrentPlan() }}
        currentBillingCycle={licencefrequency}
        onConfirm={handleConfirmUpgrade}
        userInfo={userInfo}
      />
      <BillingAddressModal
    isOpen={showAddressModal}
    onClose={() => setShowAddressModal(false)}
    currentAddress={billingInfo.billingAddress}
    onConfirm={handleConfirmAddressUpdate}
    userInfo={userInfo}
/>


      {/* Sección Plan Actual */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Plan Actual</h2>
        
        <div className={`border rounded-lg p-6 ${
          !licencelevel ? 'border-red-200 bg-red-50' : 
          isExpired ? 'border-orange-200 bg-orange-50' : 
          'border-blue-200 bg-blue-50'
        }`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{currentPlan.name}</h3>
              <p className="text-gray-600 mb-2">{currentPlan.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-blue-600">{formatCurrency(currentPlan.price)}</span>
                <span className="text-gray-600">/{licencefrequency === 'annual' ? 'año' : 'mes'}</span>
                {licencefrequency === 'annual' && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Ahorra 20%
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${
                !licencelevel ? 'bg-red-100 text-red-800' :
                isExpired ? 'bg-orange-100 text-orange-800' :
                'bg-green-100 text-green-800'
              }`}>
                {!licencelevel ? 'Sin Plan' : isExpired ? 'Expirado' : currentPlan.status}
              </span>
              <p className="text-sm text-gray-600">
                {!licencelevel ? 'Selecciona un plan' : 
                 isExpired ? `Expiró el ${currentPlan.renewDate}` :
                 `Se renueva el ${currentPlan.renewDate}`}
              </p>
            </div>
          </div>

          {licencelevel && Object.keys(currentPlan.features).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Agentes</p>
                <p className="font-semibold">{currentPlan.features.agents} {typeof currentPlan.features.agents === 'number' ? 'incluidos' : ''}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Conversaciones</p>
                <p className="font-semibold">{currentPlan.features.conversations}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Canales</p>
                <p className="font-semibold">{currentPlan.features.channels}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Almacenamiento</p>
                <p className="font-semibold">{currentPlan.features.storage}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {!licencelevel ? (
              <button 
                onClick={() => handlePlanChange()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
              >
                Seleccionar Plan
              </button>
            ) : (
              <button 
                onClick={() => handlePlanChange()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
              >
                Cambiar Plan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sección Uso Este Mes - Solo mostrar si hay plan activo */}
      {licencelevel && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Uso Este Mes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-600">Agentes Activos</h3>
                <span className="text-sm text-gray-500">
                  {usage.activeAgents.current}/{usage.activeAgents.total} usados
                </span>
              </div>
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${getUsagePercentage(usage.activeAgents.current, usage.activeAgents.total)}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{usage.activeAgents.current}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-600">Conversaciones</h3>
                <span className="text-sm text-blue-600">
                  {usage.conversations.current.toLocaleString()} {usage.conversations.label}
                </span>
              </div>
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{usage.conversations.current.toLocaleString()}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-600">Almacenamiento Usado</h3>
                <span className="text-sm text-orange-600">
                  {usage.storage.current}/{usage.storage.total} {usage.storage.unit}
                </span>
              </div>
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${getUsagePercentage(usage.storage.current, usage.storage.total)}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{usage.storage.current} {usage.storage.unit}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sección Planes Disponibles */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Planes Disponibles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative rounded-lg border p-6 flex flex-col h-full ${
                plan.isCurrent 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              {plan.isCurrent && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Plan Actual
                  </span>
                </div>
              )}
              
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-gray-900">{formatCurrency(plan.price)}</span>
                  <span className="text-gray-600">/{licencefrequency === 'annual' ? 'año' : 'mes'}</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-4">
                {plan.isCurrent ? (
                  <button disabled className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-md font-medium cursor-not-allowed">
                    Plan Actual
                  </button>
                ) : (
                  <button 
                    onClick={() => handlePlanChange()}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
                  >
                    Seleccionar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sección Información de Facturación - Solo mostrar si hay plan activo */}
      {licencelevel && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Método de Pago */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Método de Pago</h2>
                <button 
                  onClick={handleEditPayment}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Editar
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  {billingInfo.paymentMethod.type}
                </div>
                <span className="text-gray-900">•••• •••• •••• {billingInfo.paymentMethod.lastFour}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Expira {billingInfo.paymentMethod.expiry}</p>
            </div>

            {/* Dirección de Facturación */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Dirección de Facturación</h2>
                <button 
                  onClick={handleEditAddress}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Editar Dirección
                </button>
              </div>
              
              <div className="text-sm text-gray-900">
                <p className="font-medium">{billingInfo.billingAddress.company}</p>
                <p>{billingInfo.billingAddress.street}</p>
                <p>{billingInfo.billingAddress.city}, {billingInfo.billingAddress.state} {billingInfo.billingAddress.zipCode}</p>
                <p>{billingInfo.billingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Sección Historial de Facturación */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Historial de Facturación</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-0 text-sm font-medium text-gray-600 uppercase tracking-wider">FECHA</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider">DESCRIPCIÓN</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider">MONTO</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider">ESTADO</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 uppercase tracking-wider">FACTURA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {billingHistory.map((record, index) => (
                    <tr key={index}>
                      <td className="py-4 px-0 text-sm text-gray-900">{record.date}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{record.description}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{formatCurrency(record.amount)}</td>
                      <td className="py-4 px-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {record.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <button 
                          onClick={() => handleDownloadInvoice(record.invoice)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Descargar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Debug info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 rounded-lg p-4 text-xs">
          <h3 className="font-semibold mb-2">Debug - User Info:</h3>
          <pre>{JSON.stringify(userInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Subscription;