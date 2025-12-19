import React, { useState, useEffect, useRef } from 'react';
import { Building2, Camera, User, Upload, File, X, Check } from 'lucide-react';
import Integrations from '../components/Settings/Integrations';
import UserManagement from '../components/Settings/UserManagement';
import Subscription from '../components/Settings/Subscription';
import DynamicFieldsManagementPage from '../components/Settings/DynamicFieldsManagementPage';
import RoleManagementPage from '../components/Settings/RoleManagementPage';
import DiscountManagement from '../components/Settings/DiscountManagement';
import { useSettings } from '../contexts/SettingsContext';
import uploadFileToS3 from '../utils/uploadFileToS3'; // Adjust path as needed
import http from '../config/http';

const SettingsPage = () => {
  const { settings, updateSetting, loading } = useSettings();
  const [activeTab, setActiveTab] = useState('General');
  const [settingsData, setSettingsData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(false);
  const [fileError, setFileError] = useState('');
  const [certificateFile, setCertificateFile] = useState(null);
  const [keyFile, setKeyFile] = useState(null);
  const settingsRef = useRef(null);
  const fileInputRef = useRef(null);

  // Update local settingsData whenever the context settings change
  useEffect(() => {
    //console.log('Settings from context:', settings);
    // Deep clone settings to break reference equality
    if (settings && typeof settings === 'object') {
      const newSettingsData = JSON.parse(JSON.stringify(settings));
      //console.log('Setting settingsData to:', newSettingsData);
      setSettingsData(newSettingsData);
      settingsRef.current = newSettingsData;
    }
  }, [settings]);

  // Debug output
  useEffect(() => {
    //console.log('Current settingsData state:', settingsData);
  }, [settingsData]);

  const handleChange = (field, value) => {
    //console.log(`Updating field '${field}' to:`, value);
    setSettingsData(prev => {
      const newData = { 
        ...prev, 
        [field]: value 
      };
      //console.log('Updated settingsData will be:', newData);
      return newData;
    });
  };

  // Image upload functions
  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleImageUpload = async (file) => {
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size must be less than 5MB')
      return
    }

    setUploadingImage(true)
    setImageError('')

    try {
      const imageUrl = await uploadFileToS3({
        file,
        module: 'company',
        recordId: 'company-profile',
        tenantId: 'default' // You might want to get this from context
      })

      setSettingsData(prev => ({ ...prev, companyImageUrl: imageUrl }))
      console.log('Company image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      setImageError('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemovePhoto = () => {
    setSettingsData(prev => ({ ...prev, companyImageUrl: '' }))
    setImageError('')
  }



  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]); // Get base64 without data:... prefix
      reader.onerror = error => reject(error);
    });
  };

  const handleCertificateUpload = async (file) => {
    if (!file) return;
    setCertificateFile(file);
    setSettingsData(prev => ({ 
      ...prev, 
      fiscalCertificateFileName: file.name 
    }));
  };

  const handleKeyUpload = async (file) => {
    if (!file) return;
    setKeyFile(file);
    setSettingsData(prev => ({ 
      ...prev, 
      fiscalKeyFileName: file.name 
    }));
  };

  const uploadCertificates = async () => {
    if (!certificateFile || !keyFile) {
      setFileError('Please select both certificate and key files');
      return;
    }

    setUploadingCertificate(true);
    setUploadingKey(true);
    setFileError('');

    try {
      const b64Cer = await fileToBase64(certificateFile);
      const b64Key = await fileToBase64(keyFile);

      const response = await http.post('/api/financials/certificates', {
        b64Cer,
        b64Key,
        password: settingsData.password_key
      });

      setSettingsData(prev => ({ 
        ...prev, 
        certificatesUploaded: true,
        fiscalCertificateFileName: certificateFile.name,
        fiscalKeyFileName: keyFile.name
      }));
      
      console.log('Certificates uploaded successfully');
      alert('Certificates uploaded successfully!');
    } catch (error) {
      console.error('Error uploading certificates:', error);
      setFileError('Failed to upload certificates: ' + (error.response?.data?.message || error.message));
      setSettingsData(prev => ({ ...prev, certificatesUploaded: false }));
    } finally {
      setUploadingCertificate(false);
      setUploadingKey(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      console.log('Saving settings:', settingsData);
      await updateSetting(settingsData);
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = ['General', 'Agents', 'Integrations','Subscription','Dynamic Fields','Role Management', 'Discount Management', 'Message Templates'];

  // If still loading or there's no data yet, show loading
  if (loading) {
    return <div className="p-6 text-gray-500">Loading settings...</div>;
  }

  // Fallback to empty objects for individual settings if they don't exist
  const safeSettingsData = settingsData || {};

  // Debug state
  //console.log('Rendering with settingsData:', safeSettingsData);

  return (
    <div className="min-h-screen bg-purple-50">
       <header className="bg-white border-b border-purple-500">
              <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
              </div>
            </header>
      
      <div className="bg-white border-b border-gray-200">
       <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2">
  <div className="flex space-x-4">
    {tabs.map(tab => (
      <button
        key={tab}
        className={`px-6 py-3 text-sm font-medium ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        onClick={() => setActiveTab(tab)}
      >
        {tab}
      </button>
    ))}
  </div>

  <div className="flex items-center space-x-4">
    {activeTab === 'General' && (
      <>
        {showSaveMessage && (
          <span className="text-green-600 text-sm">Settings saved successfully!</span>
        )}
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSaving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </>
    )}
  </div>
</div>
        
      </div>

      {/* Content Container - Different layouts for different tabs */}
      {activeTab === 'Agents' ? (
        // Full width for UserManagement
        <div className="bg-gray-50">
          <UserManagement settings={settingsData} updateSetting={updateSetting} />
        </div>
      ) : activeTab === 'Discount Management' ? (
        // Full width for DiscountManagement
        <div className="bg-gray-50">
          <DiscountManagement />
        </div>
      ) : (
        // Constrained width for other tabs
        <div className="max-w-4xl mx-auto px-6 py-4">
          {activeTab === 'General' && (
            <>
              <h2 className="text-lg font-medium text-gray-700 mb-3">Company Information</h2>
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 mb-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <div className="flex items-center gap-3">
                    {/* Company Logo - Discrete */}
                    <div className="relative flex-shrink-0">
                      {safeSettingsData.companyImageUrl ? (
                        <img
                          src={safeSettingsData.companyImageUrl}
                          alt="Company Logo"
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                          <Building2 className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-full p-1 transition-colors"
                        title="Upload company logo"
                      >
                        {uploadingImage ? (
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="h-3 w-3" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                    
                    {/* Company Name Input */}
                    <div className="flex-1">
                      <input
                        type="text"
                        value={safeSettingsData.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter your company name"
                      />
                    </div>
                    
                    {/* Remove Button - Only show if image exists */}
                    {safeSettingsData.companyImageUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-gray-400 hover:text-red-600 text-xs px-2"
                        title="Remove logo"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {imageError && (
                    <p className="text-sm text-red-600 mt-1">{imageError}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Click the camera icon to upload your company logo
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={safeSettingsData.supportEmail || ''}
                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="support@yourcompany.com"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                  <input
                    type="text"
                    value={safeSettingsData.taxID || ''}
                    onChange={(e) => handleChange('taxID', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter tax ID"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={safeSettingsData.billingStreet || ''}
                    onChange={(e) => handleChange('billingStreet', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter street address"
                  />
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={safeSettingsData.billingCity || ''}
                      onChange={(e) => handleChange('billingCity', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={safeSettingsData.billingState || ''}
                      onChange={(e) => handleChange('billingState', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={safeSettingsData.billingCountry || ''}
                      onChange={(e) => handleChange('billingCountry', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Country"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={safeSettingsData.billingZip || ''}
                      onChange={(e) => handleChange('billingZip', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="ZIP"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Start time (e.g. 9:00 AM)"
                      value={safeSettingsData.startTime || ''}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="End time (e.g. 5:00 PM)"
                      value={safeSettingsData.endTime || ''}
                      onChange={(e) => handleChange('endTime', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                  <select
                    value={safeSettingsData.timeZone || ''}
                    onChange={(e) => handleChange('timeZone', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select a time zone</option>
                    <option value="Eastern Time (ET)">Eastern Time (ET)</option>
                    <option value="Pacific Time (PT)">Pacific Time (PT)</option>
                    <option value="Mountain Time (MT)">Mountain Time (MT)</option>
                    <option value="Central Time (CT)">Central Time (CT)</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asignacion</label>
                  <select
                    value={safeSettingsData.assignment_mode || ''}
                    onChange={(e) => handleChange('assignment_mode', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="single">Asignacion Admin</option>
                    <option value="carousel">Carusel</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                  <select
                    value={safeSettingsData.visibility || ''}
                    onChange={(e) => handleChange('visibility', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">Universal</option>
                    <option value="own">Private</option>
                  </select>
                </div>
              </div>

              <h2 className="text-lg font-medium text-gray-700 mb-3">Fiscal Information</h2>
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Enable Fiscal</h3>
                    <p className="text-xs text-gray-500">Toggle fiscal information and certifications</p>
                  </div>
                  
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="toggle-fiscal"
                      checked={Boolean(safeSettingsData.fiscalEnabled)}
                      onChange={() => handleChange('fiscalEnabled', !safeSettingsData.fiscalEnabled)}
                      className="sr-only"
                    />
                    <label 
                      htmlFor="toggle-fiscal"
                      className={`block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                        safeSettingsData.fiscalEnabled ? 'bg-indigo-600' : ''
                      }`}
                    >
                      <span className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                        safeSettingsData.fiscalEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}></span>
                    </label>
                  </div>
                </div>

                {safeSettingsData.fiscalEnabled && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Régimen Fiscal</label>
                      <select
                        value={safeSettingsData.regimenFiscal || ''}
                        onChange={(e) => handleChange('regimenFiscal', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select régimen fiscal</option>
                        <option value="601">601 - REGIMEN GENERAL DE LEY PERSONAS MORALES</option>
                        <option value="602">602 - RÉGIMEN SIMPLIFICADO DE LEY PERSONAS MORALES</option>
                        <option value="603">603 - PERSONAS MORALES CON FINES NO LUCRATIVOS</option>
                        <option value="604">604 - RÉGIMEN DE PEQUEÑOS CONTRIBUYENTES</option>
                        <option value="605">605 - RÉGIMEN DE SUELDOS Y SALARIOS E INGRESOS ASIMILADOS A SALARIOS</option>
                        <option value="606">606 - RÉGIMEN DE ARRENDAMIENTO</option>
                        <option value="607">607 - RÉGIMEN DE ENAJENACIÓN O ADQUISICIÓN DE BIENES</option>
                        <option value="608">608 - RÉGIMEN DE LOS DEMÁS INGRESOS</option>
                        <option value="609">609 - RÉGIMEN DE CONSOLIDACIÓN</option>
                        <option value="610">610 - RÉGIMEN RESIDENTES EN EL EXTRANJERO SIN ESTABLECIMIENTO PERMANENTE EN MÉXICO</option>
                        <option value="611">611 - RÉGIMEN DE INGRESOS POR DIVIDENDOS (SOCIOS Y ACCIONISTAS)</option>
                        <option value="612">612 - RÉGIMEN DE LAS PERSONAS FÍSICAS CON ACTIVIDADES EMPRESARIALES Y PROFESIONALES</option>
                        <option value="613">613 - RÉGIMEN INTERMEDIO DE LAS PERSONAS FÍSICAS CON ACTIVIDADES EMPRESARIALES</option>
                        <option value="614">614 - RÉGIMEN DE LOS INGRESOS POR INTERESES</option>
                        <option value="615">615 - RÉGIMEN DE LOS INGRESOS POR OBTENCIÓN DE PREMIOS</option>
                        <option value="616">616 - SIN OBLIGACIONES FISCALES</option>
                        <option value="617">617 - PEMEX</option>
                        <option value="618">618 - RÉGIMEN SIMPLIFICADO DE LEY PERSONAS FÍSICAS</option>
                        <option value="619">619 - INGRESOS POR LA OBTENCIÓN DE PRÉSTAMOS</option>
                        <option value="620">620 - SOCIEDADES COOPERATIVAS DE PRODUCCIÓN QUE OPTAN POR DIFERIR SUS INGRESOS</option>
                        <option value="621">621 - RÉGIMEN DE INCORPORACIÓN FISCAL</option>
                        <option value="622">622 - RÉGIMEN DE ACTIVIDADES AGRÍCOLAS, GANADERAS, SILVÍCOLAS Y PESQUERAS PM</option>
                        <option value="623">623 - RÉGIMEN DE OPCIONAL PARA GRUPOS DE SOCIEDADES</option>
                        <option value="624">624 - RÉGIMEN DE LOS COORDINADOS</option>
                        <option value="625">625 - RÉGIMEN DE LAS ACTIVIDADES EMPRESARIALES CON INGRESOS A TRAVÉS DE PLATAFORMAS TECNOLÓGICAS</option>
                        <option value="626">626 - RÉGIMEN SIMPLIFICADO DE CONFIANZA</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Certificate File (.cer)</label>
                      <div className="relative">
                        <input
                          type="file"
                          id="fiscal-certificate"
                          accept=".cer"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleCertificateUpload(file);
                            }
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="fiscal-certificate"
                          className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {certificateFile ? 'Change certificate file' : 'Click to upload certificate (.cer)'}
                          </span>
                        </label>
                        {certificateFile && (
                          <div className="mt-2 flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                            <div className="flex items-center gap-2">
                              <File className="w-4 h-4 text-indigo-600" />
                              <span className="text-sm text-gray-700">
                                {certificateFile.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCertificateFile(null)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Key File (.key)</label>
                      <div className="relative">
                        <input
                          type="file"
                          id="fiscal-key"
                          accept=".key"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleKeyUpload(file);
                            }
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="fiscal-key"
                          className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {keyFile ? 'Change key file' : 'Click to upload key (.key)'}
                          </span>
                        </label>
                        {keyFile && (
                          <div className="mt-2 flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                            <div className="flex items-center gap-2">
                              <File className="w-4 h-4 text-indigo-600" />
                              <span className="text-sm text-gray-700">
                                {keyFile.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setKeyFile(null)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Password</label>
                      <input
                        type="password"
                        value={safeSettingsData.password_key || ''}
                        onChange={(e) => handleChange('password_key', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter certificate password"
                      />
                    </div>

                    {/* Upload Certificates Button */}
                    <div className="mb-4">
                      <button
                        type="button"
                        onClick={uploadCertificates}
                        disabled={!certificateFile || !keyFile || !safeSettingsData.password_key || uploadingCertificate}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                          !certificateFile || !keyFile || !safeSettingsData.password_key || uploadingCertificate
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {uploadingCertificate ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Uploading Certificates...</span>
                          </div>
                        ) : (
                          'Upload Certificates'
                        )}
                      </button>
                      {safeSettingsData.certificatesUploaded && (
                        <div className="mt-3 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-700 font-medium">Certificates uploaded successfully</span>
                        </div>
                      )}
                      {safeSettingsData.validityCertificate && (
                        <div className="mt-3 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <span className="text-sm text-blue-700">
                            <span className="font-medium">Valid until:</span> {new Date(safeSettingsData.validityCertificate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {fileError && (
                        <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                          <X className="w-5 h-5 text-red-600" />
                          <span className="text-sm text-red-700">{fileError}</span>
                        </div>
                      )}
                    </div>

                    <div className="mb-4 grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Serie Invoice</label>
                        <input
                          type="text"
                          value={safeSettingsData.serie_invoice || ''}
                          onChange={(e) => handleChange('serie_invoice', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Serie invoice"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Serie Pago</label>
                        <input
                          type="text"
                          value={safeSettingsData.serie_pago || ''}
                          onChange={(e) => handleChange('serie_pago', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Serie pago"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Serie NC</label>
                        <input
                          type="text"
                          value={safeSettingsData.serie_nc || ''}
                          onChange={(e) => handleChange('serie_nc', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Serie NC"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <h2 className="text-lg font-medium text-gray-700 mb-3">Notification Settings</h2>
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
                {['emailNotif', 'desktopNotif', 'soundNotif']
    .filter(key => key !== 'emailNotif' && key !== 'desktopNotif')
    .map((key) => (
                  <div key={key} className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        {key === 'emailNotif' ? 'Email Notifications' : 
                         key === 'desktopNotif' ? 'Desktop Notifications' : 
                         'Sound Notifications'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Toggle {key === 'emailNotif' ? 'email' : 
                                key === 'desktopNotif' ? 'desktop' : 
                                'sound'} notifications
                      </p>
                    </div>
                    
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        id={`toggle-${key}`}
                        checked={Boolean(safeSettingsData[key])}
                        onChange={() => handleChange(key, !safeSettingsData[key])}
                        className="sr-only"
                      />
                      <label 
                        htmlFor={`toggle-${key}`}
                        className={`block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                          safeSettingsData[key] ? 'bg-indigo-600' : ''
                        }`}
                      >
                        <span className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                          safeSettingsData[key] ? 'translate-x-4' : 'translate-x-0'
                        }`}></span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'Integrations' && (
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
              <Integrations settings={settingsData} updateSetting={updateSetting} />
            </div>
          )}
          {activeTab === 'Dynamic Fields' && (
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
              <DynamicFieldsManagementPage />
            </div>
          )}

          {activeTab === 'Message Templates' && (
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500">Message templates configuration will appear here.</p>
            </div>
          )}
          
          {activeTab === 'Subscription' && (
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
              <Subscription settings={settingsData} updateSetting={updateSetting} />
            </div>
          )}

          {activeTab === 'Role Management' && (
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
              <RoleManagementPage />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsPage;