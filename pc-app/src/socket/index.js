function setupSocketHandlers(io, keyboardSimulator) {
  io.on('connection', (socket) => {
    console.log('[Socket] Client connected:', socket.id);

    let lastInterimLength = 0;
    let debounceTimer = null;

    // 연결 시 현재 입력 상태 전송
    socket.emit('input_status', {
      enabled: keyboardSimulator.isEnabled()
    });

    /**
     * 음성 텍스트 수신 → 키보드 시뮬레이션
     * data: { text: string, isFinal: boolean }
     */
    socket.on('speech_text', (data) => {
      const { text, isFinal } = data;

      if (!text) return;

      // 디바운스 타이머 클리어
      clearTimeout(debounceTimer);

      if (isFinal) {
        // === 확정 결과: 즉시 처리 ===
        clearTimeout(debounceTimer);

        keyboardSimulator.commitFinal(lastInterimLength, text);
        lastInterimLength = 0;

        console.log(`[STT] FINAL: "${text}"`);
      } else {
        // === 중간 결과: 100ms 디바운스 ===
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
          keyboardSimulator.replaceInterim(lastInterimLength, text);
          lastInterimLength = text.length;
        }, 100);
      }
    });

    /**
     * 입력 ON/OFF 토글
     * data: { enabled: boolean }
     */
    socket.on('toggle_input', (data) => {
      keyboardSimulator.setEnabled(data.enabled);
      // 모든 연결된 클라이언트에게 상태 브로드캐스트
      io.emit('input_status', { enabled: data.enabled });

      // 토글 시 interim 상태 리셋
      clearTimeout(debounceTimer);
      lastInterimLength = 0;
    });

    socket.on('disconnect', () => {
      clearTimeout(debounceTimer);
      lastInterimLength = 0;
      console.log('[Socket] Client disconnected:', socket.id);
    });
  });
}

module.exports = setupSocketHandlers;
