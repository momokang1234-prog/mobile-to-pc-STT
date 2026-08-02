import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Monitor, Smartphone, Wifi, Power } from 'lucide-react';

const App = () => {
  const [serverIp, setServerIp] = useState('');
  const [port, setPort] = useState(5000);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // In Electron, we can use window.electronAPI if we set up preload, 
    // or just fetch from local express api. 
    // Wait, ip.address() doesn't work in browser if not exposed.
    // Let's fetch the IP from the electron main process via preload or IPC, 
    // but without preload we can just fetch from localhost:5000/api/info.
    fetch('http://localhost:5000/api/info')
      .then(res => res.json())
      .then(data => {
        setServerIp(data.ip);
        setPort(data.port);
      })
      .catch(err => {
        console.error('Failed to get server info:', err);
      });
  }, []);

  const connectUrl = serverIp ? `http://${serverIp}:${port}` : 'Waiting for network...';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
          <Monitor size={32} color="#60a5fa" />
          <Wifi size={20} color="#94a3b8" />
          <Smartphone size={32} color="#60a5fa" />
        </div>
        
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: '700', color: '#f8fafc' }}>
          Mobile to PC STT
        </h1>
        <p style={{ margin: '0 0 2rem 0', color: '#94a3b8', fontSize: '0.95rem' }}>
          Scan to connect your phone as a microphone
        </p>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          display: 'inline-block',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}>
          {serverIp ? (
            <QRCodeSVG value={connectUrl} size={200} level="H" includeMargin={false} />
          ) : (
            <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              Loading...
            </div>
          )}
        </div>

        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
              Server Address
            </div>
            <div style={{ fontSize: '1.1rem', fontFamily: 'monospace', color: '#38bdf8', marginTop: '0.25rem' }}>
              {connectUrl}
            </div>
          </div>
          <div style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            background: serverIp ? '#22c55e' : '#ef4444',
            boxShadow: serverIp ? '0 0 10px #22c55e' : '0 0 10px #ef4444'
          }} />
        </div>
      </div>
    </div>
  );
}

export default App;
