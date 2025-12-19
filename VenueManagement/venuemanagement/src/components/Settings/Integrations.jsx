import React, { useState, useEffect } from 'react';
import http from '../../config/http';

const GmailConnectButton = () => {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');

  const checkConnectionStatus = async () => {
    try {
      const res = await http.get('/api/gmailintegration/gmail/status');
      //console.log('Gmail connection status:', res.data);
      const { connected } = res.data;
      //console.log('Gmail connection status:', connected);
      setConnected(connected);
    } catch (err) {
      console.warn('Gmail not connected');
      setConnected(false);
    }
  };

  const connectGmail = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get full redirect URL by calling your backend (it does the Google redirect)
      const res = await http.get('/api/gmailintegration/gmail/connect'); // will be redirected
      // Axios won't follow the browser redirect, so use window.location
      // But actually, your backend already redirects — so we can go directly
      window.location.href = res.data.url;
    } catch (err) {
      console.error('Error starting Gmail OAuth:', err);
      setError('Failed to start Gmail connection');
    } finally {
      setLoading(false);
    }
  };

  const disconnectGmail = async () => {
    // Optional: You may want to implement this in your backend too
    alert('Disconnect not yet implemented on backend');
  };

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8, maxWidth: 400 }}>
      <h3>📧 Gmail Integration</h3>

      <p>
        Status:{' '}
        <strong style={{ color: connected ? 'green' : 'red' }}>
          {connected ? 'Connected' : 'Not Connected'}
        </strong>
      </p>

      {error && (
        <div style={{ color: 'red', marginBottom: 10 }}>
          {error}{' '}
          <button onClick={() => setError(null)} style={{ marginLeft: 8 }}>
            ✕
          </button>
        </div>
      )}

      {connected ? (
        <div>
          <p>Email: {email || 'Not available'}</p>
          <button onClick={disconnectGmail} disabled={loading}>
            {loading ? 'Disconnecting...' : 'Disconnect Gmail'}
          </button>
        </div>  
      ) : (
        <button onClick={connectGmail} disabled={loading}>
          {loading ? 'Connecting...' : 'Connect Gmail'}
        </button>
      )}
    </div>
  );
};

const Integrations = () => {
  return (
    <div style={{ padding: 20 }}>
      <h2>Integrations</h2>
      <GmailConnectButton />
    </div>
  );
};

export default Integrations;
