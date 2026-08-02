import { useState, useRef, useCallback, useEffect } from 'react';

export default function useSpeechRecognition(socket) {
  const [isListening, setIsListening] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);

  useEffect(() => {
    // 브라우저 지원 여부 확인
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("이 브라우저는 내장 음성 인식을 지원하지 않습니다. Chrome 혹은 Safari 최신 버전을 사용해주세요.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    // 안드로이드 크롬 버그(isFinal 결과가 중첩되는 현상)를 피하기 위해 
    // continuous를 false로 두고, onend에서 재시작하도록 합니다.
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      // onstart 시 기존 상태 초기화
    };

    recognition.onresult = (event) => {
      let newFinalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          newFinalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const displayText = newFinalTranscript || interimTranscript;
      if (displayText) {
        setCurrentText(displayText);
      }

      // 새로 완결된 텍스트가 있을 때만 서버로 전송합니다.
      if (socket && newFinalTranscript.trim().length > 0) {
        socket.emit('speech_text', {
          text: newFinalTranscript,
          isFinal: true
        });
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      if (event.error === 'network' && shouldListenRef.current) {
        setTimeout(() => {
          if (shouldListenRef.current) {
            try { recognition.start(); } catch(e) {}
          }
        }, 1000);
      } else if (event.error === 'not-allowed') {
        setIsListening(false);
        shouldListenRef.current = false;
      }
    };

    recognition.onend = () => {
      // 인식이 종료되었을 때, 사용자가 명시적으로 중지한 게 아니라면 재시작
      if (shouldListenRef.current) {
        try {
          recognition.start();
        } catch(e) {
          console.error(e);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
  }, [socket]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        shouldListenRef.current = true;
        recognitionRef.current.start();
        setIsListening(true);
      } catch(e) {
        console.error(e);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      shouldListenRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
      setCurrentText('');
    }
  }, [isListening]);

  return { isListening, currentText, startListening, stopListening };
}
