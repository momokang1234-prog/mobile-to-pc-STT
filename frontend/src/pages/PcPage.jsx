import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  const hostname = window.location.hostname || 'localhost';
  return `http://${hostname}:5000`;
};

const SOCKET_URL = getSocketUrl();

function PcPage() {
  const [transcripts, setTranscripts] = useState([]);
  const [interimText, setInterimText] = useState('');
  const [socketStatus, setSocketStatus] = useState('Disconnected');

  useEffect(() => {
    const socket = io({
      transports: ['polling', 'websocket']
    });

    socket.on('connect', () => setSocketStatus('Connected'));
    socket.on('disconnect', () => setSocketStatus('Disconnected'));

    socket.on('stt_result', (data) => {
      if (data.isFinal) {
        setTranscripts((prev) => [...prev, data.text]);
        setInterimText('');
      } else {
        setInterimText(data.text);
      }
    });

    socket.on('server_error', (err) => {
      console.error('Server error:', err);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>PC Display (Live STT Results)</h2>
      <div style={{ 
        padding: '8px 16px', 
        display: 'inline-block', 
        borderRadius: '20px', 
        backgroundColor: socketStatus === 'Connected' ? '#e6ffed' : '#ffeef0',
        color: socketStatus === 'Connected' ? '#22863a' : '#cb2431',
        marginBottom: '20px',
        fontWeight: 'bold'
      }}>
        Backend: {socketStatus}
      </div>
      <div style={{ 
        border: '1px solid #ccc', 
        padding: '20px', 
        height: '400px', 
        overflowY: 'auto', 
        background: '#f9f9f9',
        borderRadius: '8px',
        fontSize: '18px',
        lineHeight: '1.6'
      }}>
        {transcripts.map((text, idx) => (
          <p key={idx} style={{ margin: '5px 0' }}>{text}</p>
        ))}
        {interimText && <p style={{ color: 'gray', fontStyle: 'italic' }}>{interimText} ...</p>}
      </div>
    </div>
  );
}

export default PcPage;
