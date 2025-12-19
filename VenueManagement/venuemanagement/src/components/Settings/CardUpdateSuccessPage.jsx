import React, { useEffect, useState } from 'react';
import http from '../config/http'

const CardUpdateSuccessPage = () => {
  const [countdown, setCountdown] = useState(3);
  const [sessionId, setSessionId] = useState('');
  const [updateStatus, setUpdateStatus] = useState('updating'); // 'updating', 'success', 'error'
  const [updateMessage, setUpdateMessage] = useState('Actualizando tu método de pago...');
  const [paymentMethodInfo, setPaymentMethodInfo] = useState(null);

  useEffect(() => {
    // Get session ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    console.log('URL Parameters:', urlParams.toString());
    const session = urlParams.get('session_id');
    console.log('Session ID from URL:', session);
    
    if (session) {
      setSessionId(session);
      // Call handleCardUpdate with the session ID directly
      handleCardUpdate(session);
    } else {
      console.error('No session ID found in URL');
      setUpdateStatus('error');
      setUpdateMessage('No se encontró información de la sesión de actualización');
    }
  }, []);

  const handleCardUpdate = async (sessionIdParam) => {
    try {
      console.log('🔄 Calling card update completion with sessionId:', sessionIdParam);
      
      const response = await http.post('billing/update-card-complete', { 
        sessionId: sessionIdParam 
      });

      console.log('✅ Card update response:', response.data);

      if (response.data.success) {
        setUpdateStatus('success');
        setUpdateMessage('¡Método de pago actualizado exitosamente!');
        
        // Store payment method info if available
        if (response.data.paymentMethod) {
          setPaymentMethodInfo(response.data.paymentMethod);
        }
        
        // Start countdown after successful update
        setTimeout(() => {
          startCountdown(sessionIdParam);
        }, 1000);
      } else {
        console.error('❌ Card update failed:', response.data.message);
        setUpdateStatus('error');
        setUpdateMessage(response.data.message || 'Error al actualizar el método de pago');
      }
    } catch (error) {
      console.error('❌ Error updating card:', error);
      setUpdateStatus('error');
      setUpdateMessage(error.response?.data?.error || error.message || 'Error al actualizar el método de pago');
    }
  };

  const startCountdown = (sessionIdParam) => {
    let countdownValue = 3;
    setCountdown(countdownValue);
    
    const timer = setInterval(() => {
      countdownValue--;
      setCountdown(countdownValue);
      
      if (countdownValue <= 0) {
        clearInterval(timer);
        // Redirect to subscription settings
        window.location.href = 'http://localhost:3001/settings?tab=subscription&payment_updated=true' + 
          (sessionIdParam ? `&session_id=${sessionIdParam}` : '');
      }
    }, 1000);
  };

  const handleRedirectNow = () => {
    window.location.href = 'http://localhost:3001/settings?tab=subscription&payment_updated=true' + 
      (sessionId ? `&session_id=${sessionId}` : '');
  };

  const handleRetry = () => {
    if (sessionId) {
      setUpdateStatus('updating');
      setUpdateMessage('Reintentando actualización...');
      handleCardUpdate(sessionId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Update Card */}
        <div className="bg-white rounded-xl shadow-xl p-8 text-center">
          {/* Dynamic Icon based on status */}
          <div className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center relative overflow-hidden">
            {updateStatus === 'updating' && (
              <>
                <div className="absolute inset-0 bg-blue-100 rounded-full"></div>
                <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-75"></div>
                <svg 
                  className="w-10 h-10 text-blue-600 relative z-10 animate-spin" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
              </>
            )}
            
            {updateStatus === 'success' && (
              <>
                <div className="absolute inset-0 bg-green-100 rounded-full"></div>
                <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-75"></div>
                <svg 
                  className="w-10 h-10 text-green-600 relative z-10" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={3} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </>
            )}
            
            {updateStatus === 'error' && (
              <>
                <div className="absolute inset-0 bg-red-100 rounded-full"></div>
                <svg 
                  className="w-10 h-10 text-red-600 relative z-10" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </>
            )}
          </div>

          {/* Dynamic Messages based on status */}
          <h1 className={`text-3xl font-bold mb-3 ${
            updateStatus === 'success' ? 'text-gray-900' : 
            updateStatus === 'error' ? 'text-red-600' : 
            'text-blue-600'
          }`}>
            {updateStatus === 'updating' && '💳 Actualizando...'}
            {updateStatus === 'success' && '✅ ¡Tarjeta Actualizada!'}
            {updateStatus === 'error' && '⚠️ Error en Actualización'}
          </h1>
          
          <p className={`mb-2 text-lg ${
            updateStatus === 'error' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {updateMessage}
          </p>
          
          {updateStatus === 'success' && (
            <p className="text-gray-500 mb-8 text-sm">
              Tu nuevo método de pago se aplicará a partir del próximo cobro de tu suscripción.
            </p>
          )}
          
          {updateStatus === 'error' && (
            <p className="text-gray-500 mb-8 text-sm">
              Tu método de pago anterior sigue siendo válido. Puedes intentar nuevamente.
            </p>
          )}

          {/* New Payment Method Info */}
          {updateStatus === 'success' && paymentMethodInfo && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold mb-2">NUEVO MÉTODO DE PAGO</p>
              <div className="flex items-center justify-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {paymentMethodInfo.type?.substring(0, 2)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">
                    •••• •••• •••• {paymentMethodInfo.lastFour}
                  </span>
                </div>
                <span className="text-gray-500 text-sm">
                  {paymentMethodInfo.expiry}
                </span>
              </div>
            </div>
          )}

          {/* Session Info */}
          {sessionId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-xs text-gray-400 mb-1">ID de Sesión</p>
              <p className="text-sm font-mono text-gray-700 break-all">
                {sessionId}
              </p>
            </div>
          )}

          {/* Countdown Section - Only show when successfully updated */}
          {updateStatus === 'success' && (
            <div className="mb-8">
              <p className="text-gray-600 mb-4">
                Redirigiendo a tu configuración de suscripción...
              </p>
              
              {/* Countdown Circle */}
              <div className="relative mx-auto w-16 h-16 mb-4">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="4"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (countdown / 3)}`}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">{countdown}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                segundo{countdown !== 1 ? 's' : ''} restante{countdown !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Loading state for updating */}
          {updateStatus === 'updating' && (
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-bounce w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="animate-bounce w-2 h-2 bg-blue-600 rounded-full" style={{animationDelay: '0.1s'}}></div>
                <div className="animate-bounce w-2 h-2 bg-blue-600 rounded-full" style={{animationDelay: '0.2s'}}></div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Por favor espera mientras actualizamos tu método de pago...
              </p>
            </div>
          )}

          {/* Dynamic Action Buttons */}
          <div className="space-y-3">
            {updateStatus === 'updating' && (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-semibold cursor-not-allowed text-lg"
              >
                Actualizando...
              </button>
            )}
            
            {updateStatus === 'success' && (
              <>
                <button
                  onClick={handleRedirectNow}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold transition-colors text-lg"
                >
                  Ver Mi Suscripción
                </button>
                
                <button
                  onClick={() => window.location.href = 'http://localhost:3001/'}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Volver al Inicio
                </button>
              </>
            )}
            
            {updateStatus === 'error' && (
              <>
                <button
                  onClick={handleRetry}
                  className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 font-semibold transition-colors text-lg"
                >
                  Intentar de Nuevo
                </button>
                
                <button
                  onClick={() => window.location.href = 'http://localhost:3001/settings?tab=subscription'}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Ir a Configuración
                </button>
                
                <button
                  onClick={() => window.location.href = 'http://localhost:3001/'}
                  className="w-full bg-gray-50 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 font-medium transition-colors text-sm"
                >
                  Volver al Inicio
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Si tienes problemas con tu método de pago, contáctanos
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardUpdateSuccessPage;