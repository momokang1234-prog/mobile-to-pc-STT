import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

function MobilePage() {
  const [socket, setSocket] = useState(null);
  const [socketStatus, setSocketStatus] = useState('Disconnected');
  const [inputEnabled, setInputEnabled] = useState(true);

  useEffect(() => {
    const newSocket = io({
      transports: ['polling', 'websocket']
    });
    setSocket(newSocket);

    newSocket.on('connect', () => setSocketStatus('Connected'));
    newSocket.on('disconnect', () => setSocketStatus('Disconnected'));
    newSocket.on('connect_error', (err) => setSocketStatus(`Error (${err.message})`));
    
    newSocket.on('input_status', (data) => {
      setInputEnabled(data.enabled);
    });

    return () => newSocket.disconnect();
  }, []);

  const { isListening, currentText, startListening, stopListening } = useSpeechRecognition(socket);

  const toggleInput = () => {
    const nextState = !inputEnabled;
    setInputEnabled(nextState);
    if (socket) {
      socket.emit('toggle_input', { enabled: nextState });
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '30px', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h2>📱 무선 음성 키보드</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ 
          padding: '8px 16px', 
          borderRadius: '20px', 
          backgroundColor: socketStatus === 'Connected' ? '#e6ffed' : '#ffeef0',
          color: socketStatus === 'Connected' ? '#22863a' : '#cb2431',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          🔌 {socketStatus}
        </div>
        
        <div 
          onClick={toggleInput}
          style={{ 
          padding: '8px 16px', 
          borderRadius: '20px', 
          backgroundColor: inputEnabled ? '#e6ffed' : '#fff3cd',
          color: inputEnabled ? '#22863a' : '#856404',
          fontWeight: 'bold',
          fontSize: '14px',
          cursor: 'pointer',
          border: '1px solid #ddd'
        }}>
          ⌨️ 입력 {inputEnabled ? 'ON' : 'OFF'}
        </div>
      </div>

      <div style={{
        minHeight: '80px',
        margin: '20px auto',
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa',
        color: '#333',
        fontSize: '18px',
        maxWidth: '400px',
        wordBreak: 'keep-all',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {currentText || <span style={{color: '#999'}}>인식된 텍스트가 여기에 표시됩니다</span>}
      </div>

      <div>
        <button 
          onClick={isListening ? stopListening : startListening}
          style={{
            padding: '20px 40px',
            fontSize: '22px',
            fontWeight: 'bold',
            backgroundColor: isListening ? '#ff4b4b' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            marginTop: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '300px'
          }}
        >
          {isListening ? '⏹ 중지 (Listening)' : '🎙 시작 (Click)'}
        </button>
      </div>

      <p style={{ marginTop: '30px', color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
        * 폰에 대고 말하면 PC의 현재 커서 위치에 실시간으로 입력됩니다.<br/>
        * PC에서 수동으로 타이핑할 때는 <b>입력 OFF</b>로 설정하세요.
      </p>
    </div>
  );
}

export default MobilePage;
