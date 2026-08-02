import { useState, useRef, useCallback, useEffect } from 'react';

export default function useSpeechRecognition(socket) {
  const [isListening, setIsListening] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const lastSentTextRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("이 브라우저는 내장 음성 인식을 지원하지 않습니다. Chrome 혹은 Safari 최신 버전을 사용해주세요.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      lastSentTextRef.current = '';
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

      const text = newFinalTranscript || interimTranscript;
      if (text) {
        setCurrentText(text);
      }

      if (socket) {
        const lastText = lastSentTextRef.current;
        let commonLen = 0;
        const minLen = Math.min(lastText.length, text.length);
        while (commonLen < minLen && lastText[commonLen] === text[commonLen]) {
          commonLen++;
        }

        const deleteCount = lastText.length - commonLen;
        let appendText = text.slice(commonLen);
        const isFinal = !!newFinalTranscript;

        if (isFinal) {
          appendText += ' ';
        }

        if (deleteCount > 0 || appendText.length > 0) {
          socket.emit('speech_diff', {
            deleteCount,
            typeText: appendText
          });
          
          if (isFinal) {
            lastSentTextRef.current = '';
          } else {
            lastSentTextRef.current = text;
          }
        }
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
