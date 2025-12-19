import React, { createContext, useContext, useEffect, useState } from 'react';
import http from '../config/http'

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  //const { currentUser } = useContext(UserContext);
  const userString = localStorage.getItem('userData'); 
  const [currentUser, setCurrentUser] = useState(userString ? JSON.parse(userString) : null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch settings when tenant is available
  useEffect(() => {
    const fetchSettings = async () => {
      const tenantId = currentUser?.tenantId;
      if (!tenantId) {
        console.warn('No tenantId found. Skipping settings fetch.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await http.get('/api/tenants', {
          headers: { tenantId: tenantId }
        });
        
        console.log('Settings fetched:', response.data);
        console.log('fiscalEnabled in response:', response.data?.fiscalEnabled);
        
        // Check if we have valid data
        if (response.data && response.data.settings) {
          //console.log('Setting settings state to:', response.data.settings);
          setSettings(response.data.settings);
        } else if (response.data) {
          // If settings is not nested under "settings" property
          console.log('Setting settings state directly to:', response.data);
          console.log('fiscalEnabled value being set:', response.data.fiscalEnabled);
          setSettings(response.data);
        } else {
          console.warn('No settings found in response');
          setSettings({});
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        setError(err);
        // Initialize with empty object on error
        setSettings({});
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [currentUser?.tenantId]);

  const updateSetting = async (updates) => {
    if (!currentUser?.tenantId) {
      console.error('Cannot update settings: tenantId not available');
      return;
    }

    try {
      console.log('Updating settings with:', updates);
      const response = await http.put('/api/tenants', updates, {
        headers: { tenantId: currentUser.tenantId }
      });

      console.log('Settings update response:', response.data);

      if (response.data.success) {
        // Create a new object to ensure React detects the change
        const newSettings = { ...settings, ...updates };
        console.log('New settings state after update:', newSettings);
        setSettings(newSettings);
        return true;
      } else {
        console.warn('Settings update was not successful');
        return false;
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  // Debug value whenever it changes


  return (
    <SettingsContext.Provider value={{ settings, updateSetting, loading, error }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);