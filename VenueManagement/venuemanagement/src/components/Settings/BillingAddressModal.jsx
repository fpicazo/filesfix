import React, { useState, useEffect } from 'react';
import http from '../../config/http'

const BillingAddressModal = ({ isOpen, onClose, currentAddress, onConfirm, userInfo }) => {
  const [formData, setFormData] = useState({
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingCountry: '',
    billingZip: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form with current address when modal opens
  useEffect(() => {
    if (isOpen && currentAddress) {
      setFormData({
        billingStreet: currentAddress.street || '',
        billingCity: currentAddress.city || '',
        billingState: currentAddress.state || '',
        billingCountry: currentAddress.country || '',
        billingZip: currentAddress.zipCode || ''
      });
      setErrors({});
    }
  }, [isOpen, currentAddress]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.billingStreet.trim()) {
      newErrors.billingStreet = 'La dirección es requerida';
    }

    if (!formData.billingCity.trim()) {
      newErrors.billingCity = 'La ciudad es requerida';
    }

    if (!formData.billingState.trim()) {
      newErrors.billingState = 'El estado/provincia es requerido';
    }

    if (!formData.billingCountry.trim()) {
      newErrors.billingCountry = 'El país es requerido';
    }

    if (!formData.billingZip.trim()) {
      newErrors.billingZip = 'El código postal es requerido';
    }

    // Basic format validation
    if (formData.billingZip && !/^[0-9]{5}(-[0-9]{4})?$/.test(formData.billingZip.trim())) {
      newErrors.billingZip = 'Formato de código postal inválido (ej: 12345 o 12345-6789)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsProcessing(true);

      console.log('🔄 Updating billing address:', formData);

      // Call your backend API to update billing address
      const response = await http.put('/tenants/', formData);

      if (response.data) {
        console.log('✅ Billing address updated successfully');
        
        // Call the onConfirm callback with the updated address
        onConfirm({
          street: formData.billingStreet,
          city: formData.billingCity,
          state: formData.billingState,
          country: formData.billingCountry,
          zipCode: formData.billingZip
        });
        
        onClose();
      } else {
        throw new Error(response.data.message || 'Error updating billing address');
      }

    } catch (error) {
      console.error('❌ Error updating billing address:', error);
      
      let errorMessage = 'Error al actualizar la dirección de facturación. ';
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

  const handleCancel = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleSubmit();
    }
  };

  // Country options (you can expand this list)
  const countryOptions = [
    { value: '', label: 'Seleccionar país' },
    { value: 'MX', label: 'México' },
    { value: 'US', label: 'Estados Unidos' },
    { value: 'CA', label: 'Canadá' },
    { value: 'ES', label: 'España' },
    { value: 'AR', label: 'Argentina' },
    { value: 'CO', label: 'Colombia' },
    { value: 'PE', label: 'Perú' },
    { value: 'CL', label: 'Chile' },
    { value: 'BR', label: 'Brasil' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Editar Dirección de Facturación</h2>
          <button
            onClick={handleCancel}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 relative">
          {/* Loading overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-700">Actualizando dirección...</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Street Address */}
            <div>
              <label htmlFor="billingStreet" className="block text-sm font-medium text-gray-700 mb-1">
                Dirección <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="billingStreet"
                value={formData.billingStreet}
                onChange={(e) => handleInputChange('billingStreet', e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isProcessing}
                placeholder="Calle, número, colonia..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.billingStreet ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.billingStreet && (
                <p className="text-red-500 text-sm mt-1">{errors.billingStreet}</p>
              )}
            </div>

            {/* City and State Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* City */}
              <div>
                <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="billingCity"
                  value={formData.billingCity}
                  onChange={(e) => handleInputChange('billingCity', e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isProcessing}
                  placeholder="Ciudad"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.billingCity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.billingCity && (
                  <p className="text-red-500 text-sm mt-1">{errors.billingCity}</p>
                )}
              </div>

              {/* State */}
              <div>
                <label htmlFor="billingState" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado/Provincia <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="billingState"
                  value={formData.billingState}
                  onChange={(e) => handleInputChange('billingState', e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isProcessing}
                  placeholder="Estado o Provincia"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.billingState ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.billingState && (
                  <p className="text-red-500 text-sm mt-1">{errors.billingState}</p>
                )}
              </div>
            </div>

            {/* Country and Zip Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Country */}
              <div>
                <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700 mb-1">
                  País <span className="text-red-500">*</span>
                </label>
                <select
                  id="billingCountry"
                  value={formData.billingCountry}
                  onChange={(e) => handleInputChange('billingCountry', e.target.value)}
                  disabled={isProcessing}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.billingCountry ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {countryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.billingCountry && (
                  <p className="text-red-500 text-sm mt-1">{errors.billingCountry}</p>
                )}
              </div>

              {/* Zip Code */}
              <div>
                <label htmlFor="billingZip" className="block text-sm font-medium text-gray-700 mb-1">
                  Código Postal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="billingZip"
                  value={formData.billingZip}
                  onChange={(e) => handleInputChange('billingZip', e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isProcessing}
                  placeholder="12345"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.billingZip ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.billingZip && (
                  <p className="text-red-500 text-sm mt-1">{errors.billingZip}</p>
                )}
              </div>
            </div>

            {/* Info note */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Información</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Esta dirección se utilizará para la facturación y debe coincidir con la información de tu método de pago.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isProcessing}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isProcessing}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </span>
              ) : (
                'Guardar Dirección'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingAddressModal;